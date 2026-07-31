import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Search,
  Plus,
  ShieldCheck,
  Truck,
  Feather,
  Lock,
  Trash2,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface B2BDirectoryProps {
  companiesList: any[];
  currentUser?: any;
  onOpenSubscribeModal?: () => void;
  onOpenCompanyModal: () => void;
}

export default function B2BDirectory({
  companiesList,
  currentUser,
  onOpenSubscribeModal,
  onOpenCompanyModal,
}: B2BDirectoryProps) {
  const isSubscribed = currentUser?.role === 'admin' || currentUser?.subscriptionStatus === 'active';
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const companyTypes = [
    { id: 'all', label: 'جميع الأنشطة (الثلاث فئات)' },
    { id: 'feed_supplier', label: '🌾 بائع أعلاف' },
    { id: 'hatchery', label: '🐤 بائع فلوس (مفقس / صوص)' },
    { id: 'veterinary', label: '🩺 بيطري (خدمات وأدوية)' },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feed_supplier':
        return '🌾 بائع أعلاف';
      case 'hatchery':
        return '🐤 بائع فلوس (مفقس)';
      case 'veterinary':
        return '🩺 بيطري (عيادة / أدوية)';
      default:
        return companyTypes.find((t) => t.id === type)?.label || 'نشاط B2B';
    }
  };

  const filteredCompanies = companiesList.filter((comp) => {
    const matchesType = selectedType === 'all' || comp.type === selectedType;
    const matchesWilaya =
      selectedWilaya === 'all' || comp.wilayaCode === selectedWilaya;
    const matchesSearch =
      comp.nameAr.includes(searchQuery) ||
      (comp.nameFr && comp.nameFr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      comp.wilayaName.includes(searchQuery) ||
      comp.commune.includes(searchQuery);

    return matchesType && matchesWilaya && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Directory Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-emerald-950 font-black text-xs rounded-full mb-3">
            <ShieldCheck className="w-4 h-4" />
            الدليل الشامل لقطاع الدواجن في الجزائر
          </div>
          <h2 className="text-2xl font-black mb-1">
            دليل المزارع، المذابح، باعة الأعلاف، الفلوس، والخدمات البيطرية (58 ولاية)
          </h2>
          <p className="text-sm text-emerald-100 max-w-2xl">
            تواصل مباشر وحصري مع المزارع، المذابح، باعة الأعلاف والفلوس (الصوص)، والبيطرة في ولايتك لضمان أفضل سعر وأعلى جودة.
          </p>
        </div>
        {currentUser?.role !== 'worker' && (
          <button
            onClick={() => {
              if (!isSubscribed) {
                if (onOpenSubscribeModal) onOpenSubscribeModal();
                else alert('🔒 يرجى الاشتراك أولاً في البورصة لتتمكن من إضافة نشاطك في دليل B2B.');
              } else {
                onOpenCompanyModal();
              }
            }}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة نشاط / شركة B2B
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث باسم بائع الأعلاف، بائع الفلوس، البيطري، البلدية، أو الولاية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            {companyTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

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

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="relative bg-white rounded-2xl p-5 shadow-lg border border-slate-200 hover:border-emerald-600 transition flex flex-col justify-between overflow-hidden"
          >
            {/* Blurred Content when !isSubscribed */}
            <div className={!isSubscribed ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}>
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black">
                    {getTypeLabel(comp.type)}
                  </span>
                  {comp.verified && (
                    <span className="flex items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      موثق B2B
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 mt-2 leading-snug">
                  {comp.nameAr}
                </h3>
                {comp.nameFr && (
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    {comp.nameFr}
                  </p>
                )}

                <div className="space-y-1.5 my-3 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    ولاية {comp.wilayaName} - {comp.commune} ({comp.address})
                  </div>
                  {comp.capacity && (
                    comp.type === 'feed_supplier' || comp.type === 'hatchery' || comp.type === 'veterinary' || comp.capacity.includes('|') ? (
                      <div
                        className={`p-3 rounded-xl space-y-1.5 my-2 ${
                          comp.type === 'hatchery'
                            ? 'bg-emerald-50/90 border border-emerald-200'
                            : comp.type === 'veterinary'
                            ? 'bg-indigo-50/90 border border-indigo-200'
                            : 'bg-amber-50/90 border border-amber-200/80'
                        }`}
                      >
                        <div
                          className={`text-[11px] font-black flex items-center gap-1 ${
                            comp.type === 'hatchery'
                              ? 'text-emerald-950'
                              : comp.type === 'veterinary'
                              ? 'text-indigo-950'
                              : 'text-amber-900'
                          }`}
                        >
                          {comp.type === 'hatchery'
                            ? '🐤 أنواع وأسعار الفلوس (الصوص) المعروضة:'
                            : comp.type === 'veterinary'
                            ? '🩺 الخدمات والأدوية البيطرية المعروضة:'
                            : '🌾 أنواع الأعلاف والأسعار المعروضة:'}
                        </div>
                        <div className="space-y-1 text-xs">
                          {comp.capacity.split('|').map((itemStr: string, idx: number) => {
                            const parts = itemStr.split(':');
                            const itemTitle = parts[0]?.trim();
                            const itemPrice = parts[1]?.trim();
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
                              >
                                <span className="font-bold text-slate-800">{itemTitle}</span>
                                {itemPrice && (
                                  <span
                                    className={`font-black px-2 py-0.5 rounded border text-[11px] ${
                                      comp.type === 'veterinary'
                                        ? 'text-indigo-900 bg-indigo-50 border-indigo-200'
                                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                    }`}
                                  >
                                    {itemPrice}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold">
                        <span>التفاصيل / الطاقة:</span>
                        <span className="text-emerald-800">{comp.capacity}</span>
                      </div>
                    )
                  )}
                  {comp.certifications && (
                    <div className="text-xs text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <span className="font-bold text-amber-900">الشهادات والاعتماد: </span>
                      {comp.certifications}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={`tel:${comp.phone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  {comp.phone}
                </a>
                <div className="flex items-center gap-2">
                  {comp.email && (
                    <a
                      href={`mailto:${comp.email}`}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-700 underline"
                    >
                      البريد الإلكتروني
                    </a>
                  )}
                  {(() => {
                    const canDelete = currentUser?.role === 'admin' || (currentUser?.phone && comp.phone && (comp.phone === currentUser.phone || comp.phone.includes(currentUser.phone)));
                    return canDelete ? (
                      <button
                        onClick={async () => {
                          if (confirm('هل أنت تأكد من حذف هذا النشاط نهائياً من الدليل؟')) {
                            await fetch(`/api/companies?id=${comp.id}`, { method: 'DELETE' });
                            window.location.reload();
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-200 cursor-pointer"
                        title="حذف النشاط"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Lock Overlay when Not Subscribed */}
            {!isSubscribed && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center gap-2 z-30">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-lg animate-bounce">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-amber-300 drop-shadow">
                  🔒 يرجى الاشتراك لرؤية بيانات الدليل B2B والاتصال
                </span>
                <button
                  onClick={onOpenSubscribeModal}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer transform hover:scale-105"
                >
                  اشترك الآن
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
            لم يتم العثور على مؤسسة تطابق معايير البحث. يمكنك إضافة مؤسستك أو مزرعتك في هذا القسم.
          </div>
        )}
      </div>
    </div>
  );
}
