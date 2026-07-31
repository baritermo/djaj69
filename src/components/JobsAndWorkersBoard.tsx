'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  MapPin,
  Phone,
  Home,
  Award,
  Filter,
  Plus,
  Search,
  CheckCircle,
  Building,
  UserCheck,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface JobsAndWorkersBoardProps {
  jobsList: any[];
  workersList: any[];
  onOpenJobModal: () => void;
  onOpenWorkerModal: () => void;
  onRefresh: () => void;
}

export default function JobsAndWorkersBoard({
  jobsList,
  workersList,
  onOpenJobModal,
  onOpenWorkerModal,
  onRefresh,
}: JobsAndWorkersBoardProps) {
  const [subTab, setSubTab] = useState<'jobs' | 'workers'>('jobs');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const specialties = [
    { id: 'all', label: 'كافة التخصصات والمهن' },
    { id: 'poultry_worker', label: 'عامل تربية دواجن وتغذية' },
    { id: 'slaughter_worker', label: 'عامل ذبح وسلخ في مذبح' },
    { id: 'veterinarian', label: 'طبيب بيطري / تقني بيطري' },
    { id: 'driver_refrigerated', label: 'سائق شاحنة تبريد وتوزيع' },
    { id: 'farm_supervisor', label: 'مشرف عنبر / مسؤول مزرعة' },
  ];

  const getSpecialtyLabel = (id: string) => {
    return specialties.find((s) => s.id === id)?.label || 'عامل في قطاع الدواجن';
  };

  const filteredJobs = jobsList.filter((job) => {
    const matchesWilaya = selectedWilaya === 'all' || job.wilayaCode === selectedWilaya;
    const matchesSearch =
      job.titleAr.includes(searchQuery) ||
      job.companyName.includes(searchQuery) ||
      job.wilayaName.includes(searchQuery);
    return matchesWilaya && matchesSearch;
  });

  const filteredWorkers = workersList.filter((worker) => {
    const matchesWilaya = selectedWilaya === 'all' || worker.wilayaCode === selectedWilaya;
    const matchesSpecialty =
      selectedSpecialty === 'all' || worker.specialty === selectedSpecialty;
    const matchesSearch =
      worker.fullName.includes(searchQuery) ||
      worker.bio.includes(searchQuery) ||
      worker.wilayaName.includes(searchQuery);
    return matchesWilaya && matchesSpecialty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner & Intro */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-emerald-950 font-black text-xs rounded-full mb-3">
            <Users className="w-4 h-4" />
            سوق التوظيف والعمال في قطاع الدواجن في الجزائر
          </div>
          <h2 className="text-2xl font-black mb-1">
            البحث عن عمال وفرص توظيف في المزارع والمذابح وشركات الأعلاف
          </h2>
          <p className="text-sm text-emerald-100 max-w-2xl">
            نوفر صلة وصل مباشرة بين أصحاب مزارع الدواجن والمذابح والشركات مع العمال المؤهلين (عمال تربية، بياطرة، سائقين، تقنيين) مع مراعاة توفير المبيت والإعاشة في ولايات العمل.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={onOpenJobModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            نشر عرض توظيف جديد
          </button>
          <button
            onClick={onOpenWorkerModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 border border-emerald-500 shadow-lg transition"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            تسجيل باحث عن عمل
          </button>
        </div>
      </div>

      {/* Sub-Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('jobs')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition ${
            subTab === 'jobs'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          عروض العمل المتاحة في المزارع والمذابح ({jobsList.length})
        </button>
        <button
          onClick={() => setSubTab('workers')}
          className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition ${
            subTab === 'workers'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          قائمة العمال والباحثين عن توظيف ({workersList.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder={
              subTab === 'jobs'
                ? 'ابحث في عروض العمل، اسم المزرعة، أو الولاية...'
                : 'ابحث في أسماء العمال، التخصصات، أو الخبرات...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {subTab === 'workers' && (
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="all">كافة الولايات (58 ولاية)</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} - ولاية {w.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* JOBS LISTING SUB-TAB */}
      {subTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:border-emerald-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold mb-1">
                      {job.companyType === 'farm' && 'مزرعة دواجن'}
                      {job.companyType === 'slaughterhouse' && 'مذبح آلي'}
                      {job.companyType === 'feed' && 'شركة أعلاف'}
                      {job.companyType === 'vet' && 'إشراف بيطري'}
                      {job.companyType === 'hatchery' && 'مفقس وصوص'}
                      {job.companyType === 'logistics' && 'نقل وتوزيع'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      {job.titleAr}
                    </h3>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {job.jobType === 'full_time'
                      ? 'دوام دائم'
                      : job.jobType === 'seasonal'
                      ? 'موسمي / دورة'
                      : 'دوام جزئي'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 my-2">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <MapPin className="w-3.5 h-3.5" />
                    ولاية {job.wilayaName} ({job.commune})
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {job.requirements}
                </p>

                <div className="flex flex-wrap items-center gap-2 my-3">
                  <span className="text-xs font-black bg-emerald-800 text-white px-3 py-1.5 rounded-xl">
                    الراتب: {job.salaryRange}
                  </span>
                  {job.housingProvided && (
                    <span className="text-xs font-bold bg-amber-500 text-emerald-950 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" />
                      المبيت والإعاشة متوفرة مجاناً
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${job.contactPhone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition shadow"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    اتصال بالتشغيل: {job.contactPhone}
                  </a>
                </div>
                <span className="text-[11px] text-slate-400">
                  متاح للتقديم الفوري
                </span>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              لم يتم العثور على عروض عمل تطابق بحثك حالياً. يمكنك نشر عرض توظيف جديد أو تجربة ولاية أخرى.
            </div>
          )}
        </div>
      )}

      {/* WORKERS LISTING SUB-TAB */}
      {subTab === 'workers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:border-emerald-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                      {worker.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {worker.fullName}
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-800 text-amber-300 rounded-md text-xs font-bold mt-0.5">
                        {getSpecialtyLabel(worker.specialty)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    متاح للعمل
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 my-2">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    ولاية {worker.wilayaName}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    خبرة {worker.experienceYears} سنوات
                  </span>
                  {worker.willingToRelocate && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      ✔ يقبل العمل والمبيت في ولاية أخرى
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {worker.bio}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={`tel:${worker.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  اتصال بالعامل: {worker.phone}
                </a>
                <span className="text-[11px] text-slate-400">
                  سجل في منصة دواجن DZ
                </span>
              </div>
            </div>
          ))}

          {filteredWorkers.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              لم يتم العثور على عمال يطابقون تخصص أو ولاية البحث. يمكنك تسجيل حساب عامل جديد.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
