'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Search, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface BuyerPost {
  id: number;
  offerType: 'slaughterhouse' | 'broker';
  name: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  phone: string;
  buyKhashna: number | null;
  buyMotawassita: number | null;
  buyRaqiqa: number | null;
  maxPurchaseKg: string;
  deliveryArea: string;
  buyingDetails: string;
  verified: boolean;
  isBotGenerated?: boolean;
  is_bot_generated?: boolean;
}

interface BuyersByWilayaProps {
  buyers: BuyerPost[];
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
}

export default function BuyersByWilaya({ buyers, currentUser, onOpenSubscribeModal }: BuyersByWilayaProps) {
  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';
  const [activeSubTab, setActiveSubTab] = useState<'slaughterhouse' | 'broker'>('slaughterhouse');
  const [wilayaCode, setWilayaCode] = useState('all');
  const [query, setQuery] = useState('');
  
  // Track open/closed states. Default is CLOSED for all wilayas & cards
  const [openWilayas, setOpenWilayas] = useState<Record<string, boolean>>({});
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});

  const toggleWilaya = (code: string) => {
    setOpenWilayas((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleCard = (id: number) => {
    if (!isSubscribed) {
      if (onOpenSubscribeModal) onOpenSubscribeModal();
      return;
    }
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasBothTypes = buyers.some((b) => b.offerType === 'slaughterhouse') && buyers.some((b) => b.offerType === 'broker');

  const filtered = useMemo(() => {
    return buyers.filter((b) => {
      const typeMatch = !hasBothTypes || b.offerType === activeSubTab;
      const wMatch = wilayaCode === 'all' || b.wilayaCode === wilayaCode;
      const q = query.toLowerCase();
      const qMatch = !q || b.name.toLowerCase().includes(q) || b.wilayaName.includes(q) || b.commune.includes(q);
      return typeMatch && wMatch && qMatch;
    });
  }, [buyers, hasBothTypes, activeSubTab, wilayaCode, query]);

  // Group by wilaya
  const grouped = useMemo(() => {
    const map = new Map<string, BuyerPost[]>();
    filtered.forEach((b) => {
      const arr = map.get(b.wilayaCode) || [];
      arr.push(b);
      map.set(b.wilayaCode, arr);
    });
    return map;
  }, [filtered]);

  const codes = Array.from(grouped.keys()).sort((a, b) => parseInt(a) - parseInt(b));

  const isSlaughterhouse = !hasBothTypes ? buyers[0]?.offerType === 'slaughterhouse' : activeSubTab === 'slaughterhouse';
  const label = isSlaughterhouse ? 'المذابح المعتمدة' : 'الكورتي / الوسطاء';
  const icon = isSlaughterhouse ? '🔪' : '🤝';

  return (
    <section className="space-y-5 select-none">
      {/* Slaughterhouse / Broker sub-tabs */}
      {hasBothTypes && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('slaughterhouse')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition ${
              activeSubTab === 'slaughterhouse'
                ? 'bg-indigo-800 text-white border-indigo-800 shadow'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
            }`}
          >
            🔪 عروض المذابح (شراء)
          </button>
          <button
            onClick={() => setActiveSubTab('broker')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition ${
              activeSubTab === 'broker'
                ? 'bg-amber-600 text-white border-amber-600 shadow'
                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
            }`}
          >
            🤝 عروض الكورتي (شراء)
          </button>
        </div>
      )}

      <div className={`rounded-2xl border p-4 ${isSlaughterhouse ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <span className="p-2 bg-white rounded-xl text-lg">{icon}</span>
          <div>
            <h3 className="font-black text-base text-slate-900">{label} — أسعار الشراء والطلب</h3>
            <p className="text-xs text-slate-600 mt-1">
              اضغط على أي ولاية ثم اضغط على زر <b>المزيد 🔽</b> لاستعراض أرقام الشراء وسعة الاستيعاب اليومية.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`ابحث في ${label}...`}
            className="w-full pr-9 pl-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="px-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none">
          <option value="all">كل الولايات</option>
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.nameAr}
            </option>
          ))}
        </select>
      </div>

      {codes.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm font-bold">لا توجد عروض لهذه الفئة حالياً.</div>
      )}

      {codes.map((code) => {
        const wilaya = ALGERIA_WILAYAS.find((w) => w.code === code);
        const posts = grouped.get(code)!;
        
        // Auto-expand wilaya if user searched or selected specific wilaya
        const isWilayaOpen = (wilayaCode !== 'all' || query.trim() !== '') ? (openWilayas[code] ?? true) : Boolean(openWilayas[code]);

        return (
          <div key={code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition">
            {/* Wilaya Header Bar with Open/Close Toggle */}
            <div
              onClick={() => toggleWilaya(code)}
              className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition select-none text-white ${
                isSlaughterhouse ? 'bg-indigo-900 hover:bg-indigo-850' : 'bg-amber-700 hover:bg-amber-650'
              }`}
            >
              <span className="text-lg">📍</span>
              <span className="font-black text-base">{wilaya?.nameAr || `ولاية ${code}`}</span>
              <span className="text-white/70 text-xs">({wilaya?.nameFr})</span>

              <div className="mr-auto flex items-center gap-2">
                <span className="bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  {posts.length} {isSlaughterhouse ? 'مذبح' : 'كورتي'}
                  {isWilayaOpen ? (
                    <span className="text-[11px] font-black text-white/90">طي 🔼</span>
                  ) : (
                    <span className="text-[11px] font-black text-amber-200">المزيد 🔽</span>
                  )}
                </span>
              </div>
            </div>

            {/* Buyer Cards Container */}
            {isWilayaOpen && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                {posts.map((buyer) => {
                  const isCardOpen = isSubscribed && Boolean(openCards[buyer.id]);
                  return (
                    <div
                      key={buyer.id}
                      className={`relative rounded-xl border p-4 transition overflow-hidden ${
                        buyer.offerType === 'slaughterhouse'
                          ? 'border-indigo-200 bg-gradient-to-bl from-indigo-50/50 to-white hover:border-indigo-400'
                          : 'border-amber-200 bg-gradient-to-bl from-amber-50/50 to-white hover:border-amber-400'
                      }`}
                    >
                      {/* Card Content (Blurred when not subscribed) */}
                      <div className={!isSubscribed ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}>
                        {/* Icon Header with Toggle Button */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base shadow-md shrink-0 ${
                              buyer.offerType === 'slaughterhouse' ? 'bg-indigo-600' : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {buyer.offerType === 'slaughterhouse' ? '🔪' : '🤝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-slate-900 truncate">{buyer.name}</h4>
                              {buyer.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-600" /> {buyer.commune}
                              {buyer.maxPurchaseKg && (
                                <span className="mr-1 bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded font-black text-[10px]">
                                  {buyer.maxPurchaseKg}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* "المزيد 🔽" Expand Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(buyer.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-black shadow-xs ${
                              isCardOpen
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : buyer.offerType === 'slaughterhouse'
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            }`}
                            title={isCardOpen ? "طي التفاصيل" : "عرض المزيد من التفاصيل"}
                          >
                            {isCardOpen ? (
                              <>
                                <span>طي</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>المزيد</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Detailed Offer Body (Shown when Open) */}
                        {isCardOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fadeIn">
                            {/* Buying Prices Breakdown */}
                            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                                <span className="text-slate-500 block">خشنة</span>
                                <span className="text-xs font-black text-indigo-900">
                                  {buyer.buyKhashna ? `${buyer.buyKhashna} د.ج` : '—'}
                                </span>
                              </div>
                              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                                <span className="text-slate-500 block">متوسطة</span>
                                <span className="text-xs font-black text-indigo-900">
                                  {buyer.buyMotawassita ? `${buyer.buyMotawassita} د.ج` : '—'}
                                </span>
                              </div>
                              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                                <span className="text-slate-500 block">رقيقة</span>
                                <span className="text-xs font-black text-indigo-900">
                                  {buyer.buyRaqiqa ? `${buyer.buyRaqiqa} د.ج` : '—'}
                                </span>
                              </div>
                            </div>

                            {buyer.deliveryArea && (
                              <p className="text-[11px] text-slate-700 font-medium">
                                <span className="font-black text-slate-900">منطقة التوزيع:</span> {buyer.deliveryArea}
                              </p>
                            )}

                            {buyer.buyingDetails && (
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {buyer.buyingDetails}
                              </p>
                            )}

                            {(() => {
                              const canDelete =
                                currentUser?.role === 'admin' ||
                                (currentUser?.phone && buyer.phone && (buyer.phone === currentUser.phone || buyer.phone.includes(currentUser.phone)));
                              const displayPhone = (buyer.isBotGenerated || buyer.is_bot_generated || buyer.phone?.includes('مخفي') || buyer.phone?.includes('غير معلن'))
                                ? '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر'
                                : buyer.phone;
                              return (
                                <div className="pt-1 flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-700">{displayPhone}</span>
                                  {canDelete && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm('هل أنت تأكد من حذف هذا العرض؟')) {
                                          try {
                                            const res = await fetch(`/api/offers/delete?id=${buyer.id}`, { method: 'DELETE' });
                                            if (res.ok) {
                                              alert('تم حذف العرض بنجاح.');
                                              window.location.reload();
                                            } else {
                                              alert('حدث خطأ أثناء الحذف.');
                                            }
                                          } catch (err) {
                                            alert('خطأ في الاتصال بالحذف.');
                                          }
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" /> حذف
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Locked Overlay for unsubscribed users */}
                      {!isSubscribed && (
                        <div
                          onClick={() => {
                            if (onOpenSubscribeModal) onOpenSubscribeModal();
                          }}
                          className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition hover:bg-slate-900/70"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg mb-1.5 animate-bounce">
                            <Lock className="w-4 h-4" />
                          </div>
                          <h4 className="text-white font-black text-xs">طلب شراء محمي بنظام البورصة</h4>
                          <p className="text-[10px] text-amber-200 font-bold mt-0.5">اشترك مجاناً لمشاهدة السعر والاتصال المباشر</p>
                          <button className="mt-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-3 py-1 rounded-lg shadow transition">
                            فتح الطلب الآن 🔓
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
