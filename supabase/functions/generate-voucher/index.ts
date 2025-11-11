import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1' 
import { format } from 'https://esm.sh/date-fns@3.6.0'

// Helper function to format KES currency (with two decimals for table)
const formatKes = (amount: number): string => {
  return `Ksh ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define colors (using RGB for jsPDF compatibility)
const PRIMARY_BLUE = [30, 64, 175]; // Tailwind blue-700 equivalent
const LIGHT_GRAY = [240, 240, 240];

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
    
    // Placeholder for the user who recorded the payment (using a fixed name for the voucher)
    const recordedBy = "Administrator"; 
    const exRate = parseFloat(exchangeRate);

    // 4. Generate PDF using jsPDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const MARGIN = 15;
    let y = MARGIN;
    const LINE_HEIGHT = 6;
    const VOUCHER_WIDTH = 180; // A4 width is 210mm, so 180mm width is good
    const RIGHT_ALIGN_X = MARGIN + VOUCHER_WIDTH;

    // --- Header ---
    
    // Logo Placeholder (Blue Square)
    const logoSize = 10;
    doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.rect(MARGIN, y, logoSize, logoSize, 'F');
    
    // Organization Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Maranatha Faith Assemblies', MARGIN + logoSize + 5, y + logoSize / 2 + 1);
    
    // Organization Subtitle
    y += logoSize + 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Turkana North-Rift Region', MARGIN + logoSize + 5, y);
    
    // Right aligned header info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Voucher ID: ${payment.id.substring(0, 8)}`, RIGHT_ALIGN_X, MARGIN, { align: 'right' });
    doc.text(`Transaction ID: ${payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A'}`, RIGHT_ALIGN_X, MARGIN + LINE_HEIGHT);
    doc.text(`Date Paid: ${format(payment.datePaid, 'MMMM do, yyyy')}`, RIGHT_ALIGN_X, MARGIN + LINE_HEIGHT * 2);
    
    y += LINE_HEIGHT * 3; // Move past the header section

    // --- Notes Section ---
    y += LINE_HEIGHT;
    doc.setFontSize(12).setFont('helvetica', 'bold').text('Notes:', MARGIN, y);
    y += LINE_HEIGHT / 2;
    
    const notesBoxHeight = LINE_HEIGHT * 2;
    const notesText = payment.notes || 'N/A';
    
    // Draw light gray background box
    doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, notesBoxHeight, 'F');
    
    // Draw blue left border
    doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.setLineWidth(1);
    doc.line(MARGIN, y, MARGIN, y + notesBoxHeight);
    
    // Draw notes text
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(notesText, MARGIN + 3, y + notesBoxHeight / 2 + 1, { baseline: 'middle', maxWidth: VOUCHER_WIDTH - 5 });
    
    y += notesBoxHeight + LINE_HEIGHT * 2;

    // --- Payment Table ---
    const tableTop = y;
    const col1Width = 100;
    const col2Width = 30;
    const col3Width = 50;
    const rowHeight = 8;

    // Table Header
    doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.rect(MARGIN, tableTop, VOUCHER_WIDTH, rowHeight, 'F');
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    doc.text('Description', MARGIN + 2, tableTop + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text('Rate', MARGIN + col1Width + col2Width - 2, tableTop + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    doc.text('Amount', RIGHT_ALIGN_X - 2, tableTop + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    
    y += rowHeight;

    // Table Row 1: Payment Amount
    doc.setFillColor(255, 255, 255);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, rowHeight, 'F');
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text('Beneficiary payment', MARGIN + 2, y + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text(exRate.toFixed(2), MARGIN + col1Width + col2Width - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    doc.text(formatKes(payment.amountKes), RIGHT_ALIGN_X - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    y += rowHeight;

    // Table Row 2: Total
    doc.setFillColor(255, 255, 255);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, rowHeight, 'F');
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT PAID', MARGIN + 2, y + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text(formatKes(payment.amountKes).replace('Ksh ', ''), RIGHT_ALIGN_X - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    y += rowHeight;
    
    // Final separator line for the table
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(MARGIN, y, RIGHT_ALIGN_X, y);
    y += LINE_HEIGHT * 4;

    // --- Signatures Section ---
    const col1X = MARGIN;
    const col2X = MARGIN + VOUCHER_WIDTH / 2;
    const sigLineLength = VOUCHER_WIDTH / 2 - 10;

    // Titles
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text('Authorization', col1X, y);
    doc.text('Recipient', col2X, y);
    y += LINE_HEIGHT;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10).setFont('helvetica', 'normal');
    
    // Prepared By
    doc.text(`Prepared by: ${recordedBy}`, col1X, y);
    
    // Recipient
    doc.text(`Beneficiary: ${payment.beneficiaryName}`, col2X, y);
    y += LINE_HEIGHT * 3;

    // Signature Lines (Minimal)
    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 0, 0);
    
    // Prepared By Signature Line
    doc.line(col1X, y, col1X + sigLineLength, y);
    doc.setFontSize(8).text('Signature', col1X, y + 3);
    
    // Recipient Signature Line
    doc.line(col2X, y, col2X + sigLineLength, y);
    doc.text('Signature', col2X, y + 3);

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