import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
// Using a specific version of PDFKit that is known to work well in Deno/ESM environments
import PDFDocument from 'https://esm.sh/pdfkit@0.13.0/js/pdfkit.js' 
import { format } from 'https://esm.sh/date-fns@3.6.0'

// Helper function to format KES currency
const formatKes = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // 1. Authentication Check (Manual)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }
  
  try {
    const { paymentId, exchangeRate } = await req.json();

    if (!paymentId || !exchangeRate) {
        return new Response(JSON.stringify({ error: 'Missing paymentId or exchangeRate' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 2. Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 3. Fetch Payment Data
    const PAYMENT_SELECT_FIELDS = `
        id, 
        group_id, 
        beneficiary_id, 
        amount_kes, 
        payment_run_id, 
        notes, 
        date_paid, 
        created_at,
        groups (name),
        beneficiaries (full_name)
    `;
    
    const { data: paymentData, error: fetchError } = await supabase
        .from('beneficiary_payments')
        .select(PAYMENT_SELECT_FIELDS)
        .eq('id', paymentId)
        .single();

    if (fetchError || !paymentData) {
        console.error('Fetch Error:', fetchError);
        return new Response(JSON.stringify({ error: 'Payment not found or access denied.' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Map data to a usable structure
    const payment = {
        id: paymentData.id,
        groupName: (paymentData.groups as { name: string }).name,
        beneficiaryName: (paymentData.beneficiaries as { full_name: string }).full_name,
        amountKes: parseFloat(paymentData.amount_kes.toString()),
        paymentRunId: paymentData.payment_run_id,
        notes: paymentData.notes,
        datePaid: new Date(paymentData.date_paid),
    };

    // 4. Generate PDF
    const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50 
    });
    
    const buffers: Uint8Array[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {});

    const PADDING = 50;
    const VOUCHER_WIDTH = 500;
    let y = PADDING;

    // --- Header ---
    doc.fontSize(18).font('Helvetica-Bold').text('Maranatha FMS', PADDING, y);
    doc.fontSize(10).font('Helvetica').text('Beneficiary Payment Voucher', PADDING, y + 20);
    
    doc.fontSize(12).font('Helvetica-Bold').text(`Voucher ID: ${payment.id.substring(0, 8)}`, PADDING + VOUCHER_WIDTH - 150, y, { width: 150, align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Date Paid: ${format(payment.datePaid, 'PPP')}`, PADDING + VOUCHER_WIDTH - 150, y + 18, { width: 150, align: 'right' });
    doc.fontSize(10).text(`Transaction ID: ${payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A'}`, PADDING + VOUCHER_WIDTH - 150, y + 30, { width: 150, align: 'right' });

    y += 60;
    doc.moveTo(PADDING, y).lineTo(PADDING + VOUCHER_WIDTH, y).stroke(); // Separator line

    // --- Recipient Details ---
    y += 15;
    doc.fontSize(10).font('Helvetica-Bold').text('Paid To:', PADDING, y);
    doc.fontSize(14).font('Helvetica-Bold').text(payment.beneficiaryName, PADDING, y + 15);
    
    doc.fontSize(10).font('Helvetica-Bold').text('Source Group:', PADDING + VOUCHER_WIDTH / 2, y);
    doc.fontSize(14).font('Helvetica-Bold').text(payment.groupName, PADDING + VOUCHER_WIDTH / 2, y + 15);
    y += 40;

    // --- Payment Details Table ---
    const tableTop = y;
    const col1 = PADDING;
    const col2 = PADDING + 300;
    const col3 = PADDING + 400;
    const rowHeight = 20;

    // Table Header
    doc.fillColor('#000').rect(col1, tableTop, VOUCHER_WIDTH, rowHeight).fill('#f0f0f0');
    doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text('Description', col1 + 5, tableTop + 6);
    doc.text('Rate', col2, tableTop + 6, { width: 95, align: 'right' });
    doc.text('Amount (KES)', col3, tableTop + 6, { width: 95, align: 'right' });

    // Table Row 1: Payment Amount
    y = tableTop + rowHeight;
    doc.fillColor('#000').rect(col1, y, VOUCHER_WIDTH, rowHeight).fill('#ffffff').stroke();
    doc.fillColor('#000').font('Helvetica').text('Beneficiary Payment', col1 + 5, y + 6);
    doc.text(parseFloat(exchangeRate).toFixed(2), col2, y + 6, { width: 95, align: 'right' });
    doc.text(formatKes(payment.amountKes), col3, y + 6, { width: 95, align: 'right' });
    y += rowHeight;

    // Table Row 2: Total
    doc.fillColor('#000').rect(col1, y, VOUCHER_WIDTH, rowHeight).fill('#f0f0f0').stroke();
    doc.fillColor('#000').font('Helvetica-Bold').text('TOTAL AMOUNT PAID', col1 + 5, y + 6);
    doc.text(formatKes(payment.amountKes), col3, y + 6, { width: 95, align: 'right' });
    y += rowHeight + 20;

    // --- Notes ---
    doc.fontSize(10).font('Helvetica-Bold').text('Notes:', PADDING, y);
    doc.fontSize(10).font('Helvetica').text(payment.notes || 'N/A', PADDING, y + 15, { width: VOUCHER_WIDTH });
    y += 50;

    // --- Signatures ---
    const signatureY = y;
    const signatureLineLength = 180;
    const signatureSpacing = 100;

    // Column 1: Authorization
    doc.fontSize(10).font('Helvetica-Bold').text('Authorization', PADDING, signatureY);
    
    // Prepared By
    doc.moveTo(PADDING, signatureY + 40).lineTo(PADDING + signatureLineLength, signatureY + 40).stroke();
    doc.fontSize(8).font('Helvetica').text('Prepared By (FMS User)', PADDING, signatureY + 45);

    // Approved By
    doc.moveTo(PADDING, signatureY + 90).lineTo(PADDING + signatureLineLength, signatureY + 90).stroke();
    doc.fontSize(8).font('Helvetica').text('Approved By (Manager)', PADDING, signatureY + 95);

    // Column 2: Recipient Confirmation
    const col2X = PADDING + VOUCHER_WIDTH / 2;
    doc.fontSize(10).font('Helvetica-Bold').text('Recipient Confirmation', col2X, signatureY);

    // Recipient Signature
    doc.moveTo(col2X, signatureY + 40).lineTo(col2X + signatureLineLength, signatureY + 40).stroke();
    doc.fontSize(8).font('Helvetica').text('Recipient Signature (Beneficiary/Guardian)', col2X, signatureY + 45);

    // Date Received
    doc.moveTo(col2X, signatureY + 90).lineTo(col2X + signatureLineLength, signatureY + 90).stroke();
    doc.fontSize(8).font('Helvetica').text('Date Received', col2X, signatureY + 95);

    doc.end();

    // 5. Return PDF
    const pdfBuffer = await new Promise<Uint8Array>((resolve) => {
        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher_${payment.id.substring(0, 8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});