'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Moon, Sparkles, Send, ShieldCheck, ArrowLeft } from 'lucide-react';

interface FridayHolidayScreenProps {
  currentUser?: any;
  onAdminBypass?: () => void;
}

export default function FridayHolidayScreen({ currentUser, onAdminBypass }: FridayHolidayScreenProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Algiers' }));
      
      // Calculate Saturday 00:00:00 Algiers Time
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - now.getDay())); // Get next Saturday
      saturday.setHours(0, 0, 0, 0);

      const diff = saturday.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-8 text-center text-white relative overflow-hidden my-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-900 rounded-3xl shadow-2xl border border-emerald-800/60 -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      {/* Admin Bypass Notification (Only for Admin) */}
      {currentUser?.role === 'admin' && onAdminBypass && (
        <div className="mb-6 w-full max-w-lg p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-between gap-3 text-amber-200 text-xs font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🏛️ أنت مسجل بصفتك مديراً للنظام.</span>
          </div>
          <button
            onClick={onAdminBypass}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-black transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>دخول المنصة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Moon & Holy Friday Header Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-emerald-800 via-amber-500 to-amber-300 p-1 shadow-2xl flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
            <Moon className="w-12 h-12 md:w-14 md:h-14 text-amber-400 drop-shadow-md" />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 p-2 bg-amber-400 text-emerald-950 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Title & Announcement */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs md:text-sm font-black mb-4 backdrop-blur-md">
        <Calendar className="w-4 h-4" />
        جمعة مباركة — عطلة رسمية لبورصة الدواجن
      </div>

      <h1 className="text-2xl md:text-4xl font-black text-white max-w-2xl leading-tight mb-3">
        المنصة متوقفة عن التحديث والنشر والتداول رسمياً يوم الجمعة
      </h1>

      <p className="text-sm md:text-base text-emerald-100/90 max-w-xl leading-relaxed mb-8 font-medium">
        احتراماً ليوم الجمعة المبارك وتماشياً مع عطلة الأسواق والمذابح، تتوقف كافة عمليات النشر وتحديث الأسعار اليومية، على أن تستأنف البورصة نشاطها المعتاد صباح يوم السبت.
      </p>

      {/* Live Countdown Timer to Saturday */}
      <div className="bg-slate-900/90 border border-emerald-500/30 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl backdrop-blur-lg mb-8">
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-emerald-300 mb-4">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <span>الوقت المتبقي لافتتاح البورصة واستئناف العمل (يوم السبت):</span>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 dir-ltr">
          {/* Hours */}
          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-[11px] md:text-xs font-bold text-emerald-200 mt-1">ساعة (Hours)</div>
          </div>

          {/* Minutes */}
          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-[11px] md:text-xs font-bold text-emerald-200 mt-1">دقيقة (Minutes)</div>
          </div>

          {/* Seconds */}
          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-3xl md:text-5xl font-black text-amber-400 font-mono">
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-[11px] md:text-xs font-bold text-emerald-200 mt-1">ثانية (Seconds)</div>
          </div>
        </div>
      </div>

      {/* Support & Contact Footer Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200 font-bold">
        <a
          href="https://t.me/supourtte69"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 rounded-xl transition cursor-pointer text-amber-300"
        >
          <Send className="w-4 h-4" />
          <span>الدعم الفني عبر تليجرام: @supourtte69</span>
        </a>
      </div>
    </div>
  );
}
