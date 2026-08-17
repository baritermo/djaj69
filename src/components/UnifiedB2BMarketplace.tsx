'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Tag,
  Truck,
  Eye,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
  Calendar,
  Layers,
  Building,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';
import PlatformEscrowModal from './PlatformEscrowModal';

interface UnifiedB2BMarketplaceProps {
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
  onOpenOfferModal?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenLoginModal?: () => void;
}

export default function UnifiedB2BMarketplace({
  currentUser,
  onOpenSubscribeModal,
  onOpenOfferModal,
  onOpenRegisterModal,
  onOpenLoginModal,
}: UnifiedB2BMarketplaceProps) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Selected item modal state (Facebook Marketplace style modal view)
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [revealedPhoneId, setRevealedPhoneId] = useState<number | null>(null);

  // Escrow deal modal state
  const [escrowOfferTarget, setEscrowOfferTarget] = useState<any | null>(null);

  const handlePublishClick = () => {
    if (!currentUser) {
      if (onOpenRegisterModal) {
        onOpenRegisterModal();
      } else {
        alert('🔒 لممارسة النشاط ونشر الإعلانات في المنصة يرجى إنشاء حساب أو تسجيل الدخول أولاً.');
      }
      return;
    }
    if (onOpenOfferModal) onOpenOfferModal();
  };

  const handleEscrowClick = (offerTarget: any) => {
    if (!currentUser) {
      if (onOpenRegisterModal) {
        onOpenRegisterModal();
      } else {
        alert('🔒 لطلب الشراء عبر وسيط المنصة الآمن وتأمين المعاملة يرجى إنشاء حساب أو تسجيل الدخول أولاً.');
      }
      return;
    }
    setEscrowOfferTarget(offerTarget);
  };

  const fetchB2BOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedIntent !== 'all') params.append('intentType', selectedIntent);
      if (selectedWilaya !== 'all') params.append('wilayaCode', selectedWilaya);
      if (searchQuery.trim() !== '') params.append('search', searchQuery.trim());

      const res = await fetch(`/api/b2b-offers?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Fetch B2B offers error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedIntent, selectedWilaya, searchQuery]);

  useEffect(() => {
    fetchB2BOffers();
  }, [fetchB2BOffers]);

  // Helper to open WhatsApp with prefilled message
  const handleOpenWhatsApp = (phone: string, title: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith('213')) {
      cleanPhone = '213' + cleanPhone;
    }
    const message = encodeURIComponent(`مرحباً بك، تواصلت معك من خلال البورصة الجزائرية بخصوص إعلانك: "${title}"`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'poultry':
        return '🐔 دواجن وبيض';
      case 'livestock':
        return '🐄 مواشي وحيوانات';
      case 'equipment':
        return '🚜 عتاد ومعدات';
      case 'feed':
        return '🌾 أعلاف ومستلزمات';
      case 'services':
        return '🚚 خدمات ونقل';
      default:
        return '📦 منتج فلاحي';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'poultry':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'livestock':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'equipment':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'feed':
        return 'bg-lime-100 text-lime-900 border-lime-300';
      case 'services':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 🌟 Compact Header Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 px-4 py-3 text-white shadow-md border border-emerald-900/30 flex items-center justify-between gap-3">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-200 tracking-wide">
          سوق B2B الشامل — البورصة الجزائرية 🇩🇿
        </h2>

        <button
          onClick={handlePublishClick}
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-3.5 py-1.5 rounded-xl shadow transition-all hover:scale-[1.02] text-xs shrink-0 cursor-pointer"
        >
          + أنشر إعلانك مجاناً الآن
        </button>
      </div>

      {/* 🔍 Sleek Search & Filter Trigger Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-lg border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم: حولي، جرار، مفقسة، دجاج، أعلاف..."
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Modal Trigger Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl shadow-md border border-emerald-800 transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Filter className="w-4 h-4 text-amber-400" />
            <span>تصفية وبحث متقدم 🎛️</span>
            {(selectedCategory !== 'all' || selectedWilaya !== 'all' || selectedIntent !== 'all' || searchQuery !== '') && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Active Filter Pills Bar (Shows active selections & quick reset) */}
        {(selectedCategory !== 'all' || selectedWilaya !== 'all' || selectedIntent !== 'all' || searchQuery !== '') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold">الفلاتر النشطة:</span>

            {selectedCategory !== 'all' && (
              <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-emerald-300">
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-red-600 font-black mr-1">×</button>
              </span>
            )}

            {selectedWilaya !== 'all' && (
              <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-blue-300">
                📍 ولاية {selectedWilaya}
                <button onClick={() => setSelectedWilaya('all')} className="hover:text-red-600 font-black mr-1">×</button>
              </span>
            )}

            {selectedIntent !== 'all' && (
              <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-purple-300">
                {selectedIntent === 'sell' ? '🟢 عروض بيع' : '🔵 طلبات شراء'}
                <button onClick={() => setSelectedIntent('all')} className="hover:text-red-600 font-black mr-1">×</button>
              </span>
            )}

            {searchQuery && (
              <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-amber-300">
                🔍 "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-600 font-black mr-1">×</button>
              </span>
            )}

            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedWilaya('all');
                setSelectedIntent('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-extrabold text-red-600 hover:underline mr-auto"
            >
              إلغاء جميع الفلاتر ↺
            </button>
          </div>
        )}
      </div>

      {/* 🛍️ PRODUCT GRID (Facebook Marketplace Mobile Layout) */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-semibold">جاري تحميل سوق B2B...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">لا توجد عروض مطابقة حتى الآن</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            كن أول من يضيف إعلاناً في هذا القسم ليصل آلاف الفلاحين والمربين عبر القطر الوطني!
          </p>
          <button
            onClick={handlePublishClick}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
          >
            + أنشر أول إعلان مجاناً
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {offers.map((offer) => {
            const hasMultipleImages = offer.imagesList && offer.imagesList.length > 1;
            const primaryImage = offer.imagesList && offer.imagesList.length > 0 ? offer.imagesList[0] : null;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => {
                  setSelectedOffer(offer);
                  setActiveImageIndex(0);
                }}
              >
                {/* Product Thumbnail Box */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {primaryImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={primaryImage}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                      <Store className="w-10 h-10 opacity-40 mb-1" />
                      <span className="text-[11px] font-bold text-slate-400">بدون صورة</span>
                    </div>
                  )}

                  {/* Badge: Category & Intent */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-sm border ${getCategoryColor(offer.offerCategory)}`}>
                      {getCategoryLabel(offer.offerCategory)}
                    </span>
                    {offer.intentType === 'buy' && (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg shadow">
                        طلب شراء
                      </span>
                    )}
                  </div>

                  {/* Image Counter Badge if up to 20 images exist */}
                  {offer.imagesList && offer.imagesList.length > 0 && (
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span>📸</span>
                      <span>{offer.imagesList.length} صور</span>
                    </div>
                  )}
                </div>

                {/* Card Content (Facebook Marketplace style typography) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Big Price Tag */}
                    <div className="text-lg md:text-xl font-black text-emerald-600 tracking-tight">
                      {offer.price ? offer.price.toLocaleString() : 'تواصل مع البائع'} <span className="text-xs font-bold text-slate-600">د.ج</span>
                      {offer.priceUnit && <span className="text-[11px] font-semibold text-slate-500 mr-1">/ {offer.priceUnit}</span>}
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base line-clamp-2 mt-1 leading-snug group-hover:text-emerald-700 transition-colors">
                      {offer.title}
                    </h3>

                    {/* Location & Seller */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {offer.wilayaName} {offer.commune ? `(${offer.commune})` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons inside Card */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleOpenWhatsApp(offer.phone, offer.title)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>

                    {/* Phone Number Reveal */}
                    <button
                      onClick={() => setRevealedPhoneId(revealedPhoneId === offer.id ? null : offer.id)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{revealedPhoneId === offer.id ? offer.phone : 'الهاتف'}</span>
                    </button>

                    {/* Details view modal trigger */}
                    <button
                      onClick={() => {
                        setSelectedOffer(offer);
                        setActiveImageIndex(0);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                      title="المعاينة المكبرة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📖 FACEBOOK MARKETPLACE ITEM DETAIL MODAL (Support Up to 20 Images + Bold Details) */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right font-sans my-auto max-h-[95vh] flex flex-col md:flex-row">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOffer(null)}
              className="absolute top-4 left-4 z-20 p-2.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all backdrop-blur"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Image Carousel / Gallery (Supports Up to 20 Images) */}
            <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-between relative min-h-[300px] md:min-h-[500px]">
              {/* Main Displayed Image */}
              <div className="relative flex-1 flex items-center justify-center p-2 min-h-[260px]">
                {selectedOffer.imagesList && selectedOffer.imagesList.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedOffer.imagesList[activeImageIndex]}
                    alt={selectedOffer.title}
                    className="max-h-[420px] w-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <Store className="w-16 h-16 mx-auto opacity-30" />
                    <p className="text-xs font-semibold">لا توجد صورة مرفقة لهذا العرض</p>
                  </div>
                )}

                {/* Carousel Navigation Arrows */}
                {selectedOffer.imagesList && selectedOffer.imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? selectedOffer.imagesList.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === selectedOffer.imagesList.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                      صورة {activeImageIndex + 1} من {selectedOffer.imagesList.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Strip (Up to 20 Thumbnails) */}
              {selectedOffer.imagesList && selectedOffer.imagesList.length > 1 && (
                <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {selectedOffer.imagesList.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`مصغرة ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Item Information & Actions */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${getCategoryColor(selectedOffer.offerCategory)}`}>
                    {getCategoryLabel(selectedOffer.offerCategory)}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
                    📍 {selectedOffer.wilayaName}
                  </span>
                  {selectedOffer.deliveryAvailable && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl">
                      🚚 شحن متوفر
                    </span>
                  )}
                </div>

                {/* Big Title */}
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  {selectedOffer.title}
                </h2>

                {/* Price Section */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800">السعر المعروض:</div>
                    <div className="text-2xl font-black text-emerald-700">
                      {selectedOffer.price ? selectedOffer.price.toLocaleString() : 'قابل للتفاوض'}{' '}
                      <span className="text-sm font-bold text-slate-700">د.ج</span>
                      {selectedOffer.priceUnit && (
                        <span className="text-xs font-bold text-slate-500 mr-1.5">/ {selectedOffer.priceUnit}</span>
                      )}
                    </div>
                  </div>
                  {selectedOffer.quantity && (
                    <div className="text-left text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                      الكمية: {selectedOffer.quantity}
                    </div>
                  )}
                </div>

                {/* Publisher Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">اسم الناشر / المزرعة:</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{selectedOffer.publisherName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">رقم الهاتف التواصل:</span>
                    <strong className="text-emerald-700 font-extrabold text-sm dir-ltr">{selectedOffer.phone}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">الموقع الجغرافي:</span>
                    <strong className="text-slate-800 font-bold">
                      {selectedOffer.wilayaName} - {selectedOffer.commune || 'مركز الولاية'}
                    </strong>
                  </div>
                </div>

                {/* BOLD DESCRIPTION BOX (المواصفات والوصف بخط عريض) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    المواصفات وتفاصيل الإعلان (الوصف العريض)
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-900 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {selectedOffer.details || 'لا توجد ملاحظات تفصيلية مكتوبة لهذا الإعلان.'}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (تواصل مع البائع + شراء عبر وسيط المنصة) */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {/* 1. Contact Seller WhatsApp & Direct Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenWhatsApp(selectedOffer.phone, selectedOffer.title)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>تواصل عبر الواتساب</span>
                  </button>

                  <a
                    href={`tel:${selectedOffer.phone}`}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>اتصل مباشرة ({selectedOffer.phone})</span>
                  </a>
                </div>

                {/* 2. Buy via Platform Escrow/Broker Button */}
                <button
                  onClick={() => handleEscrowClick(selectedOffer)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm border border-amber-300 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>طلب شراء عبر وسيط المنصة الآمن 🛡️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎛️ FILTER & SEARCH MODAL POPUP (نافذة التصفية والبحث المتقدم) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right font-sans my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-bold shadow-md">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">نافذة التصفية والبحث المتقدم 🎛️</h3>
                  <p className="text-xs text-slate-300">اختر الفئة والولاية ونوع الإعلان لتصفية النتائج</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 text-slate-900">
              {/* 1. Keyword Search */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">البحث بالكلمات المفتاحية</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="مثال: حولي، جرار، مفقسة، دجاج، أعلاف..."
                    className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 2. Structured Category Cards Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">اختر الفئة الرئيسية *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'all', label: 'جميع الفئات', sub: 'كل الإعلانات', icon: '🛍️', color: 'from-slate-800 to-slate-950 text-white' },
                    { id: 'poultry', label: 'الدواجن والبيض', sub: 'دجاج، صوص، بيض', icon: '🐔', color: 'from-amber-500 to-amber-600 text-slate-950' },
                    { id: 'livestock', label: 'المواشي والحيوانات', sub: 'أغنام، أبقار، ماعز', icon: '🐄', color: 'from-emerald-600 to-emerald-700 text-white' },
                    { id: 'equipment', label: 'العتاد والمعدات', sub: 'جرارات، مفقسات', icon: '🚜', color: 'from-blue-600 to-blue-700 text-white' },
                    { id: 'feed', label: 'الأعلاف والبيطرة', sub: 'ذرة، أعلاف مركبة', icon: '🌾', color: 'from-lime-600 to-lime-700 text-white' },
                    { id: 'services', label: 'الخدمات والنقل', sub: 'شحن، صيانة، حفر', icon: '🚚', color: 'from-purple-600 to-purple-700 text-white' },
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                          isSelected
                            ? `bg-gradient-to-r ${cat.color} border-slate-900 shadow-md ring-2 ring-emerald-500 scale-[1.02]`
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{cat.icon}</span>
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>}
                        </div>
                        <div>
                          <div className={`text-xs font-black truncate ${isSelected ? '' : 'text-slate-900'}`}>{cat.label}</div>
                          <div className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                            {cat.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Wilaya Selection & Intent Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">الولاية (58 ولاية)</label>
                  <select
                    value={selectedWilaya}
                    onChange={(e) => setSelectedWilaya(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">📍 كل الولايات (58 ولاية)</option>
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">نوع الإعلان</label>
                  <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">كل الإعلانات (عروض وطلبات)</option>
                    <option value="sell">🟢 عروض بيع فقط</option>
                    <option value="buy">🔵 طلبات شراء فقط</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedWilaya('all');
                  setSelectedIntent('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                إلغاء وتفريغ الفلاتر ↺
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>تطبيق الفلترة وشاهد النتائج</span>
                <span className="bg-emerald-800 px-2 py-0.5 rounded-md text-[10px]">{offers.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Modal Trigger */}
      {escrowOfferTarget && (
        <PlatformEscrowModal
          isOpen={!!escrowOfferTarget}
          onClose={() => setEscrowOfferTarget(null)}
          offer={escrowOfferTarget}
          currentUser={currentUser}
        />
      )}

      {/* Mobile Floating Action Button (FAB) for Publishing Offers */}
      <button
        onClick={handlePublishClick}
        className="md:hidden fixed bottom-6 left-6 z-40 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-slate-900 animate-bounce active:scale-95 transition-all text-xs cursor-pointer"
        title="أنشر إعلان جديد"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>+ أنشر إعلانك</span>
      </button>
    </div>
  );
}
