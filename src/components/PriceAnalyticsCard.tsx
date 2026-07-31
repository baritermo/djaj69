'use client';

import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export default function PriceAnalyticsCard() {
  const [birdsCount, setBirdsCount] = useState<number>(5000);
  const [chickPrice, setChickPrice] = useState<number>(68);
  const [feedQuintals, setFeedQuintals] = useState<number>(210);
  const [feedPricePerQuintal, setFeedPricePerQuintal] = useState<number>(7850);
  const [vetAndHeatingCost, setVetAndHeatingCost] = useState<number>(180000);
  const [mortalityRate, setMortalityRate] = useState<number>(5);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(2.4);

  const survivingBirds = Math.round(birdsCount * (1 - mortalityRate / 100));
  const totalWeightKg = survivingBirds * targetWeightKg;
  const totalChickCost = birdsCount * chickPrice;
  const totalFeedCost = feedQuintals * feedPricePerQuintal;
  const totalProductionCost = totalChickCost + totalFeedCost + vetAndHeatingCost;
  const costPerKg = totalWeightKg > 0 ? Math.round(totalProductionCost / totalWeightKg) : 0;
  const recommendedFarmPrice = costPerKg + 25;
  const recommendedRetailPrice = recommendedFarmPrice + 105;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-emerald-950 font-black text-xs rounded-full mb-3">
            <ShieldCheck className="w-4 h-4" /> أدوات ضبط الأسعار
          </div>
          <h2 className="text-2xl font-black mb-2">كيف يتم تحديد أسعار الدجاج حسب الفئة والبائع؟</h2>
          <p className="text-sm text-emerald-100 leading-relaxed">
            الأسعار تختلف حسب فئة الدجاج (خشنة/متوسطة/رقيقة) ونوع البائع (فلاح/مذبح/وسيط).
            الفلاح يبيع بسعر المزرعة، المذبح يبيع بعد الذبح بسعر الجملة، والوسيط يضيف هامش التوزيع.
          </p>
        </div>
      </div>

      {/* Explanation Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900 mb-4">مثال توضيحي — ولاية الجزائر (وسط)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="py-3 px-4 font-black text-slate-800 bg-slate-200">الفئة</th>
                <th className="py-3 px-4 font-black text-emerald-800 bg-emerald-50 border-r border-slate-200">🌾 فلاح</th>
                <th className="py-3 px-4 font-black text-indigo-800 bg-indigo-50 border-r border-slate-200">🔪 مذبح</th>
                <th className="py-3 px-4 font-black text-amber-800 bg-amber-50 border-r border-slate-200">🤝 وسيط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-emerald-50/30">
                <td className="py-3 px-4 font-black text-slate-900 bg-slate-50">خشنة</td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-emerald-800">310</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-indigo-800">300</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-amber-800">317</span> <span className="text-xs text-slate-500">د.ج</span></td>
              </tr>
              <tr className="hover:bg-emerald-50/30">
                <td className="py-3 px-4 font-black text-slate-900 bg-slate-50">متوسطة</td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-emerald-800">295</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-indigo-800">288</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-amber-800">302</span> <span className="text-xs text-slate-500">د.ج</span></td>
              </tr>
              <tr className="hover:bg-emerald-50/30">
                <td className="py-3 px-4 font-black text-slate-900 bg-slate-50">رقيقة</td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-emerald-800">280</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-indigo-800">275</span> <span className="text-xs text-slate-500">د.ج</span></td>
                <td className="py-3 px-4 border-r border-slate-200"><span className="text-lg font-black text-amber-800">285</span> <span className="text-xs text-slate-500">د.ج</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><Calculator className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900">حاسبة تكلفة إنتاج الدجاج اللاحم</h3>
              <p className="text-xs text-slate-500">أدخل أرقام مزرعتك لحساب سعر التكلفة</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الصيصان</label><input type="number" value={birdsCount} onChange={(e) => setBirdsCount(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">سعر الصوص (د.ج/رأس)</label><input type="number" value={chickPrice} onChange={(e) => setChickPrice(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">كمية العلف (قنطار)</label><input type="number" value={feedQuintals} onChange={(e) => setFeedQuintals(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">سعر القنطار (د.ج)</label><input type="number" value={feedPricePerQuintal} onChange={(e) => setFeedPricePerQuintal(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">تكاليف التدفئة والبيطرة (د.ج)</label><input type="number" value={vetAndHeatingCost} onChange={(e) => setVetAndHeatingCost(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1.5">نسبة النافق (%)</label><input type="number" value={mortalityRate} onChange={(e) => setMortalityRate(Number(e.target.value))} className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
              <span className="text-sm font-bold text-amber-400">نتائج التكلفة:</span>
              <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold">حساب فوري</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm"><span className="text-slate-300">إجمالي تكاليف الدورة:</span><span className="font-bold text-white">{totalProductionCost.toLocaleString()} د.ج</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-slate-300">الوزن الصافي:</span><span className="font-bold text-white">{totalWeightKg.toLocaleString()} كغ</span></div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 my-3">
                <div className="text-xs text-slate-400 mb-1">سعر التكلفة (بدون ربح):</div>
                <div className="text-2xl font-black text-amber-300">{costPerKg} د.ج / كغ</div>
              </div>
              <div className="bg-emerald-900/60 p-3.5 rounded-xl border border-emerald-600">
                <div className="text-xs text-emerald-300 font-bold mb-1">سعر المزرعة الموصى به (+25 د.ج):</div>
                <div className="text-3xl font-black text-white">{recommendedFarmPrice} د.ج / كغ</div>
              </div>
              <div className="text-xs text-slate-300 flex items-center justify-between pt-2 border-t border-slate-700">
                <span>سعر التجزئة المقترح:</span>
                <span className="font-bold text-amber-300 text-sm">{recommendedRetailPrice} د.ج / كغ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
