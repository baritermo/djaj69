'use client';

import React, { useState } from 'react';
import FarmersByWilaya from './FarmersByWilaya';
import BuyersByWilaya from './BuyersByWilaya';
import { Plus, Store, Filter } from 'lucide-react';

interface MarketOffersBoardProps {
  offersList: any[];
  onOpenOfferModal: (offerType: 'farmer' | 'slaughterhouse' | 'broker') => void;
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
}

export default function MarketOffersBoard({
  offersList,
  onOpenOfferModal,
  currentUser,
  onOpenSubscribeModal,
}: MarketOffersBoardProps) {
  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';
  const farmers = offersList.filter((o) => o.offerType === 'farmer');
  const slaughterhouses = offersList.filter((o) => o.offerType === 'slaughterhouse');
  const brokers = offersList.filter((o) => o.offerType === 'broker');

  // Active Category Tab Switcher: 'farmer' (default) | 'slaughterhouse' | 'broker'
  const [activeTab, setActiveTab] = useState<'farmer' | 'slaughterhouse' | 'broker'>('farmer');

  const handlePublishOffer = (type: 'farmer' | 'slaughterhouse' | 'broker') => {
    if (!isSubscribed) {
      if (onOpenSubscribeModal) {
        onOpenSubscribeModal();
      } else {
        alert('🔒 يرجى الاشتراك أولاً في البورصة لتتمكن من نشر وإضافة العروض.');
      }
      return;
    }

    const role = currentUser?.role;
    if (role === 'worker') {
      alert(
        '⚠️ حسابك بصفتك (عامل دواجن) مخصص للتسجيل في قسم العمال والبحث عن توظيف.\nقسم سوق العروض المباشرة مخصص للفلاحين والمذابح والوسطاء التجار.'
      );
      return;
    }

    onOpenOfferModal(type);
  };

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">
      {/* Main Header */}
      <div className="p-5 md:p-6 bg-gradient-to-l from-slate-950 via-emerald-950 to-emerald-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-emerald-950">
              <Store className="w-3.5 h-3.5" />
              سوق الدواجن B2B المباشر — الفلاحين والمذابح والكورتية
            </div>
          </div>
          {currentUser?.role !== 'worker' && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {(currentUser?.role === 'farmer' || currentUser?.role === 'admin' || !currentUser) && (
                <button
                  onClick={() => handlePublishOffer('farmer')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> نشر عرض فلاح (بيع)
                </button>
              )}
              {(currentUser?.role === 'slaughterhouse' || currentUser?.role === 'admin' || !currentUser) && (
                <button
                  onClick={() => handlePublishOffer('slaughterhouse')}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> نشر عرض مذبح (شراء)
                </button>
              )}
              {(currentUser?.role === 'broker' || currentUser?.role === 'admin' || !currentUser) && (
                <button
                  onClick={() => handlePublishOffer('broker')}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-emerald-950 shadow-lg transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> نشر عرض كورتي (شراء)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Category Navigation Tabs (Removed "عرض الكل") */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-2">
          <div className="text-xs font-bold text-emerald-200 flex items-center gap-1 ml-2">
            <Filter className="w-3.5 h-3.5" /> اختر القسم التفاعلي:
          </div>

          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'farmer'
                ? 'bg-emerald-500 text-white shadow-md scale-105 ring-2 ring-emerald-300'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800/80 border border-emerald-700/50'
            }`}
          >
            🌾 عروض بيع الفلاحين ({farmers.length})
          </button>

          <button
            onClick={() => setActiveTab('slaughterhouse')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'slaughterhouse'
                ? 'bg-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-300'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800/80 border border-emerald-700/50'
            }`}
          >
            🔪 طلبات شراء المذابح ({slaughterhouses.length})
          </button>

          <button
            onClick={() => setActiveTab('broker')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'broker'
                ? 'bg-amber-400 text-emerald-950 shadow-md scale-105 ring-2 ring-amber-200'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800/80 border border-emerald-700/50'
            }`}
          >
            🤝 طلبات شراء الكورتية ({brokers.length})
          </button>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-10">
        {/* Render FARMERS Section */}
        {activeTab === 'farmer' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg shadow">
                🌾
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">عروض بيع الفلاحين — المزارع وعنابر التسمين</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  اضغط على أي ولاية ثم اضغط على زر <b>المزيد 🔽</b> في كرت الفلاح لعرض تفاصيل السعر والوزن.
                </p>
              </div>
              <span className="mr-auto bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                {farmers.length} فلاح
              </span>
            </div>
            <FarmersByWilaya
              farmers={farmers}
              currentUser={currentUser}
              onOpenSubscribeModal={onOpenSubscribeModal}
            />
          </div>
        )}

        {/* Render SLAUGHTERHOUSES Section */}
        {activeTab === 'slaughterhouse' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg shadow">
                🔪
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">عروض وطلبات شراء المذابح المعتمدة</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  المذابح المعتمدة ينشرون أسعار الشراء للجملة. اضغط على زر <b>المزيد 🔽</b> للتحكم واستعراض العرض.
                </p>
              </div>
              <span className="mr-auto bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full">
                {slaughterhouses.length} مذبح
              </span>
            </div>
            <BuyersByWilaya
              buyers={slaughterhouses}
              currentUser={currentUser}
              onOpenSubscribeModal={onOpenSubscribeModal}
            />
          </div>
        )}

        {/* Render BROKERS Section */}
        {activeTab === 'broker' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-emerald-950 text-lg shadow">
                🤝
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">عروض وطلبات شراء الكورتية والوسطاء التجار</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مكاتب الكورتية والوسطاء ينشرون أسعار شراء وتوزيع الدواجن الفورية. اضغط على <b>المزيد 🔽</b> للتفاصيل.
                </p>
              </div>
              <span className="mr-auto bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full">
                {brokers.length} كورتي
              </span>
            </div>
            <BuyersByWilaya
              buyers={brokers}
              currentUser={currentUser}
              onOpenSubscribeModal={onOpenSubscribeModal}
            />
          </div>
        )}
      </div>
    </section>
  );
}
