'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Sparkles, Image as ImageIcon, MapPin, Phone, User, Trash2 } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface UnifiedOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser?: any;
}

const CATEGORIES = [
  { id: 'poultry', label: 'دواجن وبيض', icon: '🐔', desc: 'دجاج، صيصان، بيض، أرانب' },
  { id: 'livestock', label: 'مواشي وحيوانات', icon: '🐄', desc: 'أغنام، أبقار، ماعز، خيول' },
  { id: 'equipment', label: 'عتاد ومعدات', icon: '🚜', desc: 'جرارات، مفقسات، بطاريات' },
  { id: 'feed', label: 'أعلاف ومستلزمات', icon: '🌾', desc: 'ذرة، صويا، أعلاف مركبة' },
  { id: 'services', label: 'خدمات ونقل', icon: '🚚', desc: 'شحن، صيانة، حفر آبار' },
];

export default function UnifiedOfferModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: UnifiedOfferModalProps) {
  // 1. الفئة
  const [offerCategory, setOfferCategory] = useState<string>('poultry');
  // 2. الاسم / العنوان
  const [title, setTitle] = useState('');
  // 3. السعر
  const [price, setPrice] = useState('');
  // 4. الوصف
  const [details, setDetails] = useState('');

  // معلومات التواصل (تلقائية أو قابلة للتعديل)
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [publisherName, setPublisherName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [wilayaCode, setWilayaCode] = useState(currentUser?.wilayaCode || '16');

  // صور اختيارية
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // رفع صورة اختيارية
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerCategory) {
      alert('يرجى اختيار الفئة.');
      return;
    }
    if (!title.trim()) {
      alert('يرجى كتابة اسم الإعلان / السلعة.');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert('يرجى تحديد السعر.');
      return;
    }
    if (!details.trim()) {
      alert('يرجى كتابة وصف وتفاصيل الإعلان.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/b2b-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerCategory,
          intentType: 'sell',
          title: title.trim(),
          price: Number(price),
          priceUnit: 'د.ج',
          details: details.trim(),
          images,
          publisherName: publisherName.trim() || 'فلاح / تاجر',
          phone: phone.trim() || currentUser?.phone || '0550000000',
          wilayaCode: wilayaCode || '16',
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('🎉 تم نشر إعلانك في السوق بنجاح ومجاناً!');
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'فشل نشر الإعلان.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء النشر، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 md:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right font-sans my-auto max-h-[92vh] flex flex-col">
        {/* رأس النافذة المبسط */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                نشر إعلان جديد في السوق
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  مجاني 🇩🇿
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">اختر الفئة واكتب الاسم والسعر والوصف للنشر فوراً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج النشر المبسط */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 text-slate-900">
          {/* 1️⃣ الفئة (اختيار سهل بالبطاقات) */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              1. اختر الفئة <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = offerCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setOfferCategory(cat.id)}
                    className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{cat.icon}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                    </div>
                    <div>
                      <div className="text-xs font-black truncate">{cat.label}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2️⃣ اسم الإعلان / السلعة */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              2. اسم الإعلان أو السلعة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كباش أولاد جلال جملة / صوص دجاج / جرار فلاحي..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 3️⃣ السعر */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              3. السعر (د.ج) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 45000"
                className="w-full pr-4 pl-14 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              <span className="absolute left-4 top-3.5 text-xs font-black text-slate-500">
                د.ج
              </span>
            </div>
          </div>

          {/* 4️⃣ الوصف والتفاصيل */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              4. الوصف والتفاصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اكتب مواصفات السلعة، الحالة، العمر، التحصينات، أو أي ملاحظات للمشتري..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 📸 صور الإعلان (اختياري وبسيط) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>إضافة صور (اختياري)</span>
              </label>
              {images.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {images.length} صورة مضافة
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">اضغط لرفع صورة من الهاتف / الكمبيوتر</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📞 معلومات التواصل والولاية (مبسطة ومدمجة) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              📍 معلومات التواصل والولاية
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف: 06XX..."
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
                />
              </div>

              <div className="relative">
                <User className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={publisherName}
                  onChange={(e) => setPublisherName(e.target.value)}
                  placeholder="اسمك / اسم المزرعة"
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <select
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  className="w-full pr-8 pl-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 🚀 زر النشر الفوري */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-3"
          >
            {isSubmitting ? (
              <span>جاري نشر الإعلان...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>نشر الإعلان الآن في السوق</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
