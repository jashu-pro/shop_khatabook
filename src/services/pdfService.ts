import { jsPDF } from 'jspdf';
import type { Customer, LedgerEntry, Shop } from '../types';

/**
 * PDF Export Service for Shop KhattaBook / Credora
 */

/**
 * 1. Generate & Download PDF Statement for a Single Customer
 */
export const downloadSingleCustomerPDF = (
  customer: Customer,
  ledgerEntries: LedgerEntry[],
  shop: Shop | null
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const shopName = shop?.name || 'Sri Laxmi Traders';
  const shopLoc = `${shop?.village_town || ''}, ${shop?.district || ''}`;
  const shopGst = shop?.gstin ? `GSTIN: ${shop.gstin}` : '';
  const shopUpi = shop?.upi_id ? `UPI: ${shop.upi_id}` : '';

  // Colors
  const primaryColor = [5, 150, 105]; // Emerald #059669
  const darkColor = [15, 23, 42]; // #0f172a
  const debtColor = [220, 38, 38]; // Red #dc2626
  const textMuted = [100, 116, 139]; // #64748b

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(shopName.toUpperCase(), 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shopLoc} | ${shopGst} ${shopUpi}`, 14, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CUSTOMER KHATTA STATEMENT', 135, 16);

  // 2. Customer Info Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 182, 34, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 34, 3, 3, 'D');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(customer.name, 20, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Phone: ${customer.phone}`, 20, 51);
  doc.text(`Village / Location: ${customer.village}`, 20, 57);

  // Calculate Customer Totals
  const custEntries = ledgerEntries.filter(l => l.customer_id === customer.id);
  const totalUdhaar = custEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalJama = custEntries.reduce((sum, e) => sum + e.credit, 0);
  const currentBalance = custEntries.length > 0 ? custEntries[custEntries.length - 1].running_balance : 0;

  // Debt Summary Box on Right
  doc.setTextColor(debtColor[0], debtColor[1], debtColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CURRENT OUTSTANDING DEBT:', 115, 44);
  doc.setFontSize(16);
  doc.text(`Rs. ${currentBalance.toLocaleString('en-IN')}`, 115, 53);

  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Udhaar: Rs. ${totalUdhaar.toLocaleString('en-IN')}  |  Total Jama: Rs. ${totalJama.toLocaleString('en-IN')}`, 115, 60);

  // 3. Transactions Table Header
  let startY = 76;
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(14, startY, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('DATE', 18, startY + 5.5);
  doc.text('DESCRIPTION', 45, startY + 5.5);
  doc.text('JAMA (PAID)', 115, startY + 5.5);
  doc.text('UDHAAR (OWED)', 150, startY + 5.5);
  doc.text('BALANCE', 180, startY + 5.5);

  startY += 8;

  // 4. Transaction Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  custEntries.forEach((entry, idx) => {
    // Page height limit check
    if (startY > 265) {
      doc.addPage();
      startY = 20;

      // Table Header on New Page
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(14, startY, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('DATE', 18, startY + 5.5);
      doc.text('DESCRIPTION', 45, startY + 5.5);
      doc.text('JAMA (PAID)', 115, startY + 5.5);
      doc.text('UDHAAR (OWED)', 150, startY + 5.5);
      doc.text('BALANCE', 180, startY + 5.5);
      startY += 8;
    }

    // Row zebra background
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, 182, 7, 'F');
    }

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

    const dateStr = new Date(entry.entry_date).toLocaleDateString('en-IN');
    doc.text(dateStr, 18, startY + 5);

    const desc = entry.description.length > 32 ? entry.description.substring(0, 30) + '...' : entry.description;
    doc.text(desc, 45, startY + 5);

    // Jama (Credit)
    if (entry.credit > 0) {
      doc.setTextColor(5, 150, 105);
      doc.text(`+ Rs. ${entry.credit.toLocaleString('en-IN')}`, 115, startY + 5);
    } else {
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('-', 115, startY + 5);
    }

    // Udhaar (Debit)
    if (entry.debit > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`- Rs. ${entry.debit.toLocaleString('en-IN')}`, 150, startY + 5);
    } else {
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('-', 150, startY + 5);
    }

    // Running Balance
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(`Rs. ${entry.running_balance.toLocaleString('en-IN')}`, 180, startY + 5);

    startY += 7;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Page ${i} of ${pageCount} • Generated via Shop KhattaBook SaaS on ${new Date().toLocaleDateString('en-IN')}`, 14, 287);
  }

  doc.save(`${customer.name.replace(/\s+/g, '_')}_Khatta_Statement.pdf`);
};

/**
 * 2. Generate & Download Summary PDF for ALL Customers
 */
export const downloadAllCustomersSummaryPDF = (
  customers: Customer[],
  ledgerEntries: LedgerEntry[],
  shop: Shop | null
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const shopName = shop?.name || 'Sri Laxmi Traders';
  const shopLoc = `${shop?.village_town || ''}, ${shop?.district || ''}`;
  const activeCustomers = customers.filter(c => !c.is_deleted);

  const primaryColor = [5, 150, 105]; // Emerald #059669
  const darkColor = [15, 23, 42]; // #0f172a
  const debtColor = [220, 38, 38]; // Red #dc2626
  const textMuted = [100, 116, 139]; // #64748b

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(shopName.toUpperCase(), 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${shopLoc} | ALL CUSTOMERS CREDIT LEDGER REPORT`, 14, 22);

  // Total Outstanding Debt Calculation
  let grandTotalDebt = 0;
  const customerRows = activeCustomers.map((customer, idx) => {
    const custEntries = ledgerEntries.filter(l => l.customer_id === customer.id);
    const balance = custEntries.length > 0 ? custEntries[custEntries.length - 1].running_balance : 0;
    grandTotalDebt += balance;

    return {
      sNo: idx + 1,
      name: customer.name,
      phone: customer.phone,
      village: customer.village,
      creditLimit: customer.credit_limit,
      balance,
      tag: customer.tags[0] || 'Regular'
    };
  });

  // 2. Summary KPI Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 182, 24, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 24, 3, 3, 'D');

  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL CUSTOMERS REGISTERED: ${activeCustomers.length}`, 20, 44);

  doc.setTextColor(debtColor[0], debtColor[1], debtColor[2]);
  doc.setFontSize(13);
  doc.text(`GRAND TOTAL OUTSTANDING DEBT: Rs. ${grandTotalDebt.toLocaleString('en-IN')}`, 20, 52);

  // 3. Customer List Table Header
  let startY = 66;
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(14, startY, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('#', 18, startY + 5.5);
  doc.text('CUSTOMER NAME', 28, startY + 5.5);
  doc.text('VILLAGE', 85, startY + 5.5);
  doc.text('PHONE', 120, startY + 5.5);
  doc.text('MAX LIMIT', 150, startY + 5.5);
  doc.text('OUTSTANDING', 175, startY + 5.5);

  startY += 8;

  // 4. Customer Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  customerRows.forEach((row) => {
    if (startY > 265) {
      doc.addPage();
      startY = 20;

      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(14, startY, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('#', 18, startY + 5.5);
      doc.text('CUSTOMER NAME', 28, startY + 5.5);
      doc.text('VILLAGE', 85, startY + 5.5);
      doc.text('PHONE', 120, startY + 5.5);
      doc.text('MAX LIMIT', 150, startY + 5.5);
      doc.text('OUTSTANDING', 175, startY + 5.5);
      startY += 8;
    }

    if (row.sNo % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, 182, 7, 'F');
    }

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(row.sNo.toString(), 18, startY + 5);
    doc.text(row.name, 28, startY + 5);
    doc.text(row.village, 85, startY + 5);
    doc.text(row.phone, 120, startY + 5);
    doc.text(`Rs. ${row.creditLimit.toLocaleString('en-IN')}`, 150, startY + 5);

    if (row.balance > 0) {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${row.balance.toLocaleString('en-IN')}`, 175, startY + 5);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(5, 150, 105);
      doc.text('Rs. 0 (CLEARED)', 175, startY + 5);
    }

    startY += 7;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Page ${i} of ${pageCount} • All Customers Report • ${shopName}`, 14, 287);
  }

  doc.save(`All_Customers_Credit_Report.pdf`);
};
