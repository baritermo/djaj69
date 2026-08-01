'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface WilayaPriceBoardProps {
  onReportForWilaya: (wilayaCode: string) => void;
  pricesList: any[];
  isLoading: boolean;
  onRefresh: () => void;
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
}

export default function WilayaPriceBoard({
  onReportForWilaya,
  pricesList,
  isLoading,
  onRefresh,
  currentUser,
  onOpenSubscribeModal,
}: WilayaPriceBoardProps) {
  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'code' | 'price_asc' | 'price_desc'>('code');

  const regions = [
    { id: 'all', label: 'كافة الولايات (58)' },
    { id: 'الشمال الأوسط', label: 'الشمال الأوسط' },
    { id: 'الشرق', label: 'الشرق' },
    { id: 'الغرب', label: 'الغرب' },
    { id: 'الهضاب العليا', label: 'الهضاب العليا' },
    { id: 'الجنوب', label: 'الجنوب' },
  ];

  const officialMap = useMemo(() => {
    const map: Record<string, any> = {};
    for (const p of pricesList) {
      if (!p || !p.wilayaCode) continue;
      const code = String(p.wilayaCode).padStart(2, '0');
      map[code] = p;
    }
    return map;
  }, [pricesList]);

  // Helper for rendering price or "غير محدد"
  const formatDisplayPrice = (val: any) => {
    if (val === null || val === undefined || val === '' || isNaN(val) || Number(val) === 0) {
      return <span className="text-slate-400 font-bold text-xs">غير محدد</span>;
    }
    return <>{val} <span className="text-[10px] font-normal opacity-75">د.ج</span></>;
  };

  // Build wilaya data with prices from DB (defaults to null / غير محدد)
  const wilayaDataWithPrices = useMemo(() => {
    return ALGERIA_WILAYAS.map((wilaya) => {
      const dbOfficial = officialMap[wilaya.code];

      const farmerPrice = dbOfficial?.farmerPrice ?? dbOfficial?.motawassitaFarmer ?? dbOfficial?.khashnaFarmer ?? null;
      const slaughterPrice = dbOfficial?.slaughterPrice ?? dbOfficial?.motawassitaSlaughter ?? dbOfficial?.khashnaSlaughter ?? null;
      const intermediaryPrice = dbOfficial?.intermediaryPrice ?? dbOfficial?.motawassitaIntermediary ?? dbOfficial?.khashnaIntermediary ?? null;

      const khashna = { farmer: farmerPrice, slaughter: slaughterPrice, intermediary: intermediaryPrice };
      const trend = dbOfficial?.trend || wilaya.trend;
      const trendPercent = dbOfficial?.trendPercent || wilaya.trendPercent;

      const validFarmerPrices = [farmerPrice].map(Number).filter((v) => !isNaN(v) && v > 0);
      const avgPrice = validFarmerPrices.length > 0 ? validFarmerPrices[0] : 0;

      return {
        ...wilaya,
        khashna,
        trend,
        trendPercent,
        avgPrice,
      };
    });
  }, [officialMap, pricesList]);

  // Filter and sort
  const filteredWilayas = useMemo(() => {
    return wilayaDataWithPrices
      .filter((w) => {
        const matchesSearch =
          w.nameAr.includes(searchQuery) ||
          w.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.code.includes(searchQuery);
        const matchesRegion = selectedRegion === 'all' ? true : w.region === selectedRegion;
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return parseInt(a.code) - parseInt(b.code);
        if (sortBy === 'price_asc') return a.avgPrice - b.avgPrice;
        if (sortBy === 'price_desc') return b.avgPrice - a.avgPrice;
        return 0;
      });
  }, [wilayaDataWithPrices, searchQuery, selectedRegion, sortBy]);

  return (
    <div className="space-y-6">
      {/* Official Exchange Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-5 shadow-xl border border-emerald-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-2xl shadow-lg shrink-0">
            🏛️
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500 text-emerald-950 font-black text-[11px] rounded-md mb-1">
              📊 التحديث اليومي لـ 58 ولاية
            </div>
            <h2 className="text-xl font-black text-white">
              بورصة أسعار الدواجن لـ 58 ولاية جزائرية
            </h2>
            <p className="text-xs text-emerald-100">
              أسعار الأسواق المجمعة حياً من البورصة الميدانية والتجار والصفحات المباشرة.
            </p>
          </div>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onReportForWilaya('16')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            📊 تحديث أسعار ولاية
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="ابحث باسم الولاية أو رقمها (مثال: 16، الجزائر، سطيف...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSortBy('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sortBy === 'code'
                    ? 'bg-emerald-800 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ترتيب بالرقم
              </button>
              <button
                onClick={() => setSortBy('price_asc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sortBy === 'price_asc'
                    ? 'bg-emerald-800 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                الأقل سعراً
              </button>
              <button
                onClick={() => setSortBy('price_desc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  sortBy === 'price_desc'
                    ? 'bg-emerald-800 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                الأعلى سعراً
              </button>
            </div>

            <button
              onClick={onRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedRegion === reg.id
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* WILAYA CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWilayas.map((w) => {
          const regionLabel =
            w.region === 'الشمال الأوسط'
              ? 'وسط'
              : w.region === 'الشرق'
              ? 'شرق'
              : w.region === 'الغرب'
              ? 'غرب'
              : w.region === 'الهضاب العليا'
              ? 'هضاب'
              : 'جنوب';

          return (
            <div
              key={w.code}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Wilaya Compact Card Header */}
              <div className="p-4 bg-gradient-to-l from-emerald-950 to-emerald-850 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-amber-400 text-emerald-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                      {w.code}
                    </span>
                    <div>
                      <h3 className="text-base font-black flex items-center gap-1.5">
                        {w.nameAr}
                        <span className="text-xs text-amber-300 font-bold">({regionLabel})</span>
                      </h3>
                      <span className="text-[11px] text-emerald-200">{w.nameFr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.trend === 'up' && (
                      <span className="flex items-center text-xs font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded-lg border border-rose-700/50">
                        <TrendingUp className="w-3 h-3 ml-1" /> {w.trendPercent}
                      </span>
                    )}
                    {w.trend === 'down' && (
                      <span className="flex items-center text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-700/50">
                        <TrendingDown className="w-3 h-3 ml-1" /> {w.trendPercent}
                      </span>
                    )}
                    {w.trend === 'stable' && (
                      <span className="flex items-center text-xs font-bold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-600/50">
                        <Minus className="w-3 h-3 ml-1" /> مستقر
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary Price Badges with Distinct Custom Colors */}
                <div className="relative mt-3">
                  <div className={`grid grid-cols-3 gap-2 transition ${!isSubscribed ? 'blur-sm select-none pointer-events-none' : ''}`}>
                    {/* 🌾 فلاح */}
                    <div className="bg-gradient-to-b from-emerald-950/90 to-emerald-900/80 border border-emerald-500/40 rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center">
                      <div className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md font-black text-[10px] mb-1">
                        <span>🌾</span> فلاح
                      </div>
                      <div className="text-sm md:text-base font-black text-amber-300 drop-shadow-xs">
                        {formatDisplayPrice(w.khashna.farmer)}
                      </div>
                    </div>

                    {/* 🔪 مذبح */}
                    <div className="bg-gradient-to-b from-indigo-950/90 to-slate-900/80 border border-indigo-500/40 rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center">
                      <div className="inline-flex items-center gap-1 text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-md font-black text-[10px] mb-1">
                        <span>🔪</span> مذبح
                      </div>
                      <div className="text-sm md:text-base font-black text-cyan-200 drop-shadow-xs">
                        {formatDisplayPrice(w.khashna.slaughter)}
                      </div>
                    </div>

                    {/* 🤝 وسيط */}
                    <div className="bg-gradient-to-b from-amber-950/90 to-slate-900/80 border border-amber-500/40 rounded-xl p-2 text-center shadow-sm flex flex-col items-center justify-center">
                      <div className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md font-black text-[10px] mb-1">
                        <span>🤝</span> وسيط
                      </div>
                      <div className="text-sm md:text-base font-black text-amber-300 drop-shadow-xs">
                        {formatDisplayPrice(w.khashna.intermediary)}
                      </div>
                    </div>
                  </div>

                  {!isSubscribed && (
                    <button
                      onClick={onOpenSubscribeModal}
                      className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-black text-amber-300 hover:text-amber-200 border border-amber-400/50 shadow-md cursor-pointer transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>🔒 عرض الأسعار للمشتركين (انقر للتفعيل)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Actions Footer */}
              {currentUser?.role === 'admin' && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => onReportForWilaya(w.code)}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl text-xs transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تحديث الأسعار</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredWilayas.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          لم يتم العثور على ولاية تطابق بحثك. جرب البحث باسم أو رقم آخر.
        </div>
      )}
    </div>
  );
}
