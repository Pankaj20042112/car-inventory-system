import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 border-t border-white/5 bg-slate-950/40 text-center text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4">
        <p className="mb-2">© {new Date().getFullYear()} VeloCity Systems Inc. All rights reserved.</p>
        <p className="text-xs text-gray-600">Premium Car Dealership & Inventory Management Console</p>
      </div>
    </footer>
  );
};

export default Footer;
