'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Briefcase,
  Building2,
  PlusCircle,
  Users,
  X,
  ChevronLeft,
  ShieldCheck,
  Smartphone,
  Crown,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Lock,
  Package,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPriceModal: () => void;
  onOpenJobModal: () => void;
  onOpenWorkerModal: () => void;
  onOpenCompanyModal: () => void;
  onOpenOfferModal: () => void;
  currentUser?: any;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenAdminSubModal?: () => void;
  onOpenAdminEscrowModal?: () => void;
  onOpenUserOrdersModal?: () => void;
  onOpenSubscribeModal?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenPriceModal,
  onOpenJobModal,
  onOpenWorkerModal,
  onOpenCompanyModal,
  onOpenOfferModal,
  currentUser,
  onOpenLoginModal,
  onOpenRegisterModal,
  onOpenSettingsModal,
  onOpenAdminSubModal,
  onOpenAdminEscrowModal,
  onOpenUserOrdersModal,
  onOpenSubscribeModal,
  onLogout,
}: SidebarProps) {
  if (!isOpen) return null;

  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'farmer':
        return '🌾 مربي دواجن / فلاح';
      case 'slaughterhouse':
        return '🔪 مذبح معتمد';
      case 'broker':
        return '🤝 وسيط / كورتي';
      case 'b2b':
        return '🏢 نشاط B2B (أعلاف/فلوس/بيطري)';
      case 'worker':
        return '👷 باحث عن عمل';
      case 'admin':
        return '🏛️ إدارة البورصة';
      default:
        return 'مستخدم مسجل';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer (RTL: right-0) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-80 max-w-[85vw] bg-emerald-950 text-white shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-emerald-800/80">
          
          {/* Header */}
          <div className="p-5 border-b border-emerald-800/80 flex items-center justify-between bg-emerald-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 text-emerald-950 rounded-xl font-black flex items-center justify-center text-xl shadow-md">
                🐔
              </div>
              <div>
                <h2 className="font-black text-lg text-white leading-tight">
                  دواجن الجزائر <span className="text-amber-400 text-sm font-bold">B2B</span>
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Box */}
          <div className="px-4 pt-4 pb-2">
            {currentUser ? (
              <div className="bg-emerald-900/90 border border-emerald-700/80 p-3.5 rounded-2xl space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{currentUser.fullName}</h4>
                      <span className="text-[10px] text-emerald-300 block">{currentUser.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {currentUser?.role === 'admin' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            setTimeout(() => {
                              if (onOpenAdminEscrowModal) onOpenAdminEscrowModal();
                            }, 100);
                          }}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-700 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="لوحة تحكم صفقات الوسيط ودفعات بريدي موب"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>لوحة الوسيط</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            setTimeout(() => {
                              if (onOpenAdminSubModal) onOpenAdminSubModal();
                            }, 100);
                          }}
                          className="px-2.5 py-1.5 bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-md hover:bg-amber-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="مراجعة وتفعيل طلبات الحسابات والاشتراكات"
                        >
                          📋 الحسابات
                        </button>
                      </>
                    )}
                    {currentUser?.role !== 'admin' && currentUser?.subscriptionStatus !== 'active' && (
                      <button
                        onClick={() => {
                          if (onOpenSubscribeModal) onOpenSubscribeModal();
                          onClose();
                        }}
                        className="px-2 py-1 bg-amber-500 text-emerald-950 font-black text-[11px] rounded-lg shadow-sm hover:bg-amber-400 transition cursor-pointer"
                        title="حالة التفعيل والاعتماد من طرف الإدارة"
                      >
                        ⏳ قيد مراجعة الأدمن
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        setTimeout(() => {
                          if (onOpenUserOrdersModal) onOpenUserOrdersModal();
                        }, 100);
                      }}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1 active:scale-95"
                      title="استعراض الطلبات الواردة على إعلاناتك والصفقات"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>طلباتي</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenSettingsModal) onOpenSettingsModal();
                        onClose();
                      }}
                      className="p-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-lg transition text-xs flex items-center gap-1 font-bold cursor-pointer"
                      title="إعدادات الحساب وتغيير كلمة السر"
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        onClose();
                      }}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition text-xs flex items-center gap-1 font-bold cursor-pointer"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-2 py-1 bg-emerald-950/80 rounded-lg border border-emerald-800/80 text-[10px] text-amber-300 font-black">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-900/50 border border-emerald-800/60 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>وضع الزائر (تصفح عام)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (onOpenLoginModal) onOpenLoginModal();
                      onClose();
                    }}
                    className="py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-600 shadow-sm transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>دخول</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenRegisterModal) onOpenRegisterModal();
                      onClose();
                    }}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>حساب جديد</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation & Actions */}
          <div className="p-4 space-y-5 flex-1">

            {/* Direct Orders Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  if (onOpenLoginModal) onOpenLoginModal();
                  else if (onOpenRegisterModal) onOpenRegisterModal();
                  onClose();
                  return;
                }
                if (onOpenUserOrdersModal) onOpenUserOrdersModal();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md border border-emerald-600 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-sm">
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="font-black text-xs sm:text-sm block text-white">📦 طلباتي (الطلبات والصفقات)</span>
                  <span className="text-[10px] text-emerald-200 block">الطلبات الواردة على إعلاناتك</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 opacity-60" />
            </button>

            {/* Main Tabs Navigation */}
            <div>
              <div className="text-[11px] font-black text-emerald-300 uppercase tracking-wider mb-2 px-2">
                الواجهات الرئيسية:
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleTabClick('prices')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    activeTab === 'prices'
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>بورصة أسعار 58 ولاية</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabClick('b2b_marketplace')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    activeTab === 'b2b_marketplace'
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>السوق العام</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabClick('offers')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    activeTab === 'offers'
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>العروض والطلبات</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabClick('jobs')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    activeTab === 'jobs'
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>التوظيف والبحث عن عمال</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-60" />
                </button>

                <button
                  onClick={() => handleTabClick('directory')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                    activeTab === 'directory'
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-black'
                      : 'text-emerald-100 hover:bg-emerald-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4" />
                    <span>دليل المزارع والمذابح B2B</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 opacity-60" />
                </button>
              </div>
            </div>

            {/* Direct Actions */}
            {(currentUser?.role === 'admin' || (isSubscribed && currentUser?.role === 'worker')) && (
              <div>
                <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-2.5 px-2 flex items-center gap-1">
                  ⚡ إجراءات سريعة واختصارات
                </div>
                <div className="space-y-2">
                  {currentUser?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          if (onOpenAdminEscrowModal) onOpenAdminEscrowModal();
                          onClose();
                        }}
                        className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 border border-emerald-600 text-white font-bold p-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-md transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>🛡️ لوحة تحكم وسيط المنصة (BaridiMob)</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenPriceModal();
                          onClose();
                        }}
                        className="w-full bg-emerald-850 hover:bg-emerald-750 border border-emerald-700 text-white font-bold p-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-md transition cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span>📊 تحديث أسعار البورصة</span>
                      </button>
                    </>
                  )}

                  {isSubscribed && currentUser?.role === 'worker' && (
                    <button
                      onClick={() => {
                        onOpenWorkerModal();
                        onClose();
                      }}
                      className="w-full bg-emerald-900 hover:bg-emerald-850 border border-emerald-700 text-emerald-100 font-bold p-2.5 rounded-2xl text-xs flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>تسجيل بيانات عامل للتوظيف</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-emerald-800/80 text-[11px] text-emerald-300 font-medium text-center space-y-1.5 bg-emerald-950">
            <div className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>منصة بأسعار حية مجمعة ميدانياً</span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-0.5">
              <a
                href="https://t.me/supourtte69"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-sky-300 hover:text-sky-200 hover:underline font-bold flex items-center gap-1"
              >
                💬 الدعم عبر تليجرام
              </a>
              <span className="text-emerald-700">•</span>
              <a
                href="https://web.facebook.com/profile.php?id=61554131107073"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-300 hover:text-blue-200 hover:underline font-bold flex items-center gap-1"
              >
                🟦 صفحتنا على فيسبوك
              </a>
            </div>
            <div className="text-[10px] text-emerald-400/80">حقوق الطبع محفوظة © {new Date().getFullYear()}</div>
          </div>

        </div>
      </div>
    </div>
  );
}
