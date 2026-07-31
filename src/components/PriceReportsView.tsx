'use client';

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  CheckCircle2,
  MapPin,
  Phone,
  Plus,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface PriceReportsViewProps {
  reportsList: any[];
  onOpenReportModal: () => void;
}

export default function PriceReportsView({
  reportsList,
  onOpenReportModal,
}: PriceReportsViewProps) {
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredReports = reportsList.filter((rep) => {
    const matchesWilaya = selectedWilaya === 'all' || rep.wilayaCode === selectedWilaya;
    const matchesRole = selectedRole === 'all' || rep.reporterRole === selectedRole;
    return matchesWilaya && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'farmer': return 'مربي دواجن';
      case 'slaughterhouse': return 'مذبح';
      case 'wholesaler': return 'موزع جملة';
      case 'syndicate': return 'ممثل مهني';
      default: return 'فاعل';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-emerald-900 text-white rounded-2xl p-6 shadow-xl border border-amber-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-emerald-950 font-black text-xs rounded-full mb-3">
            <MessageSquarePlus className="w-4 h-4" /> ضبط شفاف للأسعار
          </div>
          <h2 className="text-2xl font-black mb-1">بلاغات وتحديثات الأسعار من المربين والمذابح</h2>
          <p className="text-sm text-amber-100 max-w-2xl">شارك سعر البيع في ولايتك لمكافحة الشائعات والمضاربة.</p>
        </div>
        <button onClick={onOpenReportModal} className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg transition shrink-0">
          <Plus className="w-4 h-4" /> إبلاغ عن سعر
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-700">تصفية:</div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold">
            <option value="all">كافة الفاعلين</option>
            <option value="farmer">مربي دواجن</option>
            <option value="slaughterhouse">مذابح</option>
            <option value="wholesaler">موزعو جملة</option>
            <option value="syndicate">ممثلون مهنيون</option>
          </select>
          <select value={selectedWilaya} onChange={(e) => setSelectedWilaya(e.target.value)} className="px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold">
            <option value="all">كافة الولايات</option>
            {ALGERIA_WILAYAS.map((w) => (<option key={w.code} value={w.code}>{w.code} - {w.nameAr}</option>))}
          </select>
        </div>
      </div>

      {/* Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:border-emerald-500 transition">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black text-slate-900">{report.reporterName}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">{getRoleLabel(report.reporterRole)}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" />ولاية {report.wilayaName}</div>
              </div>
              {report.verified && <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-bold border border-emerald-200">✔ موثق</span>}
            </div>

            {/* TABLE: الفئة × (فلاح / مذبح / وسيط) */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden my-3">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="py-2 px-2 font-black text-slate-700">الفئة</th>
                    <th className="py-2 px-2 font-black text-emerald-800 bg-emerald-100/60 border-r border-slate-200">🌾 فلاح</th>
                    <th className="py-2 px-2 font-black text-indigo-800 bg-indigo-100/60 border-r border-slate-200">🔪 مذبح</th>
                    <th className="py-2 px-2 font-black text-amber-800 bg-amber-100/60 border-r border-slate-200">🤝 وسيط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-slate-800 bg-slate-100/50">خشنة</td>
                    <td className="py-1.5 px-2 font-black text-emerald-800 border-r border-slate-200">{report.khashna_farmer || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-indigo-800 border-r border-slate-200">{report.khashna_slaughter || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-amber-800 border-r border-slate-200">{report.khashna_intermediary || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-slate-800 bg-slate-100/50">متوسطة</td>
                    <td className="py-1.5 px-2 font-black text-emerald-800 border-r border-slate-200">{report.motawassita_farmer || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-indigo-800 border-r border-slate-200">{report.motawassita_slaughter || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-amber-800 border-r border-slate-200">{report.motawassita_intermediary || '—'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-bold text-slate-800 bg-slate-100/50">رقيقة</td>
                    <td className="py-1.5 px-2 font-black text-emerald-800 border-r border-slate-200">{report.raqiqa_farmer || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-indigo-800 border-r border-slate-200">{report.raqiqa_slaughter || '—'}</td>
                    <td className="py-1.5 px-2 font-black text-amber-800 border-r border-slate-200">{report.raqiqa_intermediary || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {report.notes && (
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/50 my-2">
                <span className="font-bold text-amber-900">ملاحظة: </span>{report.notes}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(report.createdAt || Date.now()).toLocaleDateString('ar-DZ')}</span>
              {report.phone && <a href={`tel:${report.phone}`} className="font-bold text-emerald-800 hover:underline">هاتف: {report.phone}</a>}
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
            لم يتم العثور على بلاغات. كن أول من يبلغ عن السعر في ولايتك!
          </div>
        )}
      </div>
    </div>
  );
}
