import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CloveERP - Sistem Monitoring & Perajangan Cengkeh Terpadu',
  description: 'Enterprise ERP Monitoring Produksi Rajang Cengkeh: Penerimaan Order, Parameter Mutu, Kapasitas Mesin & Estimasi Keterlambatan, Stock In/Out, dan Monitoring Pengiriman. Siap Deploy ke Vercel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
