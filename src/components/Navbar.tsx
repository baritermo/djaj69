'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Menu,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface NavbarProps {
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
  onLogout?: () => void;
}

export default function Navbar({
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
  onLogout,
}: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="bg-emerald-900 text-white shadow-xl sticky top-0 z-40 border-b-4 border-amber-500">
      {/* Top Banner with Official Regulated Info */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-emerald-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping"></span>
                محدث حياً
              </span>
              <p className="text-emerald-100 font-bold truncate">
                بورصة أسعار الدواجن والتوظيف في كافة الولايات (58 ولاية)
              </p>
            </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              متابعة حية للأسعار: مزرعة - مذبح - تجزئة
            </span>
            <span className="hidden sm:inline text-emerald-400">|</span>
            <span className="hidden sm:inline">العملة: الدينار الجزائري (د.ج)</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title & Sidebar Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-emerald-850 hover:bg-amber-400 hover:text-emerald-950 text-amber-300 rounded-2xl shadow-md border border-emerald-700/80 transition flex items-center justify-center gap-1.5 font-black text-xs shrink-0 cursor-pointer"
                title="فتح الشريط الجانبي والقائمة"
              >
                <Menu className="w-5 h-5" />
                <span>القائمة</span>
              </button>

              <div
                onClick={() => setActiveTab('prices')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition">
                  <span className="text-2xl" role="img" aria-label="chicken">
                    🐔
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      دواجن الجزائر <span className="text-amber-400">B2B</span>
                    </h1>
                    <span className="text-lg" title="الجزائر" role="img" aria-label="algeria">
                      🇩🇿
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-emerald-200">
                    بورصة ضبط أسعار الدجاج والتوظيف في جميع ولايات الجزائر
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Header Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/80 px-3 py-1.5 rounded-2xl shadow-sm">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white block leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block">
                    {currentUser.phone}
                  </span>
                </div>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={onOpenAdminSubModal}
                    className="px-2 py-1 bg-amber-400 text-emerald-950 font-black text-xs rounded-lg shadow-sm hover:bg-amber-300 transition cursor-pointer"
                    title="مراجعة وتفعيل طلبات الحسابات والاشتراكات"
                  >
                    📋 طلبات الحسابات
                  </button>
                )}
                <button
                  onClick={onOpenSettingsModal}
                  className="mr-1 p-1 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-lg transition cursor-pointer"
                  title="إعدادات الحساب وتغيير كلمة السر"
                >
                  ⚙️
                </button>
                <button
                  onClick={onLogout}
                  className="p-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg transition cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-750 text-emerald-100 font-black text-xs rounded-xl flex items-center gap-1.5 border border-emerald-600 transition shadow-sm cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>تسجيل الدخول</span>
                </button>
                <button
                  onClick={onOpenRegisterModal}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>حساب جديد</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPriceModal={onOpenPriceModal}
        onOpenJobModal={onOpenJobModal}
        onOpenWorkerModal={onOpenWorkerModal}
        onOpenCompanyModal={onOpenCompanyModal}
        onOpenOfferModal={onOpenOfferModal}
        currentUser={currentUser}
        onOpenLoginModal={onOpenLoginModal}
        onOpenRegisterModal={onOpenRegisterModal}
        onOpenSettingsModal={onOpenSettingsModal}
        onOpenAdminSubModal={onOpenAdminSubModal}
        onLogout={onLogout}
      />
    </header>
  );
}
