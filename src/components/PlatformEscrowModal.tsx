'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Phone,
  User,
  DollarSign,
  FileText,
  Upload,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  Truck,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface PlatformEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: any;
  currentUser?: any;
}

export default function PlatformEscrowModal({
  isOpen,
  onClose,
  offer,
  currentUser,
}: PlatformEscrowModalProps) {
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [agreedPrice, setAgreedPrice] = useState<string>(offer?.price ? String(offer.price) : '');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active step in modal: 1 = Details & Procedures, 2 = BaridiMob Payment & Submit
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen || !offer) return null;

  const baridimobRip = '007 99999 0023456789 45';
  const baridimobCcp = '23456789 Clé 45';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPaymentReceipt(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('🔒 لطلب الشراء عبر وسيط المنصة الآمن وتأمين المعاملة يرجى إنشاء حساب أو تسجيل الدخول أولاً.');
      return;
    }

    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('يرجى ملء اسمك ورقم هاتفك للتواصل معك من طرف وسيط المنصة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/b2b-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          offerTitle: offer.title,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          sellerName: offer.publisherName || offer.name || 'الناشر',
          sellerPhone: offer.phone,
          agreedPrice: agreedPrice ? Number(agreedPrice) : offer.price,
          notes: notes.trim(),
          paymentReceipt,
          transactionRef: transactionRef.trim(),
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setIsSuccess(true);
      } else {
        alert(data.message || 'حدث خطأ أثناء تقديم الطلب.');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالسيرفر. يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 md:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right font-sans my-auto max-h-[92vh] flex flex-col">
        {/* رأس النافذة */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                خدمة وسيط المنصة الآمن 🛡️
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  دفع بريدي موب BaridiMob
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">ضمان حقوق المشتري والبائع وحجز الأموال حتى إتمام الفحص والاستلام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">تم تسجيل طلب الوساطة بنجاح!</h3>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md mx-auto">
              تم توثيق طلب الشراء الخاص بمنتج <strong className="text-emerald-700">{offer.title}</strong>.
              سيتواصل معك وسيط المنصة فوراً لتأكيد إيداع المبلغ عبر <strong>بريدي موب BaridiMob</strong>، ثم إخطار البائع ({offer.publisherName}) لبدء الشحن والمعاينة.
            </p>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold max-w-sm mx-auto">
              🛡️ أموالك محفوظة في حساب المنصة ولن يتم تسليمها للبائع إلا بعد استلامك للسلعة وتأكيد موافقتك.
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all text-xs mx-auto cursor-pointer"
            >
              تم، العودة للسوق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 text-slate-900">
            {/* ملخص السلعة المستهدفة */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-slate-500 font-medium block">السلعة المستهدفة:</span>
                <span className="text-slate-900 font-black text-sm">{offer.title}</span>
              </div>
              <div className="text-left">
                <span className="text-slate-500 font-medium block">السعر المعروض:</span>
                <span className="text-emerald-700 font-black text-sm">{offer.price ? Number(offer.price).toLocaleString() : 'غير محدد'} د.ج</span>
              </div>
            </div>

            {/* 📋 إجراءات وخطوات الوساطة (How Escrow Works) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="font-black text-amber-950 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>إجراءات وضمانات وسيط المنصة (5 خطوات آمنة):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900 font-semibold">
                <div className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-amber-200/50">
                  <span className="bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black shrink-0 text-[10px]">1</span>
                  <span><strong>طلب الوساطة:</strong> تأكيد السعر والكمية.</span>
                </div>
                <div className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-amber-200/50">
                  <span className="bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black shrink-0 text-[10px]">2</span>
                  <span><strong>الدفع الآمن:</strong> تحويل المبلغ لـ BaridiMob المنصة.</span>
                </div>
                <div className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-amber-200/50">
                  <span className="bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black shrink-0 text-[10px]">3</span>
                  <span><strong>تجميد المبلغ:</strong> إشعار البائع ببدء الشحن.</span>
                </div>
                <div className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-amber-200/50">
                  <span className="bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black shrink-0 text-[10px]">4</span>
                  <span><strong>الفحص والاستلام:</strong> معاينة السلعة عند الوصول.</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1.5 bg-emerald-100/70 p-2 rounded-xl border border-emerald-300 text-emerald-950">
                  <span className="bg-emerald-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black shrink-0 text-[10px]">5</span>
                  <span><strong>تحرير المبلغ:</strong> بعد موافقتك، يتم تحويل المبلغ للبائع عبر بريدي موب فوراً.</span>
                </div>
              </div>
            </div>

            {/* بيانات المشتري والسعر */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Buyer Name */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    اسم المشتري <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Buyer Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    رقم الهاتف للتواصل والواتساب <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="06XX XX XX XX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Proposed / Agreed Price */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  المبلغ المتفق عليه للمبايعة (د.ج) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    placeholder="أدخل المبلغ المتفق عليه"
                    className="w-full pr-3.5 pl-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-500">د.ج</span>
                </div>
              </div>
            </div>

            {/* 💳 صندوق معلومات دفع بريدي موب BaridiMob المعتمد */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl text-white border border-emerald-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-xs text-amber-300">حساب بريدي موب المعتمد للوساطة (BaridiMob):</span>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md font-bold">
                  رسمي 🇩🇿
                </span>
              </div>

              {/* RIP Box */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">رقم RIP بريدي موب:</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-emerald-300 dir-ltr block tracking-wider">
                    {baridimobRip}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(baridimobRip, 'rip')}
                  className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  {copiedField === 'rip' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'rip' ? 'تم النسخ' : 'نسخ RIP'}</span>
                </button>
              </div>

              {/* CCP Box */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">الحساب البريدي CCP:</span>
                <span className="font-mono font-bold text-amber-300">{baridimobCcp}</span>
              </div>

              {/* Transaction Ref / Receipt Upload */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-300 font-bold mb-1">
                    رقم العملية أو الحوالة (BaridiMob Ref):
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="مثال: TRX-892341..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-bold mb-1">
                    إرفاق وصل الدفع (Reçu BaridiMob):
                  </label>
                  <label className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-slate-200 transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{paymentReceipt ? '✓ تم إرفاق الوصل' : 'رفع صورة الوصل'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                ملاحظات أو شروط خاصة لوسيط المنصة (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: معاينة الدجاج قبل التفريغ، النقل على حساب البائع، شروط الوزن..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري إرسال طلب الوساطة...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>تأكيد طلب الشراء والوساطة عبر بريدي موب 🛡️</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
