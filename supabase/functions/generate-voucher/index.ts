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

// Placeholder for the user who recorded the payment (using a fixed name for the voucher)
const recordedBy = "Administrator"; 

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
    const VOUCHER_WIDTH = 180; 
    const CENTER = MARGIN + VOUCHER_WIDTH / 2;
    const RIGHT_ALIGN_X = MARGIN + VOUCHER_WIDTH;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // --- 1. Header Block (Logo, Org Info, Voucher Title) ---
    
    // Logo Placeholder (Blue Square)
    const logoSize = 10;
    doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.rect(MARGIN, y, logoSize, logoSize, 'F');
    
    // Organization Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Maranatha Faith Assemblies', MARGIN + logoSize + 5, y + logoSize / 2 + 1);
    
    // Organization Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Turkana North-Rift Region', MARGIN + logoSize + 5, y + logoSize + 2);
    
    y += logoSize + LINE_HEIGHT * 2; // Move y down after org info

    // Main Title
    doc.setFontSize(18).setFont('helvetica', 'bold');
    doc.text('PAYMENT VOUCHER', CENTER, y, { align: 'center' });
    
    y += LINE_HEIGHT * 1.5;
    
    // --- 2. Voucher Metadata (ID, Date, Transaction ID) ---
    
    doc.setFontSize(10).setFont('helvetica', 'normal');
    
    // Draw a light gray box for metadata
    const metaBoxHeight = LINE_HEIGHT * 3;
    doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, metaBoxHeight, 'F');
    
    const metaX1 = MARGIN + 5;
    
    // Left Column (Labels)
    doc.setFont('helvetica', 'bold');
    doc.text('Voucher ID:', metaX1, y + LINE_HEIGHT * 0.8);
    doc.text('Date Paid:', metaX1, y + LINE_HEIGHT * 1.8);
    doc.text('Transaction ID:', metaX1, y + LINE_HEIGHT * 2.8);
    
    // Left Column (Values)
    doc.setFont('helvetica', 'normal');
    doc.text(payment.id.substring(0, 8), metaX1 + 30, y + LINE_HEIGHT * 0.8);
    doc.text(format(payment.datePaid, 'MMMM do, yyyy'), metaX1 + 30, y + LINE_HEIGHT * 1.8);
    doc.text(payment.paymentRunId ? payment.paymentRunId.substring(0, 8) : 'N/A', metaX1 + 30, y + LINE_HEIGHT * 2.8);
    
    y += metaBoxHeight + LINE_HEIGHT;

    // --- 3. Paid To Details (Beneficiary, Group) ---
    
    doc.setFontSize(12).setFont('helvetica', 'bold').text('Paid To:', MARGIN, y);
    y += LINE_HEIGHT;
    
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text('Beneficiary Name:', MARGIN, y);
    doc.setFont('helvetica', 'bold');
    doc.text(payment.beneficiaryName, MARGIN + 40, y);
    y += LINE_HEIGHT;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Source Group:', MARGIN, y);
    doc.setFont('helvetica', 'bold');
    doc.text(payment.groupName, MARGIN + 40, y);
    y += LINE_HEIGHT * 2;

    // --- 4. Payment Table ---
    
    const tableTop = y;
    const col1Width = 100; // Description
    const col2Width = 30;  // Rate
    const col3Width = 50;  // Amount
    const rowHeight = 8;

    // Table Header
    doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.rect(MARGIN, tableTop, VOUCHER_WIDTH, rowHeight, 'F');
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    doc.text('Description', MARGIN + 2, tableTop + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text('Rate (KR/KES)', MARGIN + col1Width + col2Width - 2, tableTop + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    doc.text('Amount (KES)', RIGHT_ALIGN_X - 2, tableTop + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    
    y += rowHeight;

    // Table Row 1: Payment Amount
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, rowHeight); // Draw border
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text('Beneficiary payment', MARGIN + 2, y + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text(exRate.toFixed(2), MARGIN + col1Width + col2Width - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    doc.text(formatKes(payment.amountKes), RIGHT_ALIGN_X - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    y += rowHeight;

    // Table Row 2: Total
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, RIGHT_ALIGN_X, y); // Top border of total row
    y += 1; // Small gap
    
    doc.setFontSize(12).setFont('helvetica', 'bold');
    doc.text('TOTAL', MARGIN + 2, y + rowHeight / 2 + 1, { baseline: 'middle' });
    doc.text(formatKes(payment.amountKes), RIGHT_ALIGN_X - 2, y + rowHeight / 2 + 1, { align: 'right', baseline: 'middle' });
    y += rowHeight + 1;
    
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, RIGHT_ALIGN_X, y); // Bottom border of total row
    y += LINE_HEIGHT * 2;

    // --- 5. Notes Section ---
    
    doc.setFontSize(12).setFont('helvetica', 'bold').text('Payment Notes:', MARGIN, y);
    y += LINE_HEIGHT / 2;
    
    const notesBoxHeight = LINE_HEIGHT * 3;
    const notesTextContent = payment.notes || 'N/A';
    
    // Draw border around notes box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN, y, VOUCHER_WIDTH, notesBoxHeight);
    
    // Draw notes text
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.text(notesTextContent, MARGIN + 2, y + 4, { maxWidth: VOUCHER_WIDTH - 4 });
    
    y += notesBoxHeight + LINE_HEIGHT * 2;

    // --- 6. Signatures Section ---
    
    const col1X = MARGIN;
    const col2X = MARGIN + VOUCHER_WIDTH / 2;
    const sigLineLength = VOUCHER_WIDTH / 2 - 10;
    const sigY = y + LINE_HEIGHT * 3;

    // Signature Lines
    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 0, 0);
    
    // Authorization Signature Line
    doc.line(col1X, sigY, col1X + sigLineLength, sigY);
    
    // Recipient Signature Line
    doc.line(col2X, sigY, col2X + sigLineLength, sigY);
    
    y = sigY + 3;
    
    // Titles
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text('Authorized By', col1X, y);
    doc.text('Received By (Beneficiary/Guardian)', col2X, y);
    
    y += LINE_HEIGHT;
    
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text(`Name: ${recordedBy}`, col1X, y);
    doc.text(`Name: ${payment.beneficiaryName}`, col2X, y);
    
    y += LINE_HEIGHT;
    
    doc.text(`Date: ${format(new Date(), 'yyyy-MM-dd')}`, col1X, y);
    doc.text(`ID/Phone: N/A`, col2X, y); // Placeholder for ID/Phone

    // --- Footer ---
    doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(100);
    doc.text("System generated by Maranatha FMS", MARGIN, 290);

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