import React from 'react';

export function Footer() {
  return (
    <footer className="py-6 border-t border-slate-800 bg-slate-900">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Maha LPG Co. All rights reserved.
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Developed by{' '}
          <a
            href="https://www.facebook.com/essa036/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 transition"
          >
            MUHMMAD ESSA GADANI
          </a>
        </div>
      </div>
    </footer>
  );
}
