import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock, Eye, FileText, Globe, CheckCircle } from 'lucide-react';

export const metadata = {
  title: "سياسة الخصوصية | دواجن الجزائر B2B",
  description: "سياسة الخصوصية وحماية البيانات لمنصة دواجن الجزائر B2B.",
};

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>حماية البيانات والخصوصية</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            سياسة الخصوصية (Privacy Policy)
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            تلتزم منصة دواجن الجزائر B2B بحماية خصوصية كافة المستخدمين والتجار والمربين والعمال. يوضح هذا المستند كيفية جمع واستخدام وحماية معلوماتك الشخصية.
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
            <Eye className="w-5 h-5 text-amber-400" />
            1. المعلومات التي نجمعها
          </h2>
          <p>
            عند تسجيلك واستخدامك لمنصة دواجن الجزائر B2B، قد نجمع البيانات التالية لتشغيل الخدمة وتسهيل التواصل التجاري:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pr-2">
            <li className="font-medium text-slate-300">معلومات الحساب: الاسم الكامل، رقم الهاتف، والولاية.</li>
            <li className="font-medium text-slate-300">معلومات النشاط: تفاصيل العروض التجارية، طلبات التوظيف، وسجلات الأسعار المدخلة.</li>
            <li className="font-medium text-slate-300">البيانات التقنية: عنوان IP، نوع الجهاز، والمتصفح لضمان أمان المنصة.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            2. كيفية استخدام البيانات
          </h2>
          <p>
            نستخدم المعلومات التي نجمعها للأغراض التالية:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pr-2">
            <li>عرض وتوثيق أسعار بورصة الدواجن والعروض التجارية حسب الولاية.</li>
            <li>ربط المربين، التجار، المذابح، والعمال بشكل مباشر وتسهيل التواصل والتأكيد عبر الهاتف.</li>
            <li>تحسين أداء المنصة وتجربة المستخدم وتطوير الخدمات.</li>
            <li>التحقق من الهوية ومنع الاحتيال أو المنشورات الوهمية.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            3. مشاركة البيانات وتطبيقات الطرف الثالث (Third-Party Services)
          </h2>
          <p>
            نحن لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نتشارك البيانات فقط في الحالات التالية:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pr-2">
            <li><strong>الخدمات المدمجة المعتمدة:</strong> بما في ذلك خدمات TikTok APIs أو ميزات تسجيل الدخول والمشاركة عند ربط حسابك، وفقاً لتعليمات وسياسات الخصوصية الخاصة بها.</li>
            <li><strong>العرض العام المباشر:</strong> رقم الهاتف والاسم التجاري والولاية المدخلة من قبلك تظهر للعملاء والمشترين لغرض التواصل التجاري الذي قمت بنشره بنفسك.</li>
            <li><strong>الامتثال القانوني:</strong> في حالة وجود طلب رسمي بموجب القوانين الجزائرية المعمول بها.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            4. أمان البيانات وتخزينها
          </h2>
          <p>
            نطبق إجراءات أمنية وتقنية عالية للحفاظ على سلامة بياناتك ومنع الوصول غير المصرح به أو التعديل أو الإفصاح عنها.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-400" />
            5. حقوق المستخدم وحذف البيانات
          </h2>
          <p>
            يحق لكل مستخدم تعديل بياناته الشخصية أو طلب حذف حسابه وجميع بياناته المخزنة في أي وقت عبر التواصل مع إدارة المنصة.
          </p>
        </div>

        {/* Section 6 */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-amber-400">
            6. التواصل معنا
          </h2>
          <p className="text-slate-400">
            إذا كانت لديك أي استفسارات حول سياسة الخصوصية أو حماية البيانات، يمكنك التواصل معنا عبر المنصة.
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
