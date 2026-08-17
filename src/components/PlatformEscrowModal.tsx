'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, Phone, User, DollarSign, FileText } from 'lucide-react';

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
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [agreedPrice, setAgreedPrice] = useState<string>(offer?.price ? String(offer.price) : '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !offer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('يرجى ملء الاسم ورقم الهاتف للواصل معك من طرف وسيط المنصة');
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
          buyerName,
          buyerPhone,
          sellerName: offer.publisherName || offer.name || 'الناشر',
          sellerPhone: offer.phone,
          agreedPrice: agreedPrice ? Number(agreedPrice) : offer.price,
          notes,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right font-sans">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">الشراء عبر وسيط المنصة الآمن 🛡️</h2>
              <p className="text-xs text-emerald-200 mt-0.5">ضمان المعاملات التجارية وتفادي الاحتيال بنسبة 100%</p>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">تم استلام طلب الوساطة بنجاح!</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              قام فريق المنصة بتوثيق طلب الشراء الخاص بمنتج <span className="font-bold text-emerald-700">{offer.title}</span>.
              سيتواصل معك أحد الممثلين المعتمدين خلال أقصر وقت لإتمام وتأمين المبايعة بينك وبين البائع ({offer.publisherName}).
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all text-sm mt-4"
            >
              تم، العودة للسوق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Offer Quick Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="text-slate-500 font-medium">المنتج المستهدف:</div>
              <div className="text-slate-900 font-extrabold text-sm">{offer.title}</div>
              <div className="flex justify-between items-center text-slate-700 font-semibold pt-1">
                <span>السعر المطلوب: <strong className="text-emerald-700 font-black">{offer.price?.toLocaleString()} د.ج</strong></span>
                <span>البائع: <strong className="text-slate-900">{offer.publisherName || offer.name}</strong></span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>كيف تعمل الوساطة؟</strong>
                <p className="mt-0.5 text-amber-800 leading-snug">
                  يقوم فريق المنصة بالتحقق من المنتج، تأمين المبلغ وتنسيق عملية الشحن والاستلام بين الطرفين لضمان حقك وحق البائع.
                </p>
              </div>
            </div>

            {/* Buyer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                اسمك الكامل (المشتري) *
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Buyer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                رقم هاتفك للتواصل المباشر *
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="06XX XX XX XX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dir-ltr text-right"
              />
            </div>

            {/* Proposed / Agreed Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                السعر المقترح للمبايعة (د.ج)
              </label>
              <input
                type="number"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="مثال: 50000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                ملاحظات أو شروط خاصة لوسيط المنصة (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرخص الفحص والمعاينة قبل الدفع، النقل على حساب البائع..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري إرسال الطلب...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>تأكيد إرسال طلب الشراء عبر الوسيط</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
