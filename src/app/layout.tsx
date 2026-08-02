import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "دواجن الجزائر B2B | منصة ضبط أسعار الدجاج والتوظيف في كل ولاية",
  description: "منصة بورصة دواجن الجزائر المتخصصة في متابعة أسعار الدجاج الحي والمذبوح والأعلاف في كافة ولايات الجزائر مع سوق توظيف وعمال قطاع الدواجن.",
  keywords: ["دواجن", "الجزائر", "أسعار الدجاج", "دجاج حي", "مذبوح", "توظيف", "مزارع دواجن", "بياطرة", "مذابح", "B2B"],
  other: {
    'tiktok-developers-site-verification': '3wWEsQe03xUx0BbaOWAMhddYSzwl7hAH',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <meta name="tiktok-developers-site-verification" content="3wWEsQe03xUx0BbaOWAMhddYSzwl7hAH" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased font-['Cairo',sans-serif] min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
