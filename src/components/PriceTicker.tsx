'use client';

import React from 'react';
import { Zap, Swords } from 'lucide-react';

interface PriceTickerProps {
  supplyVolume?: number;
  demandVolume?: number;
}

export default function PriceTicker({ supplyVolume = 585000, demandVolume = 640000 }: PriceTickerProps) {
  const total = supplyVolume + demandVolume;
  const supplyPct = Math.round((supplyVolume / total) * 100);
  const demandPct = 100 - supplyPct;

  return (
    <div className="bg-slate-950 border-b border-slate-800 shadow-2xl py-3 px-4 select-none">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="text-sm">🌾</span>
            <span>جانب العرض (الفلاحين)</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
            <Swords className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>ميزان البورصة الحية (تفاعلي)</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-400">
            <span>جانب الطلب (المذابح والوسطاء)</span>
            <span className="text-sm">🔪🤝</span>
          </div>
        </div>

        {/* Colliding Dynamic Dual Bar */}
        <div className="relative h-11 w-full bg-slate-900 rounded-2xl overflow-hidden p-1 border border-slate-800 flex items-center shadow-inner">
          
          {/* Supply Force Bar (Emerald / Green) */}
          <div
            style={{ width: `${supplyPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400 rounded-l-xl relative transition-all duration-700 flex items-center justify-start px-3 shadow-md"
          >
            <span className="text-base drop-shadow-md">🌾</span>
          </div>

          {/* Shockwave Collision Center Point */}
          <div className="relative z-20 -mx-3.5 shrink-0 flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-xs transform hover:scale-110 transition">
              <Zap className="w-4 h-4 text-slate-950 fill-amber-300 animate-bounce" />
            </div>
          </div>

          {/* Demand Force Bar (Amber / Rose / Red) */}
          <div
            style={{ width: `${demandPct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-r-xl relative transition-all duration-700 flex items-center justify-end px-3 shadow-md"
          >
            <span className="text-base drop-shadow-md">🔪🤝</span>
          </div>

        </div>
      </div>
    </div>
  );
}
