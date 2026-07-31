'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, MapPin, Phone, Search, Lock } from 'lucide-react';
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
    <section className="space-y-5">
      <div className="flex items-center justify-between">
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
        return (
          <div key={code} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Wilaya Header Bar */}
            <div className="bg-emerald-800 text-white px-5 py-3 flex items-center gap-3">
              <span className="text-lg">📍</span>
              <span className="font-black text-base">{wilaya?.nameAr || `ولاية ${code}`}</span>
              <span className="text-emerald-200 text-xs">({wilaya?.nameFr})</span>
              <span className="mr-auto bg-white/15 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{items.length} {items.length === 1 ? 'فلاح' : 'فلاحين'}</span>
            </div>

            {/* Farmer Icons Row */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((farmer) => (
                <div key={farmer.id} className="rounded-xl border border-slate-200 bg-gradient-to-bl from-emerald-50/60 to-white p-4 hover:shadow-lg hover:border-emerald-400 transition cursor-pointer">
                  {/* Icon Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                      🌾
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm text-slate-900 truncate">{farmer.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {farmer.commune}
                      </div>
                    </div>
                    {farmer.verified && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    {farmer.chickenCategories && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الفئة:</span><span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">{farmer.chickenCategories}</span></p>}
                    {farmer.weightRange && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الوزن:</span><span>{farmer.weightRange}</span></p>}
                    {farmer.availableQuantity && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">الكمية:</span><span>{farmer.availableQuantity}</span></p>}
                    {farmer.breedType && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">السلالة:</span><span>{farmer.breedType}</span></p>}
                    {farmer.chickenAge && <p className="flex items-start gap-1"><span className="font-black text-slate-900 shrink-0">العمر:</span><span>{farmer.chickenAge}</span></p>}
                  </div>

                  {farmer.details && (
                    <p className="mt-2 text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">{farmer.details}</p>
                  )}

                  {isSubscribed ? (
                    <a href={`tel:${farmer.phone}`} className="mt-3 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black py-2 rounded-xl transition">
                      <Phone className="w-3.5 h-3.5 text-amber-300" /> اتصال: {farmer.phone}
                    </a>
                  ) : (
                    <button
                      onClick={onOpenSubscribeModal}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" /> 🔒 عرض أرقام الهواتف للمشتركين
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
