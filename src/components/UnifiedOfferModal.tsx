'use client';

import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Image as ImageIcon, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface UnifiedOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser?: any;
}

export default function UnifiedOfferModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: UnifiedOfferModalProps) {
  const [offerCategory, setOfferCategory] = useState<'poultry' | 'livestock' | 'equipment' | 'feed' | 'services'>('poultry');
  const [intentType, setIntentType] = useState<'sell' | 'buy'>('sell');
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState('');
  const [brandOrBreed, setBrandOrBreed] = useState('');
  const [itemCondition, setItemCondition] = useState('live');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('رأس');
  const [wilayaCode, setWilayaCode] = useState(currentUser?.wilayaCode || '16');
  const [commune, setCommune] = useState(currentUser?.commune || '');
  const [publisherName, setPublisherName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [details, setDetails] = useState('');

  // Images state (up to 20 images)
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle local image files upload (Convert to Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 20 - images.length;
    if (remainingSlots <= 0) {
      alert('⚠️ الحد الأقصى هو 20 صورة للإعلان الواحد.');
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach((file) => {
      // Basic size check (max 5MB per image base64)
      if (file.size > 5 * 1024 * 1024) {
        alert(`الصورة ${file.name} تتجاوز حجم 5 ميجابايت. يرجى اختيار صورة أصغر.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => {
            if (prev.length >= 20) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 20) {
      alert('⚠️ الحد الأقصى هو 20 صورة للإعلان.');
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price || !publisherName.trim() || !phone.trim() || !wilayaCode) {
      alert('يرجى ملء كافة الحقول الأساسية: العنوان، السعر، الاسم، الهاتف، والولاية.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/b2b-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerCategory,
          intentType,
          title,
          itemType,
          brandOrBreed,
          itemCondition,
          quantity,
          price: Number(price),
          priceUnit,
          wilayaCode,
          commune,
          publisherName,
          phone,
          images, // Array of base64 / URLs (up to 20)
          details,
          deliveryAvailable,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('🎉 تم نشر إعلانك في السوق الشامل B2B بنجاح ومجاناً!');
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'فشل نشر الإعلان.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء النشر. يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 md:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right font-sans my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-emerald-950 rounded-2xl font-bold shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2">
                إضافة إعلان في السوق الشامل B2B
                <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  مجاني 100% 🇩🇿
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">أنشر منتجاتك، مواشيك، أو عتادك الفلاحي ليصل لكافة المربين والتجار</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Category Tabs & Intent Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">فئة المنتج / المعاملة *</label>
              <select
                value={offerCategory}
                onChange={(e: any) => setOfferCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="poultry">🐔 الدواجن والبيض والكتكوت</option>
                <option value="livestock">🐄 المواشي والحيوانات (أغنام/أبقار/ماعز)</option>
                <option value="equipment">🚜 العتاد والمعدات الفلاحية والداجنة</option>
                <option value="feed">🌾 الأعلاف والمستلزمات والأدوية</option>
                <option value="services">🚚 خدمات فلاحية ونقل وتجهيز</option>
              </select>
            </div>

            {/* Intent Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الإعلان *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIntentType('sell')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    intentType === 'sell'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  🟢 عرض بيع
                </button>
                <button
                  type="button"
                  onClick={() => setIntentType('buy')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                    intentType === 'buy'
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  🔵 طلب شراء
                </button>
              </div>
            </div>
          </div>

          {/* Product Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              عنوان المنتج / الإعلان *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كباش أولاد جلال جملة / جرار فلاحي مستعمل / صوص 1 يوم Ross 308"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Price & Unit & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">السعر (د.ج) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 45000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">وحدة السعر</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="رأس">د.ج / للرأس</option>
                <option value="كغ">د.ج / للكيلوغرام</option>
                <option value="قطعة">د.ج / للقطعة</option>
                <option value="قنطار">د.ج / للقنطار</option>
                <option value="طن">د.ج / للطن</option>
                <option value="إجمالي">د.ج (إجمالي العرض)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">الحالة</label>
              <select
                value={itemCondition}
                onChange={(e) => setItemCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="live">حي (حيوانات/دواجن)</option>
                <option value="new">جديد (عتاد/معدات)</option>
                <option value="used">مستعمل (عتاد/معدات)</option>
                <option value="fresh">طازج / جديد (أعلاف/بيض)</option>
              </select>
            </div>
          </div>

          {/* Sub Details: Breed/Brand & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">السلالة / الماركة المصنّعة</label>
              <input
                type="text"
                value={brandOrBreed}
                onChange={(e) => setBrandOrBreed(e.target.value)}
                placeholder="مثال: سلالة أولاد جلال / Massey Ferguson / Ross 308"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">الكمية المتاحة / المطلوبة</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="مثال: 50 رأس / 2000 طير / قطعة واحدة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Wilaya & Commune Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">الولاية (مكان التواجد) *</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">البلدية / المنطقة</label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="أدخل اسم البلدية"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">اسمك / اسم المزرعة أو الشركة *</label>
              <input
                type="text"
                required
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                placeholder="اسمك الكامل أو اسم المزرعة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">رقم الهاتف والواتساب *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06XX XX XX XX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 dir-ltr text-right"
              />
            </div>
          </div>

          {/* Delivery Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="deliveryAvailable"
              checked={deliveryAvailable}
              onChange={(e) => setDeliveryAvailable(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="deliveryAvailable" className="text-xs font-bold text-slate-800 cursor-pointer">
              🚚 التوصيل / الشحن متوفر لكافة الولايات
            </label>
          </div>

          {/* IMAGES UPLOADER SECTION (UP TO 20 IMAGES) */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                صور المنتج (حتى 20 صورة)
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                {images.length} / 20 صورة
              </span>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={images.length >= 20}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">
                انقر هنا أو اسحب الصور لرفع صور المنتج (متاح تحديد عدة صور دفعة واحدة)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">يدعم صور JPG, PNG, WEBP حتى 20 صورة</p>
            </div>

            {/* Optional image URL text input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="أو ألصق رابط صورة مباشر هنا..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={images.length >= 20 || !imageUrlInput.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                إضافة رابط
              </button>
            </div>

            {/* Images Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 pt-2 max-h-48 overflow-y-auto">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] font-black bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS IN BOLD TYPOGRAPHY */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              تفاصيل ومواصفات الإعلان (سيظهر بخط عريض وواضح للزبائن)
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اكتب مواصفات المنتج، الوزن، التحصينات، الضمان، أو أي معلومات تهم المشتري..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              💡 نصيحة: كتابة تفاصيل واضحة ودقيقة مع إرفاق صور جيدة يزيد من فاعلية الإعلان وسرعة البيع.
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <span>جاري إدراج الإعلان في السوق...</span>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>نشر الإعلان مجاناً في السوق الشامل B2B</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
