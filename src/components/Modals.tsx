'use client';

import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  Briefcase,
  User,
  Building2,
  TrendingUp,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Upload,
  FileText,
  CreditCard,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { ALGERIA_WILAYAS } from '@/lib/algeria-data';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultWilaya?: string;
}

// 1. PRICE REPORT MODAL
export function PriceReportModal({ isOpen, onClose, onSuccess, defaultWilaya }: ModalProps) {
  const [wilayaCode, setWilayaCode] = useState(defaultWilaya || '16');
  const [trend, setTrend] = useState('stable');
  const [farmerPrice, setFarmerPrice] = useState('');
  const [slaughterPrice, setSlaughterPrice] = useState('');
  const [intermediaryPrice, setIntermediaryPrice] = useState('');
  const [notes, setNotes] = useState('التحديث اليومي لبورصة الجزائر');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formattedCode = String(wilayaCode).padStart(2, '0');
      const parseOptNum = (val: string) => (val === '' || val === null || val === undefined ? null : Number(val));

      const payload = {
        wilayaCode: formattedCode,
        farmerPrice: parseOptNum(farmerPrice),
        slaughterPrice: parseOptNum(slaughterPrice),
        intermediaryPrice: parseOptNum(intermediaryPrice),
        trend,
        notesAr: notes,
        reportedBy: 'إدارة البورصة',
      };

      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'حدث خطأ أثناء حفظ الأسعار');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-emerald-950 rounded-xl shadow-xs">
              <TrendingUp className="w-5 h-5 font-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                🏛️ تحديث أسعار البورصة
              </h3>
              <p className="text-xs text-slate-500">
                أدخل أسعار الولاية لمستويات التعامل الحية (فلاح / مذبح / وسيط)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label htmlFor="price_wilaya_code" className="block text-slate-700 mb-1">اختر الولاية لتحديث أسعارها</label>
            <select
              id="price_wilaya_code"
              name="wilayaCode"
              value={wilayaCode}
              onChange={(e) => setWilayaCode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-emerald-600 font-black text-emerald-950 bg-emerald-50/50 rounded-xl text-sm"
            >
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - ولاية {w.nameAr} ({w.region})
                </option>
              ))}
            </select>
          </div>

          {/* 3 حقول مباشرة وأنيقة للأسعار: فلاح / مذبح / وسيط */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="text-center text-xs font-black text-slate-800 mb-2 flex items-center justify-center gap-2">
              <span>📊 أدخل أسعار التعامل للولاية (د.ج / كغ):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="farmer_price" className="block text-emerald-900 font-extrabold mb-1">🌾 سعر الفلاح</label>
                <input
                  id="farmer_price"
                  name="farmerPrice"
                  type="number"
                  placeholder="مثال: 320"
                  value={farmerPrice}
                  onChange={(e) => setFarmerPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-center font-black text-sm text-emerald-950 bg-white"
                />
              </div>
              <div>
                <label htmlFor="slaughter_price" className="block text-indigo-900 font-extrabold mb-1">🔪 سعر المذبح</label>
                <input
                  id="slaughter_price"
                  name="slaughterPrice"
                  type="number"
                  placeholder="مثال: 310"
                  value={slaughterPrice}
                  onChange={(e) => setSlaughterPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-300 rounded-xl text-center font-black text-sm text-indigo-950 bg-white"
                />
              </div>
              <div>
                <label htmlFor="intermediary_price" className="block text-amber-900 font-extrabold mb-1">🤝 سعر الوسيط</label>
                <input
                  id="intermediary_price"
                  name="intermediaryPrice"
                  type="number"
                  placeholder="مثال: 330"
                  value={intermediaryPrice}
                  onChange={(e) => setIntermediaryPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-xl text-center font-black text-sm text-amber-950 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="price_notes" className="block text-slate-700 mb-1">مصدر التحديث / ملاحظات الإدارة</label>
            <input
              id="price_notes"
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تجميع من صفحة الغرفة الفلاحية وسطيف دواجن..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'جاري تحديث البورصة...' : '👑 حفظ ونشر التحديث'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. JOB POST MODAL
export function JobPostModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [titleAr, setTitleAr] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('farm');
  const [wilayaCode, setWilayaCode] = useState('10');
  const [commune, setCommune] = useState('');
  const [jobType, setJobType] = useState('full_time');
  const [salaryRange, setSalaryRange] = useState('50,000 - 60,000 د.ج / شهر');
  const [housingProvided, setHousingProvided] = useState(true);
  const [requirements, setRequirements] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const finalPhone = showPhone ? contactPhone : '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر';
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titleAr, companyName, companyType, wilayaCode, commune, jobType, salaryRange, housingProvided, requirements, contactPhone: finalPhone }) });
      const data = await res.json();
      if (data.status === 'success') { onSuccess(); onClose(); } else setError(data.message || 'خطأ');
    } catch { setError('خطأ في الاتصال'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2"><div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><Briefcase className="w-5 h-5" /></div><div><h3 className="text-lg font-black text-slate-900">نشر عرض توظيف</h3><p className="text-xs text-slate-500">ابحث عن عمال في قطاع الدواجن</p></div></div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
          <div><label htmlFor="job_title" className="block text-slate-700 mb-1">عنوان الوظيفة</label><input id="job_title" name="titleAr" type="text" required value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="مطلوب عمال تربية دواجن..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="job_company_name" className="block text-slate-700 mb-1">اسم المؤسسة</label><input id="job_company_name" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
            <div><label htmlFor="job_company_type" className="block text-slate-700 mb-1">النوع</label><select id="job_company_type" name="companyType" value={companyType} onChange={(e) => setCompanyType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl"><option value="farm">مزرعة</option><option value="slaughterhouse">مذبح</option><option value="feed">أعلاف</option><option value="hatchery">مفقس</option><option value="logistics">نقل</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="job_wilaya_code" className="block text-slate-700 mb-1">الولاية</label><select id="job_wilaya_code" name="wilayaCode" value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl">{ALGERIA_WILAYAS.map((w) => (<option key={w.code} value={w.code}>{w.code} - {w.nameAr}</option>))}</select></div>
            <div><label htmlFor="job_commune" className="block text-slate-700 mb-1">البلدية</label><input id="job_commune" name="commune" type="text" value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="job_type" className="block text-slate-700 mb-1">النظام</label><select id="job_type" name="jobType" value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl"><option value="full_time">دوام دائم</option><option value="seasonal">موسمي</option><option value="part_time">جزئي</option></select></div>
            <div><label htmlFor="job_salary_range" className="block text-slate-700 mb-1">الراتب</label><input id="job_salary_range" name="salaryRange" type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="housing2" name="housingProvided" checked={housingProvided} onChange={(e) => setHousingProvided(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" /><label htmlFor="housing2" className="text-xs text-emerald-900 font-extrabold">✔ نوفر المبيت والإعاشة</label></div>
          <div><label htmlFor="job_requirements" className="block text-slate-700 mb-1">المهام والشروط</label><textarea id="job_requirements" name="requirements" rows={2} required value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          <div>
            <label htmlFor="job_contact_phone" className="block text-slate-700 mb-1">هاتف التواصل</label>
            <input id="job_contact_phone" name="contactPhone" type="text" required={showPhone} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="0550..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            <div className="flex items-center gap-2 mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input type="checkbox" id="show_phone_job" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
              <label htmlFor="show_phone_job" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                {showPhone ? '👁️ إظهار رقم الهاتف للعملاء' : '🙈 إخفاء رقم الهاتف (الهاتف مخفي)'}
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">إلغاء</button><button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-lg">{loading ? 'جاري...' : 'نشر عرض العمل'}</button></div>
        </form>
      </div>
    </div>
  );
}

// 3. WORKER REGISTRATION MODAL
export function WorkerRegisterModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('poultry_worker');
  const [wilayaCode, setWilayaCode] = useState('10');
  const [experienceYears, setExperienceYears] = useState(3);
  const [willingToRelocate, setWillingToRelocate] = useState(true);
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const finalPhone = showPhone ? phone : '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر';
    try {
      const res = await fetch('/api/workers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, specialty, wilayaCode, experienceYears, willingToRelocate, phone: finalPhone, bio }) });
      const data = await res.json();
      if (data.status === 'success') { onSuccess(); onClose(); } else setError(data.message || 'خطأ');
    } catch { setError('خطأ في الاتصال'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2"><div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><User className="w-5 h-5" /></div><div><h3 className="text-lg font-black text-slate-900">تسجيل باحث عن عمل</h3><p className="text-xs text-slate-500">انضم لقائمة العمال في قطاع الدواجن</p></div></div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="worker_full_name" className="block text-slate-700 mb-1">الاسم الكامل</label><input id="worker_full_name" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
            <div><label htmlFor="worker_specialty" className="block text-slate-700 mb-1">التخصص</label><select id="worker_specialty" name="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl"><option value="poultry_worker">عامل تربية</option><option value="slaughter_worker">عامل ذبح</option><option value="veterinarian">بيطري</option><option value="driver_refrigerated">سائق مبرد</option><option value="farm_supervisor">مشرف مزارع</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="worker_wilaya_code" className="block text-slate-700 mb-1">الولاية الحالية</label><select id="worker_wilaya_code" name="wilayaCode" value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl">{ALGERIA_WILAYAS.map((w) => (<option key={w.code} value={w.code}>{w.code} - {w.nameAr}</option>))}</select></div>
            <div><label htmlFor="worker_experience_years" className="block text-slate-700 mb-1">سنوات الخبرة</label><input id="worker_experience_years" name="experienceYears" type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="relocate2" name="willingToRelocate" checked={willingToRelocate} onChange={(e) => setWillingToRelocate(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" /><label htmlFor="relocate2" className="text-xs text-emerald-900 font-extrabold">✔ أقبل العمل في ولايات أخرى</label></div>
          <div>
            <label htmlFor="worker_phone" className="block text-slate-700 mb-1">رقم الهاتف</label>
            <input id="worker_phone" name="phone" type="text" required={showPhone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0550..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            <div className="flex items-center gap-2 mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input type="checkbox" id="show_phone_worker" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" />
              <label htmlFor="show_phone_worker" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                {showPhone ? '👁️ إظهار رقم الهاتف لأصحاب المزارع' : '🙈 إخفاء رقم الهاتف (الهاتف مخفي)'}
              </label>
            </div>
          </div>
          <div><label htmlFor="worker_bio" className="block text-slate-700 mb-1">نبذة عن الخبرات</label><textarea id="worker_bio" name="bio" rows={2} required value={bio} onChange={(e) => setBio(e.target.value)} placeholder="خبرة 5 سنوات في المزارع والتدفئة..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">إلغاء</button><button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg">{loading ? 'جاري...' : 'تسجيل'}</button></div>
        </form>
      </div>
    </div>
  );
}

// 4. COMPANY REGISTER MODAL
interface OfferPostModalProps extends ModalProps {
  defaultOfferType: 'farmer' | 'slaughterhouse' | 'broker';
}

export function OfferPostModal({ isOpen, onClose, onSuccess, defaultOfferType }: OfferPostModalProps) {
  const [offerType, setOfferType] = useState<'farmer' | 'slaughterhouse' | 'broker'>(defaultOfferType);
  const [name, setName] = useState('');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [commune, setCommune] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  // Farmer fields
  const [chickenCategories, setChickenCategories] = useState('متوسطة');
  const [weightRange, setWeightRange] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [breedType, setBreedType] = useState('Ross 308');
  const [farmAcreage, setFarmAcreage] = useState('');
  const [chickenAge, setChickenAge] = useState('');
  const [farmerPrice, setFarmerPrice] = useState('');
  const [details, setDetails] = useState('');
  // Buyer fields
  const [buyKhashna, setBuyKhashna] = useState('');
  const [buyMotawassita, setBuyMotawassita] = useState('');
  const [buyRaqiqa, setBuyRaqiqa] = useState('');
  const [maxPurchaseKg, setMaxPurchaseKg] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [buyingDetails, setBuyingDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const typeLabels = { farmer: 'فلاح (بيع)', slaughterhouse: 'مذبح (شراء)', broker: 'كورتي (شراء)' };
  const isFarmer = offerType === 'farmer';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const finalPhone = showPhone ? phone : '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر';
    try {
      const body: Record<string, any> = { offerType, name, wilayaCode, commune, phone: finalPhone };
      if (isFarmer) {
        body.farmerPrice = farmerPrice ? Number(farmerPrice) : null;
        body.chickenCategories = chickenCategories;
        body.weightRange = weightRange;
        body.availableQuantity = availableQuantity;
        body.breedType = breedType;
        body.farmAcreage = farmAcreage;
        body.chickenAge = chickenAge;
        body.details = details;
      } else {
        body.buyKhashna = buyKhashna ? Number(buyKhashna) : null;
        body.buyMotawassita = buyMotawassita ? Number(buyMotawassita) : null;
        body.buyRaqiqa = buyRaqiqa ? Number(buyRaqiqa) : null;
        body.maxPurchaseKg = maxPurchaseKg;
        body.deliveryArea = deliveryArea;
        body.buyingDetails = buyingDetails;
      }
      const response = await fetch('/api/offers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (data.status === 'success') { onSuccess(); onClose(); } else { setError(data.message || 'تعذر النشر.'); }
    } catch { setError('خطأ اتصال.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
              {isFarmer ? '🌾' : offerType === 'slaughterhouse' ? '🔪' : '🤝'}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{isFarmer ? 'نشر عرض فلاح — بيع الدجاج' : `نشر عرض ${offerType === 'slaughterhouse' ? 'مذبح' : 'كورتي'} — أسعار الشراء`}</h3>
              <p className="text-xs text-slate-500">{isFarmer ? 'معلومات مزرعتك ونوع الدجاج والكمية والسعر' : 'أدخل الأسعار التي تشتري بها كل فئة دجاج'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-slate-700 mb-1">الاسم</label><input required value={name} onChange={(e) => setName(e.target.value)} placeholder={isFarmer ? 'اسم المزرعة' : 'اسم المذبح / الشركة'} className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
            <div>
              <label className="block text-slate-700 mb-1">رقم الهاتف</label>
              <input required={showPhone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0550..." className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
              <div className="flex items-center gap-2 mt-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input type="checkbox" id="show_phone_offer" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer" />
                <label htmlFor="show_phone_offer" className="text-[11px] font-bold text-slate-800 cursor-pointer select-none">
                  {showPhone ? '👁️ إظهار رقم الهاتف' : '🙈 إخفاء رقم الهاتف'}
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-slate-700 mb-1">الولاية</label><select value={wilayaCode} onChange={(e) => setWilayaCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl">{ALGERIA_WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.code} — {w.nameAr}</option>)}</select></div>
            <div><label className="block text-slate-700 mb-1">البلدية</label><input value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="مثال: الأخضرية" className="w-full px-3 py-2 border border-slate-300 rounded-xl" /></div>
          </div>

          {isFarmer ? (
            // Farmer form
            <>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="text-xs font-black text-emerald-800">معلومات الدجاج وسعر البيع المعروض</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-emerald-950 font-black mb-1">💰 سعر البيع المطلوب (د.ج / كغ)</label>
                    <input type="number" required value={farmerPrice} onChange={(e) => setFarmerPrice(e.target.value)} placeholder="مثال: 285" className="w-full px-3 py-2 border border-emerald-500 bg-white font-black text-emerald-900 rounded-lg shadow-2xs focus:ring-2 focus:ring-emerald-600" />
                  </div>
                  <div><label className="block text-slate-700 mb-1">فئة الدجاج</label><select value={chickenCategories} onChange={(e) => setChickenCategories(e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded-lg"><option>خشنة</option><option>متوسطة</option><option>رقيقة</option><option>خشنة، متوسطة</option><option>متوسطة، رقيقة</option><option>خشنة، متوسطة، رقيقة</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-slate-700 mb-1">الوزن (كغ)</label><input value={weightRange} onChange={(e) => setWeightRange(e.target.value)} placeholder="2.0-2.6 كغ" className="w-full px-2 py-2 border border-slate-300 rounded-lg" /></div>
                  <div><label className="block text-slate-700 mb-1">الكمية المتاحة</label><input required value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} placeholder="5,000 طير" className="w-full px-2 py-2 border border-slate-300 rounded-lg" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-slate-700 mb-1">السلالة</label><select value={breedType} onChange={(e) => setBreedType(e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded-lg"><option>Ross 308</option><option>Cobb 500</option><option>محلي</option><option>محلي محسّن</option></select></div>
                  <div><label className="block text-slate-700 mb-1">العمر بالأيام</label><input value={chickenAge} onChange={(e) => setChickenAge(e.target.value)} placeholder="45 يوم" className="w-full px-2 py-2 border border-slate-300 rounded-lg" /></div>
                </div>
                <div><label className="block text-slate-700 mb-1">تفاصيل إضافية</label><textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="تفاصيل عن التغذية، التلقيح، الاستلام..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              </div>
            </>
          ) : (
            // Buyer (slaughterhouse/broker) form
            <>
              <div className={`p-3 rounded-xl border space-y-3 ${offerType === 'slaughterhouse' ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`text-xs font-black ${offerType === 'slaughterhouse' ? 'text-indigo-800' : 'text-amber-800'}`}>أسعار الشراء لكل فئة (د.ج / كغ)</div>
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className={`${offerType === 'slaughterhouse' ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                      <th className="py-2 px-3 font-black text-slate-700 rounded-tr-lg">الفئة</th>
                      <th className={`py-2 px-3 font-black border-r border-slate-200 rounded-tl-lg ${offerType === 'slaughterhouse' ? 'text-indigo-800' : 'text-amber-800'}`}>سعر الشراء (د.ج/كغ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="py-2 px-3 font-bold text-slate-800">خشنة</td><td className="py-2 px-3 border-r border-slate-200"><input type="number" value={buyKhashna} onChange={(e) => setBuyKhashna(e.target.value)} placeholder="مثال: 300" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black" /></td></tr>
                    <tr><td className="py-2 px-3 font-bold text-slate-800">متوسطة</td><td className="py-2 px-3 border-r border-slate-200"><input type="number" value={buyMotawassita} onChange={(e) => setBuyMotawassita(e.target.value)} placeholder="مثال: 280" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black" /></td></tr>
                    <tr><td className="py-2 px-3 font-bold text-slate-800">رقيقة</td><td className="py-2 px-3 border-r border-slate-200"><input type="number" value={buyRaqiqa} onChange={(e) => setBuyRaqiqa(e.target.value)} placeholder="مثال: 265" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-black" /></td></tr>
                  </tbody>
                </table>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-slate-700 mb-1">الكمية القصوى للشراء</label><input value={maxPurchaseKg} onChange={(e) => setMaxPurchaseKg(e.target.value)} placeholder="15 طن يومياً" className="w-full px-2 py-2 border border-slate-300 rounded-lg" /></div>
                  <div><label className="block text-slate-700 mb-1">نطاق التوزيع</label><input value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} placeholder="ولاية، ولايات مجاورة..." className="w-full px-2 py-2 border border-slate-300 rounded-lg" /></div>
                </div>
                <div><label className="block text-slate-700 mb-1">تفاصيل الشراء</label><textarea rows={2} value={buyingDetails} onChange={(e) => setBuyingDetails(e.target.value)} placeholder="ذبح حلال، تعبئة، تبريد..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" /></div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">إلغاء</button>
            <button type="submit" disabled={loading} className={`px-6 py-2 font-extrabold rounded-xl shadow-lg disabled:opacity-50 text-white ${isFarmer ? 'bg-emerald-700 hover:bg-emerald-600' : offerType === 'slaughterhouse' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-amber-500 hover:bg-amber-400 text-emerald-950'}`}>
              {loading ? 'جاري...' : `نشر العرض`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CompanyRegisterModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [type, setType] = useState('feed_supplier');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [commune, setCommune] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  const [capacity, setCapacity] = useState('');
  const [certifications, setCertifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dynamic feed types & prices for Feed Sellers (بائع أعلاف)
  const [feedList, setFeedList] = useState<{ typeName: string; price: string }[]>([
    { typeName: 'علف دجاج تسمين (بداية - Démarrage)', price: '8,500 د.ج/قنطار' },
    { typeName: 'علف دجاج تسمين (نمو - Croissance)', price: '8,200 د.ج/قنطار' },
  ]);

  // Dynamic chick types & prices for Chicks Sellers (بائع الفلوس)
  const [chickList, setChickList] = useState<{ typeName: string; price: string }[]>([
    { typeName: 'صوص Cobb 500 (1 يوم)', price: '120 د.ج/طير' },
    { typeName: 'صوص Ross 308 (1 يوم)', price: '125 د.ج/طير' },
  ]);

  // Dynamic vet services & prices for Veterinarians (بيطري)
  const [vetList, setVetList] = useState<{ typeName: string; price: string }[]>([
    { typeName: 'استشارة ومعاينة بيطرية للمزرعة', price: '5,000 د.ج/زيارة' },
    { typeName: 'برنامج تلقيح ودواء حماية (التسمين)', price: '2,500 د.ج/دفعة' },
  ]);

  const handleAddFeedRow = () => {
    setFeedList([...feedList, { typeName: '', price: '' }]);
  };

  const handleRemoveFeedRow = (index: number) => {
    setFeedList(feedList.filter((_, i) => i !== index));
  };

  const handleFeedChange = (index: number, field: 'typeName' | 'price', val: string) => {
    const updated = [...feedList];
    updated[index][field] = val;
    setFeedList(updated);
  };

  const handleAddChickRow = () => {
    setChickList([...chickList, { typeName: '', price: '' }]);
  };

  const handleRemoveChickRow = (index: number) => {
    setChickList(chickList.filter((_, i) => i !== index));
  };

  const handleChickChange = (index: number, field: 'typeName' | 'price', val: string) => {
    const updated = [...chickList];
    updated[index][field] = val;
    setChickList(updated);
  };

  const handleAddVetRow = () => {
    setVetList([...vetList, { typeName: '', price: '' }]);
  };

  const handleRemoveVetRow = (index: number) => {
    setVetList(vetList.filter((_, i) => i !== index));
  };

  const handleVetChange = (index: number, field: 'typeName' | 'price', val: string) => {
    const updated = [...vetList];
    updated[index][field] = val;
    setVetList(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validFeeds = feedList.filter((f) => f.typeName.trim() !== '');
    const validChicks = chickList.filter((c) => c.typeName.trim() !== '');
    const validVets = vetList.filter((v) => v.typeName.trim() !== '');

    let finalCapacity = capacity;
    if (type === 'feed_supplier' && validFeeds.length > 0) {
      finalCapacity = validFeeds.map((f) => `${f.typeName}: ${f.price || 'عند الاتصال'}`).join(' | ');
    } else if (type === 'hatchery' && validChicks.length > 0) {
      finalCapacity = validChicks.map((c) => `${c.typeName}: ${c.price || 'عند الاتصال'}`).join(' | ');
    } else if (type === 'veterinary' && validVets.length > 0) {
      finalCapacity = validVets.map((v) => `${v.typeName}: ${v.price || 'عند الاتصال'}`).join(' | ');
    }

    const finalPhone = showPhone ? phone : '🔒 رقم الهاتف مخفي بناءً على رغبة الناشر';

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr,
          nameFr,
          type,
          wilayaCode,
          commune,
          phone: finalPhone,
          capacity: finalCapacity,
          certifications,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'خطأ أثناء الحفظ');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">إضافة نشاط B2B</h3>
              <p className="text-xs text-slate-500">بائع أعلاف، بائع فلوس، أو بيطري</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">اسم المحل / الشركة (عربي)</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="مثال: مطاحن وأعلاف البركة..."
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">الاسم (فرنسي - اختيارياً)</label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">اختر نوع النشاط</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-amber-500 bg-amber-50/50 font-black text-amber-950 rounded-xl"
              >
                <option value="feed_supplier">🌾 بائع أعلاف</option>
                <option value="hatchery">🐤 بائع فلوس (مفقس / صوص)</option>
                <option value="veterinary">🩺 بيطري (عيادة / أدوية)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">الولاية</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">البلدية</label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="البلدية..."
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">رقم الهاتف للتواصل</label>
              <input
                type="text"
                required={showPhone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="0550..."
              />
              <div className="flex items-center gap-2 mt-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input type="checkbox" id="show_phone_company" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer" />
                <label htmlFor="show_phone_company" className="text-[11px] font-bold text-slate-800 cursor-pointer select-none">
                  {showPhone ? '👁️ إظهار رقم الهاتف' : '🙈 إخفاء رقم الهاتف'}
                </label>
              </div>
            </div>
          </div>

          {/* DYNAMIC FEED TYPES BUILDER FOR FEED SELLERS */}
          {type === 'feed_supplier' ? (
            <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-amber-950 text-xs block">
                    🌾 أنواع الأعلاف والأسعار المعروضة:
                  </span>
                  <span className="text-[10px] text-amber-800 font-normal">
                    أدخل اسم نوع العلف وسعره، ويمكنك إضافة عدة أنواع بسهولة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddFeedRow}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة نوع علف
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {feedList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">اسم نوع العلف #{idx + 1}</label>
                      <input
                        type="text"
                        placeholder="مثال: علف تسمين بداية (Demarrage)"
                        value={item.typeName}
                        onChange={(e) => handleFeedChange(idx, 'typeName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-[10px] text-slate-500 mb-0.5">السعر</label>
                      <input
                        type="text"
                        placeholder="مثال: 8,500 د.ج/قنطار"
                        value={item.price}
                        onChange={(e) => handleFeedChange(idx, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-amber-500 text-emerald-800"
                      />
                    </div>
                    {feedList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeedRow(idx)}
                        className="p-1.5 mt-4 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="حذف هذا النوع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : type === 'hatchery' ? (
            <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-emerald-950 text-xs block">
                    🐤 أنواع وسلالات الفلوس (الصوص) والأسعار:
                  </span>
                  <span className="text-[10px] text-emerald-800 font-normal">
                    أدخل نوع/سلالة الفلوس وسعره، ويمكنك إضافة عدة أنواع بسهولة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddChickRow}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة نوع صوص
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {chickList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">نوع/سلالة الصوص #{idx + 1}</label>
                      <input
                        type="text"
                        placeholder="مثال: صوص Cobb 500 (1 يوم)"
                        value={item.typeName}
                        onChange={(e) => handleChickChange(idx, 'typeName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-[10px] text-slate-500 mb-0.5">السعر</label>
                      <input
                        type="text"
                        placeholder="مثال: 120 د.ج/طير"
                        value={item.price}
                        onChange={(e) => handleChickChange(idx, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-emerald-500 text-emerald-800"
                      />
                    </div>
                    {chickList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChickRow(idx)}
                        className="p-1.5 mt-4 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="حذف هذا النوع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : type === 'veterinary' ? (
            <div className="p-3.5 bg-indigo-50/90 rounded-2xl border border-indigo-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-indigo-950 text-xs block">
                    🩺 الخدمات والأدوية البيطرية والأسعار:
                  </span>
                  <span className="text-[10px] text-indigo-800 font-normal">
                    أدخل اسم الخدمة أو اللقاح البيطري وسعره، ويمكنك إضافة عدة خدمات بسهولة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddVetRow}
                  className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 text-white font-black rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة خدمة بيطرية
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {vetList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-indigo-200 shadow-2xs">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">اسم الخدمة / اللقاح البيطري #{idx + 1}</label>
                      <input
                        type="text"
                        placeholder="مثال: زيارة واستشارة ميدانية للمزرعة"
                        value={item.typeName}
                        onChange={(e) => handleVetChange(idx, 'typeName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-[10px] text-slate-500 mb-0.5">السعر / التكلفة</label>
                      <input
                        type="text"
                        placeholder="مثال: 5,000 د.ج/زيارة"
                        value={item.price}
                        onChange={(e) => handleVetChange(idx, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-indigo-500 text-indigo-900"
                      />
                    </div>
                    {vetList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVetRow(idx)}
                        className="p-1.5 mt-4 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="حذف هذه الخدمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 mb-1">الخدمات / تفاصيل العرض الفلاحي</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="تفاصيل وإمكانيات المزرعة..."
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-1">الشهادات والاعتمادات (اختياري)</label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              placeholder="مثال: ترخيص وزارة الفلاحة، اعتماد بيطري..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ ونشر النشاط'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 7. REGISTRATION MODAL
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
  onSwitchToLogin?: () => void;
  onSwitchToRegister?: () => void;
}

export function RegistrationModal({ isOpen, onClose, onSuccess, onSwitchToLogin }: AuthModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true); // Visible by default as requested
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمة السر وتأكيد كلمة السر غير متطابقين');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, role, wilayaCode, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'خطأ أثناء إنشاء الحساب');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-emerald-950 rounded-xl shadow-xs font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">إنشاء حساب جديد في البورصة</h3>
              <p className="text-xs text-slate-500">أدخل بياناتك للتفاعل والنشر في البورصة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">الاسم واللقب الكامل</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              placeholder="مثال: محمد بن علي"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">رقم الهاتف (يُستخدم للدخول والتواصل)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              placeholder="0550123456"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">اختر نوع الحساب</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-emerald-600 bg-emerald-50/50 font-black text-emerald-950 rounded-xl text-xs"
              >
                <option value="farmer">🌾 مربي دواجن / فلاح</option>
                <option value="slaughterhouse">🔪 مذبح معتمد</option>
                <option value="broker">🤝 وسيط / كورتي / موزع</option>
                <option value="b2b">🏢 نشاط B2B (أعلاف/فلوس/بيطري)</option>
                <option value="worker">👷 باحث عن عمل / عامل</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">الولاية الرئيسية</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 bg-slate-50 font-bold rounded-xl text-xs"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - ولاية {w.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700">كلمة السر</label>
              <span className="text-[10px] text-emerald-700 font-bold">👁️ كلمة السر ظاهرة لسهولة الكتابة</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-3 pl-10 focus:ring-2 focus:ring-emerald-600"
                placeholder="أدخل كلمة السر..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                title={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">تأكيد كلمة السر</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-3 pl-10 focus:ring-2 focus:ring-emerald-600"
                placeholder="أعد كتابة كلمة السر للتأكيد..."
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                title={showConfirmPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl shadow-lg transition text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب الآن'}
            </button>

            {onSwitchToLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="w-full text-center text-xs text-emerald-800 hover:underline font-bold py-1 cursor-pointer"
              >
                لديك حساب بالفعل؟ تسجيل الدخول
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// 8. LOGIN MODAL
export function LoginModal({ isOpen, onClose, onSuccess, onSwitchToRegister }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'خطأ أثناء تسجيل الدخول');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تسجيل الدخول إلى حسابك</h3>
              <p className="text-xs text-slate-500">أدخل رقم الهاتف وكلمة السر</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              placeholder="0550123456"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700">كلمة السر</label>
              <span className="text-[10px] text-emerald-700 font-bold">👁️ إظهار/إخفاء كلمة السر</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-3 pl-10 focus:ring-2 focus:ring-emerald-600"
                placeholder="أدخل كلمة السر..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                title={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            {onSwitchToRegister && (
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="w-full text-center text-xs text-emerald-800 hover:underline font-bold py-1 cursor-pointer"
              >
                ليس لديك حساب بعد؟ إنشاء حساب جديد
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// 9. ACCOUNT SETTINGS MODAL
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUpdateUser: (updatedUser: any) => void;
}

export function AccountSettingsModal({ isOpen, onClose, currentUser, onUpdateUser }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [wilayaCode, setWilayaCode] = useState(currentUser?.wilayaCode || '16');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentUser.phone,
          fullName,
          wilayaCode,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onUpdateUser(data.user);
        setMessage('تم حفظ تعديل البيانات الشخصية بنجاح');
      } else {
        setError(data.message || 'خطأ أثناء الحفظ');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmNewPassword) {
      setError('كلمة السر الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentUser.phone,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onUpdateUser(data.user);
        setMessage('تم تغيير كلمة السر بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setError(data.message || 'خطأ أثناء تغيير كلمة السر');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">إعدادات الحساب الشخصي</h3>
              <p className="text-xs text-slate-500">تعديل البيانات وتغيير كلمة السر</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab('profile');
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👤 البيانات الشخصية
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'password'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔑 تغيير كلمة السر
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            {message}
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">الاسم واللقب الكامل</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">رقم الهاتف (ثابت لا يتغير)</label>
              <input
                type="text"
                disabled
                value={currentUser.phone}
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">الولاية الرئيسية</label>
              <select
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 bg-slate-50 font-bold rounded-xl text-xs"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - ولاية {w.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition text-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">كلمة السر الحالية</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                placeholder="أدخل كلمة السر الحالية للتأكيد..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700">كلمة السر الجديدة</label>
                <span className="text-[10px] text-emerald-700 font-bold">👁️ كلمة السر ظاهرة</span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-3 pl-10 focus:ring-2 focus:ring-emerald-600"
                  placeholder="أدخل كلمة السر الجديدة..."
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">تأكيد كلمة السر الجديدة</label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 pr-3 pl-10 focus:ring-2 focus:ring-emerald-600"
                  placeholder="أعد كتابة كلمة السر الجديدة..."
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl shadow-lg transition text-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'جاري التحديث...' : 'تحديث كلمة السر'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// 10. USER SUBSCRIPTION MODAL (Upload Documents & Pending 48h Review View)
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onSuccess?: (user: any) => void;
}

export function SubscriptionModal({ isOpen, onClose, currentUser, onSuccess }: SubscriptionModalProps) {
  const [receiptUrl, setReceiptUrl] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (currentUser?.phone) {
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const currentStatus = currentUser?.subscriptionStatus;
  const isPending = currentStatus === 'pending' || submitted;
  const isActive = currentStatus === 'active';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميغابايت');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyRip = () => {
    navigator.clipboard.writeText('00799999002360754196');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetPhone = phone || currentUser?.phone;
    if (!targetPhone) {
      setError('يرجى التأكد من رقم الهاتف المسجل');
      return;
    }

    if (!receiptUrl || !idCardUrl) {
      setError('يرجى رفع أو إرفاق صورتي وصل الإيداع وبطاقة الهوية/الفلاح لإكمال الطلب');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscription/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          receiptUrl,
          idCardUrl,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        const updatedUser = {
          ...currentUser,
          subscriptionStatus: 'pending',
        };
        localStorage.setItem('poultry_user', JSON.stringify(updatedUser));
        if (onSuccess) onSuccess(updatedUser);
        setSubmitted(true);
      } else {
        setError(data.message || 'حدث خطأ أثناء إرسال الوثائق');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-400 text-emerald-950 rounded-xl shadow-xs font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">توثيق وتفعيل اشتراك البورصة</h3>
              <p className="text-[11px] text-slate-500">منصة بورصة الدواجن الجزائرية الرسمية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ACTIVE SUBSCRIBER */}
        {isActive ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
              ✅
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">
                مرحباً بك {currentUser?.fullName || 'عضو البورصة'}!
              </h4>
              <p className="text-xs text-emerald-800 font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-200 leading-relaxed">
                حسابك مفعّل بنجاح. يمكنك الآن الاطلاع على كافة الأسعار اليومية، العروض، ودليل المتعاملين مباشرة.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              تصفح البورصة الآن 🚀
            </button>
          </div>
        ) : isPending ? (
          /* 2. PENDING REVIEW (48 HOURS NOTICE) */
          <div className="space-y-4 text-center py-2">
            <div className="w-20 h-20 bg-amber-100 text-amber-900 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse">
              ⏳
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-900 rounded-full text-xs font-black border border-amber-300">
                <Clock className="w-4 h-4" />
                طلبك قيد المراجعة والاعتماد
              </div>

              <h4 className="text-base font-black text-slate-900">
                {currentUser?.fullName ? `أهلاً بك (${currentUser.fullName})` : 'أهلاً بك في منصة البورصة'}
              </h4>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-950 space-y-2 leading-relaxed">
                <p className="text-sm font-black text-amber-900 flex items-center justify-center gap-1">
                  <span>حسابك تحت المراجعة وسيتم تفعيله في غضون 48 ساعة</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  لقد استلم فريق إدارة البورصة الوثائق الخاصة بك (وصل الإيداع ووثيقة التوثيق) وجاري التدقيق ليتم منحك التفعيل الشامل للوصول لكافة بيانات المتعاملين والعروض.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              حسناً، فهمت 👍
            </button>
          </div>
        ) : (
          /* 3. NEW OR REJECTED SUBSCRIBER (PAYMENT DETAILS & DOCUMENT UPLOAD) */
          <div className="space-y-4">
            {/* Value Proposition Callout Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-3.5 rounded-2xl shadow-md border border-emerald-700 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-300 shrink-0 animate-bounce" />
              <p className="text-xs font-black leading-snug">
                الاشتراك يحفظ حقوق جميع المتعاملين ويساهم في تطوير وتأطير سوق الدواجن الجزائرية
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Payment Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between font-black text-slate-900 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CreditCard className="w-4 h-4" />
                  مبلغ الاشتراك الرسمي:
                </span>
                <span className="px-2.5 py-1 bg-amber-400 text-emerald-950 rounded-lg text-xs font-black">
                  1000 دج / لمدة شهرين (2 أشهر)
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-600 font-bold">يرجى إرسال مبلغ الاشتراك عبر الحساب البريدي BaridiMob:</p>
                <div className="bg-white border-2 border-emerald-600/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="text-left font-mono font-black text-slate-900 text-xs dir-ltr tracking-wider">
                    00799999002360754196
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyRip}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-emerald-800" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Document Upload Form */}
            <form onSubmit={handleSubmitDocs} className="space-y-3 text-xs">
              {!currentUser?.phone && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الهاتف المسجل</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                    placeholder="0550000000"
                  />
                </div>
              )}

              {/* Upload ID Card */}
              <div>
                <label className="block text-slate-800 font-black mb-1 flex items-center gap-1">
                  <span>🆔 1. صورة وثيقة الهوية أو بطاقة الفلاح</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-dashed border-slate-300 font-bold text-[11px] cursor-pointer flex items-center justify-center gap-2 transition">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>{idCardUrl ? '✓ تم اختيار صورة الهوية' : 'انقر لاختيار صورة بطاقة الهوية / بطاقة الفلاح'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setIdCardUrl)}
                      className="hidden"
                    />
                  </label>
                </div>
                {idCardUrl && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img src={idCardUrl} alt="الهوية" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                    <span className="text-[10px] text-emerald-700 font-bold">جاهز للإرسال</span>
                  </div>
                )}
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-slate-800 font-black mb-1 flex items-center gap-1">
                  <span>🧾 2. صورة وصل الإيداع / تحويل BaridiMob</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-dashed border-slate-300 font-bold text-[11px] cursor-pointer flex items-center justify-center gap-2 transition">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>{receiptUrl ? '✓ تم اختيار صورة الوصل' : 'انقر لاختيار صورة وصل التحويل البريدي'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setReceiptUrl)}
                      className="hidden"
                    />
                  </label>
                </div>
                {receiptUrl && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img src={receiptUrl} alt="الوصل" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                    <span className="text-[10px] text-emerald-700 font-bold">جاهز للإرسال</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl shadow-lg transition text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'جاري إرسال الوثائق...'
                  ) : (
                    <>
                      <span>تأكيد وإرسال وثائق الاشتراك 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// 11. ADMIN SUBSCRIPTION MANAGER MODAL
interface AdminSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AdminSubscriptionManagerModal({ isOpen, onClose, onRefresh }: AdminSubModalProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Status tab filter: 'pending' (default) | 'active' (المقبولين) | 'rejected' | 'all'
  const [statusTab, setStatusTab] = useState<'pending' | 'active' | 'rejected' | 'all'>('pending');
  // Search query (fullName or phone)
  const [searchQuery, setSearchQuery] = useState('');
  // Wilaya filter
  const [selectedWilaya, setSelectedWilaya] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscription/admin-requests');
      const data = await res.json();
      if (data.status === 'success') {
        setRequests(data.requests || []);
      } else {
        setError(data.message || 'خطأ أثناء جلب الطلبات');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const handleAction = async (targetPhone: string, action: 'approve' | 'reject') => {
    setActionLoading(targetPhone);
    try {
      const res = await fetch('/api/subscription/admin-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone: 'BARIHDANAJMA',
          targetPhone,
          action,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        await fetchRequests();
        onRefresh();
      } else {
        alert(data.message || 'خطأ أثناء العملية');
      }
    } catch {
      alert('خطأ في الاتصال بالسيرفر');
    } finally {
      setActionLoading(null);
    }
  };

  // Counts per tab
  const pendingCount = requests.filter((r) => r.subscriptionStatus === 'pending').length;
  const activeCount = requests.filter((r) => r.subscriptionStatus === 'active').length;
  const rejectedCount = requests.filter((r) => r.subscriptionStatus === 'rejected').length;
  const allCount = requests.length;

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // 1. Status tab filter
    if (statusTab !== 'all' && req.subscriptionStatus !== statusTab) {
      return false;
    }

    // 2. Wilaya filter
    if (selectedWilaya && String(req.wilayaCode) !== String(selectedWilaya)) {
      return false;
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = req.fullName && req.fullName.toLowerCase().includes(q);
      const matchPhone = req.phone && req.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-emerald-950 rounded-xl font-black">
              📋
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">إدارة طلبات الاشتراك والمشتركين</h3>
              <p className="text-xs text-slate-500">معاينة وصل الدفع وتفعيل الاشتراكات والبحث وتصنيف الولايات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Modal Image Full Preview */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="المستند" className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
          </div>
        )}

        {/* STATUS TABS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            onClick={() => setStatusTab('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusTab === 'pending'
                ? 'bg-amber-400 text-emerald-950 shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>⏳ قيد المراجعة</span>
            <span className="px-1.5 py-0.5 bg-white/60 rounded-full text-[10px] font-bold">{pendingCount}</span>
          </button>

          <button
            onClick={() => setStatusTab('active')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusTab === 'active'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>✅ قائمة المقبولين</span>
            <span className="px-1.5 py-0.5 bg-emerald-900/40 rounded-full text-[10px] font-bold">{activeCount}</span>
          </button>

          <button
            onClick={() => setStatusTab('rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>❌ المرفوضين</span>
            <span className="px-1.5 py-0.5 bg-rose-900/40 rounded-full text-[10px] font-bold">{rejectedCount}</span>
          </button>

          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusTab === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>📂 جميع الحسابات</span>
            <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">{allCount}</span>
          </button>
        </div>

        {/* SEARCH AND WILAYA FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
          {/* Search by Name or Phone */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم واللقب أو رقم الهاتف..."
              className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Filter by Wilaya */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800 shrink-0" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">جميع الولايات (58 ولاية)</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - ولاية {w.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* REQUESTS LIST */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-bold">جاري تحميل المشتركين والطلبات...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            لا توجد حسابات أو طلبات اشتراك تطابق الفلتر المختار حالياً.
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {filteredRequests.map((req) => {
              const wilayaObj = ALGERIA_WILAYAS.find((w) => String(w.code) === String(req.wilayaCode));
              const wilayaName = wilayaObj ? `ولاية ${wilayaObj.nameAr}` : `ولاية ${req.wilayaCode || 'غير حددة'}`;

              return (
                <div
                  key={req.id}
                  className="bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl p-3.5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-black text-slate-900 text-sm">{req.fullName}</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-mono font-bold">
                        {req.phone}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 rounded text-[10px] font-bold">
                        📍 {wilayaName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          req.subscriptionStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.subscriptionStatus === 'pending'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.subscriptionStatus === 'active'
                          ? '✅ مشترك مفعّل'
                          : req.subscriptionStatus === 'pending'
                          ? '⏳ قيد المراجعة'
                          : '❌ مرفوض'}
                      </span>
                    </div>

                    {/* Document Links */}
                    <div className="flex items-center gap-2 pt-1">
                      {req.receiptUrl ? (
                        <button
                          onClick={() => setPreviewImage(req.receiptUrl)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-emerald-300 cursor-pointer"
                        >
                          🧾 معاينة وصل الدفع
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">لا يوجد وصل دفع مرفق</span>
                      )}

                      {req.idCardUrl ? (
                        <button
                          onClick={() => setPreviewImage(req.idCardUrl)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-amber-300 cursor-pointer"
                        >
                          🆔 معاينة وثيقة الهوية
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">لا توجد صورة هوية مرفقة</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {req.subscriptionStatus !== 'active' && (
                      <button
                        onClick={() => handleAction(req.phone, 'approve')}
                        disabled={actionLoading === req.phone}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50 transition"
                      >
                        {actionLoading === req.phone ? 'جاري...' : '✅ تفعيل الاشتراك'}
                      </button>
                    )}
                    {req.subscriptionStatus !== 'rejected' && (
                      <button
                        onClick={() => handleAction(req.phone, 'reject')}
                        disabled={actionLoading === req.phone}
                        className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50 transition"
                      >
                        ❌ رفض
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
