import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1' 
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

    // 4. Generate PDF using jsPDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const MARGIN = 15;
    let y = MARGIN;
    const LINE_HEIGHT = 7;
    const VOUCHER_WIDTH = 180; // A4 width is 210mm, so 180mm width is good

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Maranatha FMS', MARGIN, y);
    y += LINE_HEIGHT;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary Payment Voucher', MARGIN, y);
    
    // Right aligned header info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Voucher ID: ${payment.id.substring(0, 8)}`, MARGIN + VOUCHER_WIDTH, y - LINE_HEIGHT, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Paid: ${format(payment.datePaid, 'PPP')}`, MARGIN + VOUCHER_WIDTH, y, { align: 'right' });
    y += LINE_HEIGHT;
    doc.text(`Transaction ID: ${payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A'}`, MARGIN + VOUCHER_WIDTH, y, { align: 'right' });
    y += LINE_HEIGHT * 2;

    // Separator line
    doc.line(MARGIN, y, MARGIN + VOUCHER_WIDTH, y);
    y += LINE_HEIGHT;

    // --- Recipient Details ---
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Paid To:', MARGIN, y);
    doc.text('Source Group:', MARGIN + VOUCHER_WIDTH / 2, y);
    y += LINE_HEIGHT;
    
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text(payment.beneficiaryName, MARGIN, y);
    doc.text(payment.groupName, MARGIN + VOUCHER_WIDTH / 2, y);
    y += LINE_HEIGHT * 2;

    // --- Payment Details Table ---
    const tableHeaders = ['Description', 'Rate (KR/KES)', 'Amount (KES)'];
    const tableData = [
        ['Beneficiary Payment', parseFloat(exchangeRate).toFixed(2), formatKes(payment.amountKes)],
    ];
    
    const colWidths = [100, 40, 40];
    let currentX = MARGIN;
    const tableY = y;

    // Draw Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, tableY, VOUCHER_WIDTH, LINE_HEIGHT, 'F');
    doc.setFontSize(10).setFont('helvetica', 'bold');
    
    currentX = MARGIN;
    tableHeaders.forEach((header, index) => {
        doc.text(header, currentX + 1, tableY + LINE_HEIGHT / 2 + 1, { align: index === 0 ? 'left' : 'right', baseline: 'middle', maxWidth: colWidths[index] - 2 });
        currentX += colWidths[index];
    });
    y += LINE_HEIGHT;

    // Draw Table Rows
    doc.setFontSize(10).setFont('helvetica', 'normal');
    tableData.forEach(row => {
        currentX = MARGIN;
        doc.rect(MARGIN, y, VOUCHER_WIDTH, LINE_HEIGHT, 'S'); // Draw border
        row.forEach((cell, index) => {
            doc.text(cell, currentX + 1, y + LINE_HEIGHT / 2 + 1, { align: index === 0 ? 'left' : 'right', baseline: 'middle', maxWidth: colWidths[index] - 2 });
            currentX += colWidths[index];
        });
        y += LINE_HEIGHT;
    });

    // Draw Total Row
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, LINE_HEIGHT, 'F');
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT PAID', MARGIN + 1, y + LINE_HEIGHT / 2 + 1, { baseline: 'middle' });
    doc.text(formatKes(payment.amountKes), MARGIN + VOUCHER_WIDTH - 1, y + LINE_HEIGHT / 2 + 1, { align: 'right', baseline: 'middle' });
    y += LINE_HEIGHT * 2;

    // --- Notes ---
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Notes:', MARGIN, y);
    y += LINE_HEIGHT / 2;
    doc.setFont('helvetica', 'normal');
    doc.text(payment.notes || 'N/A', MARGIN, y, { maxWidth: VOUCHER_WIDTH });
    y += LINE_HEIGHT * 3;

    // --- Signatures ---
    const signatureY = y;
    const signatureLineLength = 80;
    const signatureSpacing = 10;
    const signatureTextYOffset = 5;

    // Column 1: Authorization
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Authorization', MARGIN, signatureY);
    
    // Prepared By
    doc.line(MARGIN, signatureY + 20, MARGIN + signatureLineLength, signatureY + 20);
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text('Prepared By (FMS User)', MARGIN, signatureY + 20 + signatureTextYOffset);

    // Approved By
    doc.line(MARGIN, signatureY + 50, MARGIN + signatureLineLength, signatureY + 50);
    doc.text('Approved By (Manager)', MARGIN, signatureY + 50 + signatureTextYOffset);

    // Column 2: Recipient Confirmation
    const col2X = MARGIN + VOUCHER_WIDTH / 2;
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Recipient Confirmation', col2X, signatureY);

    // Recipient Signature
    doc.line(col2X, signatureY + 20, col2X + signatureLineLength, signatureY + 20);
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text('Recipient Signature (Beneficiary/Guardian)', col2X, signatureY + 20 + signatureTextYOffset);

    // Date Received
    doc.line(col2X, signatureY + 50, col2X + signatureLineLength, signatureY + 50);
    doc.text('Date Received', col2X, signatureY + 50 + signatureTextYOffset);

    // 5. Return PDF
    const pdfBuffer = doc.output('arraybuffer');
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    return new Response(pdfUint8Array, {
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