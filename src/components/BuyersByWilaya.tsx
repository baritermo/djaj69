import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Phone, Search, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
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
  const [closedWilayas, setClosedWilayas] = useState<Record<string, boolean>>({});
  const [closedCards, setClosedCards] = useState<Record<number, boolean>>({});

  const toggleWilaya = (code: string) => {
    setClosedWilayas((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleCard = (id: number) => {
    setClosedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = useMemo(() => {
    return buyers.filter((b) => {
      const typeMatch = b.offerType === activeSubTab;
      const wMatch = wilayaCode === 'all' || b.wilayaCode === wilayaCode;
      const q = query.toLowerCase();
      const qMatch = !q || b.name.toLowerCase().includes(q) || b.wilayaName.includes(q) || b.commune.includes(q);
      return typeMatch && wMatch && qMatch;
    });
  }, [buyers, activeSubTab, wilayaCode, query]);

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

  const isSlaughterhouse = activeSubTab === 'slaughterhouse';
  const label = isSlaughterhouse ? 'المذابح' : 'الكورتي / الوسطاء';
  const icon = isSlaughterhouse ? '🔪' : '🤝';

  return (
    <section className="space-y-5 select-none">
      {/* Slaughterhouse / Broker sub-tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveSubTab('slaughterhouse')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition ${activeSubTab === 'slaughterhouse' ? 'bg-indigo-800 text-white border-indigo-800 shadow' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'}`}>
          🔪 عروض المذابح (شراء)
        </button>
        <button onClick={() => setActiveSubTab('broker')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition ${activeSubTab === 'broker' ? 'bg-amber-600 text-white border-amber-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'}`}>
          🤝 عروض الكورتي (شراء)
        </button>
      </div>

      <div className={`rounded-2xl border p-4 ${isSlaughterhouse ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <span className="p-2 bg-white rounded-xl text-lg">{icon}</span>
          <div>
            <h3 className="font-black text-base text-slate-900">{label} — أسعار الشراء لمستويات التعامل</h3>
            <p className="text-xs text-slate-600 mt-1">
              {isSlaughterhouse
                ? 'المذابح تعلن هنا عن الأسعار التي تشتري بها. اضغط على أيقونة فتح/غلق للتحكم في تفاصيل العرض.'
                : 'الوسطاء (الكورتي) يعلنون هنا عن أسعار الشراء. اضغط على زر فتح/غلق للتحكم كلياً.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`ابحث في ${label}...`} className="w-full pr-9 pl-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600" />
        </div>
        <select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="px-3 py-2.5 border border-slate-300 bg-slate-50 rounded-xl text-xs font-bold focus:outline-none">
          <option value="all">كل الولايات</option>
          {ALGERIA_WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.code} — {w.nameAr}</option>)}
        </select>
      </div>

      {codes.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm font-bold">لا توجد عروض {label} حالياً.</div>
      )}

      {codes.map((code) => {
        const wilaya = ALGERIA_WILAYAS.find((w) => w.code === code);
        const items = grouped.get(code)!;
        const isWilayaClosed = closedWilayas[code];

        return (
          <div key={code} className={`rounded-2xl border shadow-sm overflow-hidden transition ${isSlaughterhouse ? 'border-indigo-200' : 'border-amber-200'}`}>
            {/* Wilaya Header with Open/Close Toggle */}
            <div
              onClick={() => toggleWilaya(code)}
              className={`px-5 py-3 flex items-center gap-3 text-white cursor-pointer transition select-none ${isSlaughterhouse ? 'bg-indigo-800 hover:bg-indigo-750' : 'bg-amber-600 hover:bg-amber-550'}`}
            >
              <span className="text-lg">📍</span>
              <span className="font-black text-base">{wilaya?.nameAr || `ولاية ${code}`}</span>
              <span className={`${isSlaughterhouse ? 'text-indigo-200' : 'text-amber-200'} text-xs`}>({wilaya?.nameFr})</span>
              <span className="mr-auto bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                {items.length} {isSlaughterhouse ? 'مذبح' : 'كورتي'}
                {isWilayaClosed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </span>
            </div>

            {!isWilayaClosed && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                {items.map((b) => {
                  const isCardClosed = closedCards[b.id];
                  return (
                    <div key={b.id} className={`relative rounded-xl border p-4 bg-white hover:shadow-lg transition overflow-hidden ${isSlaughterhouse ? 'border-indigo-200 hover:border-indigo-400' : 'border-amber-200 hover:border-amber-400'}`}>
                      {/* Card Body (Blurred when not subscribed) */}
                      <div className={!isSubscribed ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}>
                        {/* Card Header with Open/Close Button */}
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow shrink-0 ${isSlaughterhouse ? 'bg-indigo-600' : 'bg-amber-500'}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-slate-900 truncate">{b.name}</h4>
                              {b.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                              <MapPin className="w-3 h-3" /> {b.commune}
                            </div>
                          </div>

                          {/* Open/Close Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(b.id);
                            }}
                            className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                              isSlaughterhouse ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950' : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                            }`}
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

                        {/* Card Details Body (Shown when Open) */}
                        {!isCardClosed && (
                          <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
                            {/* Buying Prices Table */}
                            <div className={`relative rounded-xl border overflow-hidden mb-3 ${isSlaughterhouse ? 'border-indigo-200' : 'border-amber-200'}`}>
                              <table className="w-full text-center text-xs border-collapse transition">
                                <thead>
                                  <tr className={`${isSlaughterhouse ? 'bg-indigo-50' : 'bg-amber-50'}`}>
                                    <th className="py-2 px-3 font-black text-slate-700">الفئة</th>
                                    <th className={`py-2 px-3 font-black ${isSlaughterhouse ? 'text-indigo-800' : 'text-amber-800'}`}>سعر الشراء (د.ج/كغ)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  <tr className="hover:bg-slate-50"><td className="py-1.5 px-3 font-bold text-slate-800">خشنة</td><td className="py-1.5 px-3 font-black text-emerald-800">{b.buyKhashna ?? '—'}</td></tr>
                                  <tr className="hover:bg-slate-50"><td className="py-1.5 px-3 font-bold text-slate-800">متوسطة</td><td className="py-1.5 px-3 font-black text-emerald-800">{b.buyMotawassita ?? '—'}</td></tr>
                                  <tr className="hover:bg-slate-50"><td className="py-1.5 px-3 font-bold text-slate-800">رقيقة</td><td className="py-1.5 px-3 font-black text-emerald-800">{b.buyRaqiqa ?? '—'}</td></tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-700 mb-3">
                              {b.maxPurchaseKg && <p>الكمية القصوى: <strong className="text-slate-900">{b.maxPurchaseKg}</strong></p>}
                              {b.deliveryArea && <p>نطاق التوزيع: <strong className="text-slate-900">{b.deliveryArea}</strong></p>}
                            </div>

                            {b.buyingDetails && (
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">{b.buyingDetails}</p>
                            )}

                            {(() => {
                              const canDelete = currentUser?.role === 'admin' || (currentUser?.phone && b.phone && (b.phone === currentUser.phone || b.phone.includes(currentUser.phone)));
                              return (
                                <div className="flex items-center gap-2">
                                  <a href={`tel:${b.phone}`} className={`flex-1 flex items-center justify-center gap-2 text-white text-xs font-black py-2 rounded-xl transition ${isSlaughterhouse ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-amber-500 hover:bg-amber-400 text-emerald-950'}`}>
                                    <Phone className="w-3.5 h-3.5" /> اتصال: {b.phone}
                                  </a>
                                  {canDelete && (
                                    <button
                                      onClick={async () => {
                                        if (confirm('هل أنت تأكد من حذف هذا العرض نهائياً؟')) {
                                          await fetch(`/api/offers?id=${b.id}`, { method: 'DELETE' });
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

                      {/* Subscription Lock Overlay when Not Subscribed */}
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
