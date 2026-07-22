import React from 'react';
import { X, Printer, Download, CheckCircle, Car, Shield, User, FileText } from 'lucide-react';

const InteractiveReceiptModal = ({ isOpen, onClose, purchase, onDownloadPDF }) => {
  if (!isOpen || !purchase) return null;

  const dateStr = new Date(purchase.createdAt).toLocaleString();
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(purchase.price);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative flex flex-col max-h-[90svh] text-white">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/90 relative">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400 border border-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Interactive Purchase Receipt</h3>
              <p className="text-xs text-slate-400">Order Ref: {purchase.receiptNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div id="printable-receipt" className="flex-grow p-8 overflow-y-auto space-y-8 print:bg-white print:text-black">
          {/* Status Checkmark Banner */}
          <div className="text-center space-y-2 pb-6 border-b border-white/10 print:border-slate-200">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <CheckCircle className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white print:text-black">Transaction Completed</h2>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Payment Status: Paid & Cleared</p>
          </div>

          {/* Dealership & Buyer Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Seller */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-2 print:border-slate-200">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Authorized Dealer</div>
              <div className="font-black text-white print:text-black">{purchase.sellerName || 'VeloCity Systems'}</div>
              <div className="text-xs text-slate-400">Email: sales@velocitysystemsdealership.com</div>
              <div className="text-xs text-slate-400">Warranty: Standard 3-Year Factory Warranty</div>
            </div>

            {/* Buyer */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-2 print:border-slate-200">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Buyer Customer Details</div>
              <div className="font-black text-white print:text-black">{purchase.buyerName}</div>
              <div className="text-xs text-slate-400">Email: {purchase.buyerEmail}</div>
              <div className="text-xs text-slate-400">Category Tier: <span className="font-bold text-purple-300">{purchase.buyerCategory}</span></div>
            </div>
          </div>

          {/* Purchased Item Specification Card */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden print:border-slate-200">
            <div className="px-5 py-3.5 bg-slate-900/50 border-b border-white/10 font-bold text-xs uppercase tracking-wider text-slate-400">
              Purchased Automobile Specification
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white print:text-black">{purchase.make} {purchase.model}</h4>
                  <p className="text-xs text-slate-400">Category: {purchase.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Unit Price</div>
                <div className="text-lg font-black text-white print:text-black">{formattedPrice}</div>
              </div>
            </div>
          </div>

          {/* Pricing Totals Card */}
          <div className="flex flex-col items-end space-y-2 pt-4 border-t border-white/10 print:border-slate-200">
            <div className="flex justify-between w-64 text-sm text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-white print:text-black">{formattedPrice}</span>
            </div>
            <div className="flex justify-between w-64 text-sm text-slate-400">
              <span>Dealer Fees & Luxury Tax:</span>
              <span className="font-semibold text-emerald-400">$0.00 (Waived)</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold border-t border-white/10 pt-2 print:border-slate-200">
              <span className="text-slate-300">Grand Total Paid:</span>
              <span className="text-xl font-black text-emerald-400">{formattedPrice}</span>
            </div>
          </div>

          {/* System Stamp details */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Verified Digitally Secured Ledger</span>
            </div>
            <div>Transaction Timestamp: {dateStr}</div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-6 bg-slate-900/90 border-t border-white/10 flex items-center justify-end space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onDownloadPDF}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-glow transition-all duration-150"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default InteractiveReceiptModal;
