import * as XLSX from 'xlsx';
import { Pass, Store } from '../types';

export const exportToExcel = (passes: Pass[], stores: Store[]) => {
  // Format data for Excel
  const data = passes.map(pass => {
    const store = stores.find(s => s.storeId === pass.storeId);
    return {
      'Purchase Date': pass.createdAt.toDate().toLocaleString(),
      'Venue': store?.name || 'Unknown Venue',
      'Product Type': pass.productType,
      'Pass Name': pass.passName,
      'Event Date': pass.expiresAt.toDate().toLocaleDateString(),
      'Customer': pass.customerName || 'N/A',
      'Email': pass.customerEmail || 'N/A',
      'Units': pass.quantity,
      'Total': `$${pass.totalAmount.toFixed(2)}`,
      'Service Fee': `$${pass.serviceFee.toFixed(2)}`,
      'Tip': `$${pass.tipAmount.toFixed(2)}`,
      'Redeem Date': pass.usedAt ? pass.usedAt.toDate().toLocaleString() : 'Not Redeemed',
      'Status': pass.usedAt ? 'Redeemed' : 'Active'
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');

  // Generate Excel file
  XLSX.writeFile(wb, `orders_${new Date().toISOString()}.xlsx`);
}; 