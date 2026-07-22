import { jsPDF } from 'jspdf';

export const generateReceiptPDF = (purchase) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header Banner Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');

    // Header Banner Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('VELOCITY SYSTEMS LUXURY DEALERSHIP', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Premium Vehicles & Luxury Automobile Services', 15, 28);
    doc.text('Authorized Agent System', 15, 33);

    const isMulti = Array.isArray(purchase);
    const items = isMulti ? purchase : [purchase];
    const mainPurchase = items[0];

    const receiptNo = mainPurchase?.receiptNo || 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = mainPurchase?.createdAt ? new Date(mainPurchase.createdAt).toLocaleString() : new Date().toLocaleString();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Receipt: ${receiptNo}`, pageWidth - 15, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const dateVal = mainPurchase?.createdAt ? new Date(mainPurchase.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Date: ${dateVal}`, pageWidth - 15, 26, { align: 'right' });
    doc.text('Status: PAID', pageWidth - 15, 34, { align: 'right' });

    // Indigo Accent Line
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 45, 210, 2, 'F');

    // 2. Seller and Buyer Information Columns
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('SELLER / DEALER:', 15, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(mainPurchase?.sellerName || 'VeloCity Systems Dealership Group Ltd.', 15, 67);
    doc.text('100 Innovation Way, Tech District', 15, 73);
    doc.text('Silicon Valley, CA 94025', 15, 79);
    doc.text('Email: sales@velocitysystemsdealership.com', 15, 85);

    // Buyer Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('BUYER / CUSTOMER:', 110, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${mainPurchase?.buyerName || 'N/A'}`, 110, 67);
    doc.text(`Email: ${mainPurchase?.buyerEmail || 'N/A'}`, 110, 73);
    doc.text(`Category: ${mainPurchase?.buyerCategory || 'Customer'}`, 110, 79);
    doc.text(`Account ID: ${mainPurchase?.buyerId || 'Guest'}`, 110, 85);

    // Horizontal Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 95, 195, 95);

    // 3. Purchase Details Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(99, 102, 241);
    doc.text('PURCHASED ITEM DESCRIPTION', 15, 105);

    // Table Header Box
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 110, 180, 8, 'F');
    doc.rect(15, 110, 180, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM SPECIFICATION', 20, 115.5);
    doc.text('VALUE / DESCRIPTION', 85, 115.5);

    // Table rows mapping
    const rows = [];
    if (items.length === 1) {
      rows.push(
        { label: 'Vehicle Manufacturer', val: mainPurchase?.make || 'N/A' },
        { label: 'Model Name', val: mainPurchase?.model || 'N/A' },
        { label: 'Body Category', val: mainPurchase?.category || 'N/A' },
        { label: 'Unique Identifier (ID)', val: mainPurchase?.vehicleId || 'N/A' },
        { label: 'Transaction Timestamp', val: dateStr },
        { label: 'Payment Method', val: 'Digital Payment' }
      );
    } else {
      items.forEach((item, index) => {
        rows.push({ label: `Item #${index + 1}: ${item.make} ${item.model}`, val: `${item.category} ($${item.price?.toLocaleString()})` });
      });
      rows.push(
        { label: 'Transaction Timestamp', val: dateStr },
        { label: 'Payment Method', val: 'Digital Payment' }
      );
    }

    const tableHeight = rows.length * 7.5;
    
    // Table Content Grid Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 118, 180, tableHeight, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    rows.forEach((row, index) => {
      const yPos = 123.5 + index * 7.5;
      doc.setFont('helvetica', 'bold');
      doc.text(row.label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(row.val, 85, yPos);
      if (index < rows.length - 1) {
        doc.line(15, yPos + 2.5, 195, yPos + 2.5);
      }
    });

    const totalsY = 120 + tableHeight + 5;

    // 4. Totals Block
    doc.setFillColor(248, 250, 252);
    doc.rect(110, totalsY, 85, 18, 'F');
    doc.rect(110, totalsY, 85, 18, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('TOTAL AMOUNT:', 115, totalsY + 11);

    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    const grandTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grandTotal);
    doc.text(formattedPrice, 150, totalsY + 11);

    // Stamp / Signatures
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.rect(20, totalsY, 45, 18, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text('AUTHORIZED', 26, totalsY + 7);
    doc.text('PAID STAMP', 28, totalsY + 13);

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Terms: All vehicle sales include standard dealer warranties and manufacturer documentation.', 15, totalsY + 32);
    doc.text('For assistance, please email support@velocitysystemsdealership.com.', 15, totalsY + 38);

    // Save PDF
    doc.save(`receipt_${receiptNo}.pdf`);
  } catch (e) {
    console.error('Failed to generate PDF:', e);
  }
};
