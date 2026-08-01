'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Phone, Search, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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
  const [closedWilayas, setClosedWilayas] = useState<Record<string, boolean>>({});
  const [closedCards, setClosedCards] = useState<Record<number, boolean>>({});

  const toggleWilaya = (code: string) => {
    setClosedWilayas((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleCard = (farmerId: number) => {
    if (!isSubscribed) {
      if (onOpenSubscribeModal) onOpenSubscribeModal();
      return;
    }
    setClosedCards((prev) => ({ ...prev, [farmerId]: !prev[farmerId] }));
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
        const isWilayaClosed = closedWilayas[code];

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
              <span className="mr-auto bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                {items.length} {items.length === 1 ? 'فلاح' : 'فلاحين'}
                {isWilayaClosed ? <ChevronDown className="w-4 h-4 text-emerald-300" /> : <ChevronUp className="w-4 h-4 text-emerald-300" />}
              </span>
            </div>

            {/* Farmer Cards Container */}
            {!isWilayaClosed && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
                {items.map((farmer) => {
                  const isCardClosed = !isSubscribed ? true : closedCards[farmer.id];
                  return (
                    <div key={farmer.id} className="relative rounded-xl border border-slate-200 bg-gradient-to-bl from-emerald-50/60 to-white p-4 hover:shadow-lg hover:border-emerald-400 transition overflow-hidden">
                      {/* Card Content (Blurred when not subscribed) */}
                      <div className={!isSubscribed ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}>
                        {/* Icon Header with Open/Close Toggle Button */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                            🌾
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-slate-900 truncate">{farmer.name}</h4>
                              {farmer.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                              <MapPin className="w-3 h-3 text-emerald-600" /> {farmer.commune}
                            </div>
                          </div>
                          
                          {/* Open/Close Toggle Icon Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(farmer.id);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title={isCardClosed ? "فتح العرض" : "غلق العرض"}
                          >
                            {isCardClosed ? (
                              <>
                                <span>فتح</span>
                                <ChevronDown className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>غلق</span>
                                <ChevronUp className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Detailed Offer Body (Shown when Open) */}
                        {!isCardClosed && (
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
                              return (
                                <div className="mt-3 flex items-center gap-2">
                                  <a href={`tel:${farmer.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black py-2 rounded-xl transition shadow-xs">
                                    <Phone className="w-3.5 h-3.5 text-amber-300" /> اتصال: {farmer.phone}
                                  </a>
                                  {canDelete && (
                                    <button
                                      onClick={async () => {
                                        if (confirm('هل أنت تأكد من حذف عرض هذا الفلاح نهائياً؟')) {
                                          await fetch(`/api/offers?id=${farmer.id}`, { method: 'DELETE' });
                                          window.location.reload();
                                        }
                                      }}
                                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-200 cursor-pointer"
                                      title="حذف العرض"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Lock Overlay when Not Subscribed */}
                      {!isSubscribed && (
                        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center gap-2 z-30">
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-lg animate-bounce">
                            <Lock className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-amber-300 drop-shadow">
                            🔒 يرجى الاشتراك لرؤية العروض والاتصال
                          </span>
                          <button
                            onClick={onOpenSubscribeModal}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer transform hover:scale-105"
                          >
                            اشترك الآن
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
