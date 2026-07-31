'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ArrowUpDown,
  AlertTriangle,
  Info,
  Plus,
  RefreshCw,
  Award,
  Filter,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Lock,
} from 'lucide-react';
import { ALGERIA_WILAYAS, WilayaInfo } from '@/lib/algeria-data';

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
  const [expandedWilayas, setExpandedWilayas] = useState<Record<string, boolean>>({});

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

  // Build wilaya data with prices from DB or fallback
  const wilayaDataWithPrices = useMemo(() => {
    return ALGERIA_WILAYAS.map((wilaya) => {
      const dbOfficial = officialMap[wilaya.code];

      if (dbOfficial && dbOfficial.khashnaFarmer !== undefined) {
        const khashna = {
          farmer: dbOfficial.khashnaFarmer,
          slaughter: dbOfficial.khashnaSlaughter,
          intermediary: dbOfficial.khashnaIntermediary,
        };
        const motawassita = {
          farmer: dbOfficial.motawassitaFarmer,
          slaughter: dbOfficial.motawassitaSlaughter,
          intermediary: dbOfficial.motawassitaIntermediary,
        };
        const raqiqa = {
          farmer: dbOfficial.raqiqaFarmer,
          slaughter: dbOfficial.raqiqaSlaughter,
          intermediary: dbOfficial.raqiqaIntermediary,
        };

        const trend = dbOfficial.trend || wilaya.trend;
        const trendPercent = dbOfficial.trendPercent || wilaya.trendPercent;

        return {
          ...wilaya,
          khashna,
          motawassita,
          raqiqa,
          trend,
          trendPercent,
          avgPrice: Math.round((khashna.farmer + motawassita.farmer + raqiqa.farmer) / 3),
        };
      }

      const dbKhashna = pricesList.find((p) => String(p.wilayaCode).padStart(2, '0') === wilaya.code && p.category === 'خشنة');
      const dbMotawassita = pricesList.find((p) => String(p.wilayaCode).padStart(2, '0') === wilaya.code && p.category === 'متوسطة');
      const dbRaqiqa = pricesList.find((p) => String(p.wilayaCode).padStart(2, '0') === wilaya.code && p.category === 'رقيقة');

      const khashna = {
        farmer: dbKhashna?.farmerPrice ?? wilaya.khashna_farmer,
        slaughter: dbKhashna?.slaughterPrice ?? wilaya.khashna_slaughter,
        intermediary: dbKhashna?.intermediaryPrice ?? wilaya.khashna_intermediary,
      };
      const motawassita = {
        farmer: dbMotawassita?.farmerPrice ?? wilaya.motawassita_farmer,
        slaughter: dbMotawassita?.slaughterPrice ?? wilaya.motawassita_slaughter,
        intermediary: dbMotawassita?.intermediaryPrice ?? wilaya.motawassita_intermediary,
      };
      const raqiqa = {
        farmer: dbRaqiqa?.farmerPrice ?? wilaya.raqiqa_farmer,
        slaughter: dbRaqiqa?.slaughterPrice ?? wilaya.raqiqa_slaughter,
        intermediary: dbRaqiqa?.intermediaryPrice ?? wilaya.raqiqa_intermediary,
      };

      const trend = dbKhashna?.trend ?? wilaya.trend;
      const trendPercent = dbKhashna?.trendChangePercent ?? wilaya.trendPercent;

      return {
        ...wilaya,
        khashna,
        motawassita,
        raqiqa,
        trend,
        trendPercent,
        avgPrice: Math.round((khashna.farmer + motawassita.farmer + raqiqa.farmer) / 3),
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

  // Quick stats
  const sortedByAvg = [...wilayaDataWithPrices].sort((a, b) => a.avgPrice - b.avgPrice);
  const cheapestW = sortedByAvg[0];
  const highestW = sortedByAvg[sortedByAvg.length - 1];
  const nationalAvg = Math.round(
    wilayaDataWithPrices.reduce((acc, curr) => acc + curr.avgPrice, 0) / wilayaDataWithPrices.length
  );

  const toggleExpand = (code: string) => {
    setExpandedWilayas((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const isAllExpanded =
    filteredWilayas.length > 0 && filteredWilayas.every((w) => expandedWilayas[w.code]);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedWilayas({});
    } else {
      const all: Record<string, boolean> = {};
      filteredWilayas.forEach((w) => {
        all[w.code] = true;
      });
      setExpandedWilayas(all);
    }
  };

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
              onClick={toggleExpandAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              title={isAllExpanded ? 'طي الجميع' : 'توسيع الجميع'}
            >
              {isAllExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" /> طي الكل
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" /> عرض تفاصيل الكل
                </>
              )}
            </button>

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

      {/* ===== COMPACT WILAYA CARDS GRID WITH "SHOW MORE / عرض المزيد" ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWilayas.map((w) => {
          const isExpanded = !!expandedWilayas[w.code];
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
              className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between ${
                isExpanded ? 'md:col-span-2 lg:col-span-3 border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : ''
              }`}
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

                {/* Summary Price Badges inside the Compact Header */}
                <div className="relative mt-3">
                  <div className={`grid grid-cols-3 gap-2 bg-emerald-900/60 p-2 rounded-xl border border-emerald-700/40 text-center transition ${!isSubscribed ? 'blur-sm select-none pointer-events-none' : ''}`}>
                    <div>
                      <div className="text-[10px] text-emerald-200 font-bold">🌾 فلاح</div>
                      <div className="text-sm font-black text-amber-300">
                        {w.khashna.farmer} <span className="text-[10px] font-normal text-emerald-100">د.ج</span>
                      </div>
                    </div>
                    <div className="border-r border-emerald-700/60">
                      <div className="text-[10px] text-indigo-200 font-bold">🔪 مذبح</div>
                      <div className="text-sm font-black text-white">
                        {w.khashna.slaughter} <span className="text-[10px] font-normal text-emerald-100">د.ج</span>
                      </div>
                    </div>
                    <div className="border-r border-emerald-700/60">
                      <div className="text-[10px] text-amber-200 font-bold">🤝 وسيط</div>
                      <div className="text-sm font-black text-amber-300">
                        {w.khashna.intermediary} <span className="text-[10px] font-normal text-emerald-100">د.ج</span>
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

              {/* ===== EXPANDABLE DETAILED TABLE (Appears when "عرض المزيد" is clicked) ===== */}
              {isExpanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>تفاصيل الأسعار حسب الفئة في ولاية {w.nameAr}:</span>
                    <span className="text-slate-400 font-normal text-[11px]">سعر الكلغم بالدينار</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="py-2.5 px-3 font-black text-slate-800 bg-slate-200/80 text-right pr-4">
                            الفئة
                          </th>
                          <th className="py-2.5 px-3 font-black text-emerald-800 bg-emerald-50/70 border-r border-slate-200">
                            🌾 فلاح
                          </th>
                          <th className="py-2.5 px-3 font-black text-indigo-800 bg-indigo-50/70 border-r border-slate-200">
                            🔪 مذبح
                          </th>
                          <th className="py-2.5 px-3 font-black text-amber-800 bg-amber-50/70 border-r border-slate-200">
                            🤝 وسيط
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {/* خشنة */}
                        <tr className="hover:bg-emerald-50/20 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50 text-right pr-4">
                            خشنة <span className="text-[10px] text-slate-500 font-normal">(&gt;2.3 كغ)</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-emerald-800 text-sm">
                            {w.khashna.farmer} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-indigo-800 text-sm">
                            {w.khashna.slaughter} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-amber-800 text-sm">
                            {w.khashna.intermediary} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                        </tr>
                        {/* متوسطة */}
                        <tr className="hover:bg-emerald-50/20 transition bg-white">
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50 text-right pr-4">
                            متوسطة <span className="text-[10px] text-slate-500 font-normal">(1.6-2.3 كغ)</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-emerald-800 text-sm">
                            {w.motawassita.farmer} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-indigo-800 text-sm">
                            {w.motawassita.slaughter} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-amber-800 text-sm">
                            {w.motawassita.intermediary} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                        </tr>
                        {/* رقيقة */}
                        <tr className="hover:bg-emerald-50/20 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50 text-right pr-4">
                            رقيقة <span className="text-[10px] text-slate-500 font-normal">(&lt;1.6 كغ)</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-emerald-800 text-sm">
                            {w.raqiqa.farmer} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-indigo-800 text-sm">
                            {w.raqiqa.slaughter} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-black text-amber-800 text-sm">
                            {w.raqiqa.intermediary} <span className="text-[10px] font-normal text-slate-500">د.ج</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleExpand(w.code)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition ${
                    isExpanded
                      ? 'bg-emerald-800 text-white shadow-sm hover:bg-emerald-900'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {isExpanded ? (
                    <>
                      إخفاء التفاصيل <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      عرض المزيد <ChevronDown className="w-4 h-4 text-emerald-700" />
                    </>
                  )}
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => onReportForWilaya(w.code)}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl text-xs transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تحديث الأسعار</span>
                  </button>
                )}
              </div>
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

