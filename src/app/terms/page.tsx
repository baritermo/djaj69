import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, Shield, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const metadata = {
  title: "شروط الخدمة | دواجن الجزائر B2B",
  description: "شروط واستخدام منصة دواجن الجزائر B2B والتسهيلات التجارة الإلكترونية.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors text-sm font-semibold">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Shield className="w-5 h-5" />
            <span>دواجن الجزائر B2B</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-12 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>اتفاقية الاستخدام والاتفاق القانوني</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            شروط الخدمة (Terms of Service)
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            مرحباً بكم في منصة دواجن الجزائر B2B. يُرجى قراءة شروط الخدمة بعناية قبل استخدام المنصة أو نشر أي أسعار أو عروض تجارية.
          </p>
          <p className="text-xs text-slate-500 mt-4">
            تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 space-y-8 text-slate-300 leading-relaxed text-sm md:text-base">
        
        {/* Section 1 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            1. قبول الشروط
          </h2>
          <p>
            بدخولك واستخدامك لمنصة دواجن الجزائر B2B، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح التنظيمية ذات الصلة بسوق الدواجن والتجارة الإلكترونية في الجزائر.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            2. طبيعة المنصة وتحديد المسؤولية
          </h2>
          <p>
            منصة دواجن الجزائر B2B هي منصة تفاعلية مستقلة تتيح للمربين والتجار والمذابح والعمال نشر متابعات أسعار الدجاج والعروض وسوق العمل.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pr-2">
            <li>المنصة كوسيط إعلامي وتقني ولا تعتبر طرفاً في العقود أو المعاملات المباشرة بين المشتري والبائع.</li>
            <li>يتحمل المستخدمون كامل المسؤولية عن دقة وصحة الأسعار والعروض ورقام الهواتف المدخلة.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            3. قواعد النشر والمحتوى
          </h2>
          <p>
            يُحظر على المستخدمين نشر:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pr-2">
            <li>معلومات أو أسعار مضللة أو وهمية بهدف التلاعب بالسوق.</li>
            <li>محتوى ينتهك الحقوق الشخصية أو التجارية للآخرين.</li>
            <li>إعلانات وهمية لا تتعلق بقطاع الدواجن والأعلاف والخدمات البيطرية ذات الصلة.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            4. التكامل مع المنصات الخارجية (مثل TikTok)
          </h2>
          <p>
            تتيح المنصة إمكانية ربط الحسابات وتوثيق التطبيقات مع المنصات الخارجية بما في ذلك TikTok Developers Services. باستخدامك لهذه الميزات، فإنك تلتزم بالشروط وأحكام الخدمة الخاصة بهذه المنصات الخارجية إلى جانب شروطنا.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400">
            5. التعديلات على الشروط
          </h2>
          <p className="text-slate-400">
            نحتفظ بحق تعديل أو تحديث شروط الخدمة هذه في أي وقت. تكون التعديلات نافذة فور نشرها على هذه الصفحة.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} دواجن الجزائر B2B - جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-amber-400 underline">سياسة الخصوصية</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-amber-400 underline">شروط الخدمة</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
