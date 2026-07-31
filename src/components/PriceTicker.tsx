'use client';

export default function PriceTicker() {
  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 shadow-inner py-3.5 px-4">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Header Label */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <h3 className="font-black text-xs sm:text-sm tracking-wider text-amber-400">
              📊 مؤشر ميزان السوق (العرض والطلب)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-700/50">
            مجمع لـ 58 ولاية
          </span>
        </div>

        {/* THE TWO COMPACT CARDS: BIRD COUNT & WEIGHT ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* CARD 1: FARMER SUPPLY */}
          <div className="bg-gradient-to-l from-emerald-950 via-slate-900 to-emerald-900 p-4 rounded-2xl border border-emerald-600/80 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-emerald-950 font-black flex items-center justify-center text-lg shadow-sm shrink-0">
                🌾
              </div>
              <div>
                <span className="text-xs font-black text-emerald-400 block">جانب العرض (الفلاحين)</span>
                <span className="text-sm font-bold text-slate-200">إجمالي كمية العرض</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                585,000 <span className="text-xs text-emerald-200 font-normal">طير</span>
              </div>
              <div className="text-xs font-black text-emerald-300">
                ⚖️ 1,350 <span className="font-normal text-emerald-200">طن</span>
              </div>
            </div>
          </div>

          {/* CARD 2: SLAUGHTERHOUSE & BROKER DEMAND */}
          <div className="bg-gradient-to-l from-amber-950 via-slate-900 to-rose-950 p-4 rounded-2xl border border-amber-600/80 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 font-black flex items-center justify-center text-lg shadow-sm shrink-0">
                🔪🤝
              </div>
              <div>
                <span className="text-xs font-black text-amber-400 block">جانب الطلب (المذابح والوسطاء)</span>
                <span className="text-sm font-bold text-slate-200">إجمالي كمية الطلب</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-rose-400 tracking-tight">
                640,000 <span className="text-xs text-amber-200 font-normal">طير</span>
              </div>
              <div className="text-xs font-black text-amber-300">
                ⚖️ 1,480 <span className="font-normal text-amber-200">طن</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
