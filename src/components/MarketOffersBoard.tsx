'use client';

import React from 'react';
import FarmersByWilaya from './FarmersByWilaya';
import BuyersByWilaya from './BuyersByWilaya';
import { Plus, Store } from 'lucide-react';

interface MarketOffersBoardProps {
  offersList: any[];
  onOpenOfferModal: (offerType: 'farmer' | 'slaughterhouse' | 'broker') => void;
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
}

export default function MarketOffersBoard({ offersList, onOpenOfferModal, currentUser, onOpenSubscribeModal }: MarketOffersBoardProps) {
  const farmers = offersList.filter((o) => o.offerType === 'farmer');
  const slaughterhouses = offersList.filter((o) => o.offerType === 'slaughterhouse');
  const brokers = offersList.filter((o) => o.offerType === 'broker');
  const buyers = [...slaughterhouses, ...brokers];

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
      {/* Main Header */}
      <div className="p-5 md:p-6 bg-gradient-to-l from-slate-950 via-emerald-950 to-emerald-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-emerald-950 mb-3">
              <Store className="w-3.5 h-3.5" />
              سوق الدواجن B2B — كل جهة في قسم مستقل
            </div>
            <h2 className="text-2xl font-black">الفلاحين والمذابح والكورتي — أقسام منفصلة</h2>
            <p className="text-sm text-emerald-100 mt-1 max-w-2xl">
              الفلاح ينشر عرض البيع الخاص به كأيقونة في ولايته.
              المذبح والكورتي ينشرون أسعار الشراء لكل فئة في ولايتهم.
              كل قسم مستقل ولا يختلط مع الآخر.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={() => onOpenOfferModal('farmer')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-lg transition">
              <Plus className="w-4 h-4" /> نشر عرض فلاح (بيع)
            </button>
            <button onClick={() => onOpenOfferModal('slaughterhouse')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-lg transition">
              <Plus className="w-4 h-4" /> نشر عرض مذبح (شراء)
            </button>
            <button onClick={() => onOpenOfferModal('broker')} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-emerald-950 shadow-lg transition">
              <Plus className="w-4 h-4" /> نشر عرض كورتي (شراء)
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-10">
        {/* ========= FARMERS SECTION ========= */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg shadow">🌾</span>
            <div>
              <h3 className="text-xl font-black text-slate-900">عروض الفلاحين — بيع الدجاج</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                كل فلاح يظهر كأيقونة منفصلة ضمن ولايته — مع نوع الدجاج والكمية المتاحة.
                لا توجد هنا أي عروض مذابح أو وسطاء.
              </p>
            </div>
            <span className="mr-auto bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">{farmers.length} فلاح</span>
          </div>
          <FarmersByWilaya farmers={farmers} currentUser={currentUser} onOpenSubscribeModal={onOpenSubscribeModal} />
        </div>

        {/* ========= BUYERS SECTION ========= */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-lg shadow">🏪</span>
            <div>
              <h3 className="text-xl font-black text-slate-900">عروض الشراء — مذابح وكورتي</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                المذابح والكورتي ينشرون الأسعار التي يشترون بها كل فئة (خشنة/متوسطة/رقيقة).
                كل عرض يظهر ضمن الولاية الخاصة به.
              </p>
            </div>
            <span className="mr-auto bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-1 rounded-full">{buyers.length} عرض شراء</span>
          </div>
          <BuyersByWilaya buyers={buyers} currentUser={currentUser} onOpenSubscribeModal={onOpenSubscribeModal} />
        </div>
      </div>
    </section>
  );
}
