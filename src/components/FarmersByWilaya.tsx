'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Search, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface FarmerCard {
  id: number;
  name: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  phone: string;
  chickenCategories: string;
  weightRange: string;
  availableQuantity: string;
  breedType: string;
  farmAcreage: string;
  chickenAge: string;
  details: string;
  verified: boolean;
  isBotGenerated?: boolean;
  is_bot_generated?: boolean;
}

interface FarmersByWilayaProps {
  farmers: FarmerCard[];
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
}

export default function FarmersByWilaya({ farmers, currentUser, onOpenSubscribeModal }: FarmersByWilayaProps) {
  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';
  const [wilayaCode, setWilayaCode] = useState('all');
  const [query, setQuery] = useState('');
  
  // Track open/closed states. Default is CLOSED for all wilayas & cards
  const [openWilayas, setOpenWilayas] = useState<Record<string, boolean>>({});
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});

  const toggleWilaya = (code: string) => {
    setOpenWilayas((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleCard = (farmerId: number) => {
    if (!isSubscribed) {
      if (onOpenSubscribeModal) onOpenSubscribeModal();
      return;
    }
    setOpenCards((prev) => ({ ...prev, [farmerId]: !prev[farmerId] }));
  };

  const grouped = useMemo(() => {
    const filtered = farmers.filter((f) => {
      const wMatch = wilayaCode === 'all' || f.wilayaCode === wilayaCode;
      const q = query.toLowerCase();
      const qMatch = !q || f.name.toLowerCase().includes(q) || f.wilayaName.includes(q) || f.commune.includes(q);
      return wMatch && qMatch;
    });
    const map = new Map<string, FarmerCard[]>();
    filtered.forEach((f) => {
      const existing = map.get(f.wilayaCode) || [];
      existing.push(f);
      map.set(f.wilayaCode, existing);
    });
    return map;
  }, [farmers, wilayaCode, query]);

  const displayedWilayas = Array.from(grouped.keys()).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <section className="space-y-5 select-none">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن فلاح..."
            className="w-full pr-9 pl-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="px-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none">
          <option value="all">كل الولايات</option>
          {ALGERIA_WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.code} — {w.nameAr}</option>)}
        </select>
      </div>

      {displayedWilayas.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm font-bold">لا توجد عروض فلاحين حالياً.</div>
      )}

      {displayedWilayas.map((code) => {
        const wilaya = ALGERIA_WILAYAS.find((w) => w.code === code);
        const items = grouped.get(code)!;
        
        // Wilaya cards are open by default so offers are immediately visible
        const isWilayaOpen = openWilayas[code] ?? true;

        return (
          <div key={code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition">
            {/* Wilaya Header Bar with Open/Close Toggle */}
            <div
              onClick={() => toggleWilaya(code)}
              className="bg-emerald-800 hover:bg-emerald-750 text-white px-5 py-3 flex items-center gap-3 cursor-pointer transition select-none"
            >
              <span className="text-lg">📍</span>
              <span className="font-black text-base">{wilaya?.nameAr || `ولاية ${code}`}</span>
              <span className="text-emerald-200 text-xs">({wilaya?.nameFr})</span>
              
              <div className="mr-auto flex items-center gap-2">
                <span className="bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  {items.length} {items.length === 1 ? 'فلاح' : 'فلاحين'}
                  {isWilayaOpen ? (
                    <>
                      <span className="text-[11px] font-black text-emerald-200">طي 🔼</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-black text-amber-300">المزيد 🔽</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Farmer Cards Container */}
            {isWilayaOpen && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                {items.map((farmer) => {
                  const isCardOpen = isSubscribed && Boolean(openCards[farmer.id]);
                  return (
                    <div key={farmer.id} className="relative rounded-xl border border-slate-200 bg-gradient-to-bl from-emerald-50/60 to-white p-4 hover:shadow-lg hover:border-emerald-400 transition overflow-hidden">
                      {/* Card Content (Blurred when not subscribed) */}
                      <div className={!isSubscribed ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}>
                        {/* Icon Header with Open/Close Toggle Button */}
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-base shadow-md shrink-0">
                            🌾
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-slate-900 truncate">{farmer.name}</h4>
                              {farmer.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600" /> {farmer.commune}
                              {farmer.availableQuantity && (
                                <span className="mr-1 bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-black text-[10px]">
                                  {farmer.availableQuantity}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* "المزيد 🔽" Expand Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(farmer.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-black shadow-xs ${
                              isCardOpen
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
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
                          <div className="mt-3 pt-3 border-t border-emerald-100 space-y-2 animate-fadeIn">
                            {((farmer as any).farmerPrice || (farmer as any).farmer_price) && (
                              <div className="bg-gradient-to-r from-amber-500 to-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center justify-between">
                                <span>🌾 سعر البيع المطلوب:</span>
                                <span className="text-sm font-black text-amber-200">{((farmer as any).farmerPrice || (farmer as any).farmer_price)} د.ج/كغ</span>
                              </div>
                            )}
                            <div className="space-y-1.5 text-[11px] text-slate-700">
                              {farmer.chickenCategories && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الفئة:</span><span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">{farmer.chickenCategories}</span></p>}
                              {farmer.weightRange && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الوزن:</span><span>{farmer.weightRange}</span></p>}
                              {farmer.availableQuantity && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الكمية:</span><span>{farmer.availableQuantity}</span></p>}
                              {farmer.breedType && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">السلالة:</span><span>{farmer.breedType}</span></p>}
                              {farmer.chickenAge && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">العمر:</span><span>{farmer.chickenAge}</span></p>}
                            </div>

                            {farmer.details && (
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">{farmer.details}</p>
                            )}

                            {(() => {
                              const canDelete = currentUser?.role === 'admin' || (currentUser?.phone && farmer.phone && (farmer.phone === currentUser.phone || farmer.phone.includes(currentUser.phone)));
                              const displayPhone = (farmer.isBotGenerated || farmer.is_bot_generated || farmer.phone?.includes('مخفي') || farmer.phone?.includes('غير معلن'))
                                ? '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر'
                                : farmer.phone;
                              return (
                                <div className="pt-1 flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-700">{displayPhone}</span>
                                  {canDelete && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm('هل أنت تأكد من حذف هذا العرض؟')) {
                                          try {
                                            const res = await fetch(`/api/offers/delete?id=${farmer.id}`, { method: 'DELETE' });
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
                          <h4 className="text-white font-black text-xs">عرض محمي بنظام البورصة</h4>
                          <p className="text-[10px] text-amber-200 font-bold mt-0.5">اشترك مجاناً لمشاهدة السعر والاتصال المباشر</p>
                          <button className="mt-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-3 py-1 rounded-lg shadow transition">
                            فتح العرض الآن 🔓
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
