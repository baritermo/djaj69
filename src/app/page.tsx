'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import WilayaPriceBoard from '@/components/WilayaPriceBoard';
import JobsAndWorkersBoard from '@/components/JobsAndWorkersBoard';
import B2BDirectory from '@/components/B2BDirectory';
import MarketOffersBoard from '@/components/MarketOffersBoard';
import FridayHolidayScreen from '@/components/FridayHolidayScreen';
import UnifiedB2BMarketplace from '@/components/UnifiedB2BMarketplace';
import UnifiedOfferModal from '@/components/UnifiedOfferModal';
import {
  PriceReportModal,
  JobPostModal,
  WorkerRegisterModal,
  CompanyRegisterModal,
  OfferPostModal,
  RegistrationModal,
  LoginModal,
  AccountSettingsModal,
  SubscriptionModal,
  AdminSubscriptionManagerModal,
} from '@/components/Modals';
import { ShieldCheck, Phone, Mail, Award, CheckCircle2, Flame, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('b2b_marketplace');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isAdminSubModalOpen, setIsAdminSubModalOpen] = useState(false);
  const [isUnifiedB2bModalOpen, setIsUnifiedB2bModalOpen] = useState(false);
  const [adminBypassFriday, setAdminBypassFriday] = useState(false);

  const isFriday = React.useMemo(() => {
    try {
      const algeriaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Algiers' }));
      return algeriaDate.getDay() === 5;
    } catch (e) {
      return new Date().getDay() === 5;
    }
  }, []);

  useEffect(() => {
    // 🇩🇿 Tahya El Djazair Console Branding
    console.log(
      '%c 🇩🇿 تحيا الجزائر 🇩🇿 \n %c بورصة الدواجن الجزائرية 🐔 ',
      'color: #047857; font-size: 38px; font-weight: 900; background: #fef08a; border: 4px solid #047857; padding: 12px 24px; border-radius: 16px; font-family: system-ui, sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); shadow: 0 10px 15px -3px rgba(0,0,0,0.1);',
      'color: #d97706; font-size: 16px; font-weight: 800; padding: 6px;'
    );

    const savedUser = localStorage.getItem('poultry_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.phone) {
          fetch(`/api/auth/me?phone=${encodeURIComponent(parsed.phone)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.status === 'success' && data.user) {
                setCurrentUser(data.user);
                localStorage.setItem('poultry_user', JSON.stringify(data.user));
              }
            })
            .catch((e) => console.error(e));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('poultry_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('poultry_user');
  };

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const TABS = ['prices', 'offers', 'jobs', 'directory'];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    const currentIndex = TABS.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  // Modals state
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOfferSellerType, setSelectedOfferSellerType] = useState<'farmer' | 'slaughterhouse' | 'broker'>('farmer');
  const [selectedWilayaForReport, setSelectedWilayaForReport] = useState<string>('16');

  // Data state
  const [pricesList, setPricesList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [offersList, setOffersList] = useState<any[]>([]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all endpoints in parallel
      const [resPrices, resReports, resJobs, resWorkers, resCompanies, resOffers] =
        await Promise.all([
          fetch('/api/prices').then((r) => r.json()),
          fetch('/api/reports').then((r) => r.json()),
          fetch('/api/jobs').then((r) => r.json()),
          fetch('/api/workers').then((r) => r.json()),
          fetch('/api/companies').then((r) => r.json()),
          fetch('/api/offers').then((r) => r.json()),
        ]);

      if (resPrices.status === 'success') {
        setPricesList(resPrices.officialPrices || resPrices.prices || []);
      }
      if (resReports.status === 'success') {
        setReportsList(resReports.reports || []);
      }
      if (resJobs.status === 'success') {
        setJobsList(resJobs.jobs || []);
      }
      if (resWorkers.status === 'success') {
        setWorkersList(resWorkers.workers || []);
      }
      if (resCompanies.status === 'success') {
        setCompaniesList(resCompanies.companies || []);
      }
      if (resOffers.status === 'success') {
        setOffersList(resOffers.offers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenReportModalForWilaya = (wilayaCode: string) => {
    setSelectedWilayaForReport(wilayaCode);
    setIsPriceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-['Cairo',sans-serif]">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPriceModal={() => {
          setSelectedWilayaForReport('16');
          setIsPriceModalOpen(true);
        }}
        onOpenJobModal={() => {
          if (!currentUser) setIsRegisterModalOpen(true);
          else setIsJobModalOpen(true);
        }}
        onOpenWorkerModal={() => {
          if (!currentUser) setIsRegisterModalOpen(true);
          else setIsWorkerModalOpen(true);
        }}
        onOpenCompanyModal={() => {
          if (!currentUser) setIsRegisterModalOpen(true);
          else setIsCompanyModalOpen(true);
        }}
        onOpenOfferModal={() => {
          if (!currentUser) {
            setIsRegisterModalOpen(true);
            return;
          }
          const defaultRole = currentUser.role === 'slaughterhouse' ? 'slaughterhouse' : currentUser.role === 'broker' ? 'broker' : 'farmer';
          setSelectedOfferSellerType(defaultRole);
          setIsOfferModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenAdminSubModal={() => setIsAdminSubModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container with Swipe Touch Handling */}
      <main
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-8 touch-pan-y"
      >
        {isFriday && !adminBypassFriday ? (
          <FridayHolidayScreen
            currentUser={currentUser}
            onAdminBypass={() => setAdminBypassFriday(true)}
          />
        ) : (
          <>
            {/* TAB 0: Unified Free B2B Marketplace (سوق B2B الشامل المجاني) */}
            {activeTab === 'b2b_marketplace' && (
              <UnifiedB2BMarketplace
                currentUser={currentUser}
                onOpenOfferModal={() => setIsUnifiedB2bModalOpen(true)}
              />
            )}

            {/* TAB 1: Algerian Wilaya Poultry Price Exchange */}
            {activeTab === 'prices' && (
              <WilayaPriceBoard
                pricesList={pricesList}
                isLoading={isLoading}
                onRefresh={fetchAllData}
                onReportForWilaya={handleOpenReportModalForWilaya}
                currentUser={currentUser}
                onOpenSubscribeModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsSubscribeModalOpen(true);
                }}
              />
            )}

            {/* TAB 2: Direct Market Offers (سوق العروض والطلبات المباشرة) */}
            {activeTab === 'offers' && (
              <MarketOffersBoard
                offersList={offersList}
                currentUser={currentUser}
                onOpenSubscribeModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsSubscribeModalOpen(true);
                }}
                onOpenOfferModal={(sellerType) => {
                  if (!currentUser) {
                    setIsRegisterModalOpen(true);
                    return;
                  }
                  setSelectedOfferSellerType(sellerType);
                  setIsOfferModalOpen(true);
                }}
              />
            )}

            {/* JOBS & RECRUITMENT TAB (مع مراعاة التوظيف والبحث عن عمال) */}
            {activeTab === 'jobs' && (
              <JobsAndWorkersBoard
                jobsList={jobsList}
                workersList={workersList}
                currentUser={currentUser}
                onOpenSubscribeModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsSubscribeModalOpen(true);
                }}
                onOpenJobModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsJobModalOpen(true);
                }}
                onOpenWorkerModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsWorkerModalOpen(true);
                }}
                onRefresh={fetchAllData}
              />
            )}

            {/* B2B COMPANIES DIRECTORY TAB */}
            {activeTab === 'directory' && (
              <B2BDirectory
                companiesList={companiesList}
                currentUser={currentUser}
                onOpenSubscribeModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsSubscribeModalOpen(true);
                }}
                onOpenCompanyModal={() => {
                  if (!currentUser) setIsRegisterModalOpen(true);
                  else setIsCompanyModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white mt-16 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label="chicken">
                  🐔
                </span>
                <h3 className="text-xl font-black">
                  دواجن الجزائر <span className="text-amber-400">B2B</span>
                </h3>
                <span className="text-base">🇩🇿</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                المنصة الرائدة في أسعار اللحوم البيضاء في كافة ولايات الجزائر، مع توفير شبكة توظيف متكاملة للعمال والبياطرة والمذابح.
              </p>
              <div className="text-xs text-amber-400 font-bold">
                ✔ تغطية شاملة لـ 58 ولاية جزائرية
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black text-amber-400 mb-3">
                روابط سريعة للمهنيين
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    onClick={() => setActiveTab('prices')}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    ← بورصة أسعار الدجاج (58 ولاية)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    ← سوق العروض والطلبات المباشرة (بيع وشراء)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    ← سوق التوظيف والبحث عن عمال
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    ← دليل المزارع والمذابح B2B
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-amber-400 mb-3">
                المصالح التجارية والبيطرية
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• أسواق البورصة والتجار والمربين الميدانيين</li>
                <li>• متابعة مؤشرات العرض والطلب في السوق</li>
                <li>• الخدمات البيطرية والسلامة الصحية للدواجن</li>
                <li>• تموين وتوريد الأعلاف والفلوس (الصوص)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-amber-400 mb-3">
                خدمة العملاء والدعم
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>دعم المنصة والتواصل التجاري المباشر</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  هدف المنصة هو توفير بيئة تجارية شفافة ومباشرة للمربين والمذابح والتجار.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              © {new Date().getFullYear()} دواجن الجزائر B2B - جميع الحقوق محفوظة لشبكة دواجن الجزائر B2B 🇩🇿
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-amber-400 underline transition-colors">
                سياسة الخصوصية
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-amber-400 underline transition-colors">
                شروط الخدمة
              </Link>
              <span>•</span>
              <span>58 ولاية</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <PriceReportModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('prices');
        }}
        defaultWilaya={selectedWilayaForReport}
      />

      <JobPostModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('jobs');
        }}
      />

      <WorkerRegisterModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('jobs');
        }}
      />

      <CompanyRegisterModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('directory');
        }}
      />

      <OfferPostModal
        isOpen={isOfferModalOpen}
        defaultOfferType={selectedOfferSellerType}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('prices');
        }}
      />

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(user) => handleLoginSuccess(user)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => handleLoginSuccess(user)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <AccountSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => handleLoginSuccess(updatedUser)}
      />

      <SubscriptionModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        currentUser={currentUser}
        onSuccess={(updatedUser) => handleLoginSuccess(updatedUser)}
      />

      <AdminSubscriptionManagerModal
        isOpen={isAdminSubModalOpen}
        onClose={() => setIsAdminSubModalOpen(false)}
        onRefresh={fetchAllData}
      />

      <UnifiedOfferModal
        isOpen={isUnifiedB2bModalOpen}
        onClose={() => setIsUnifiedB2bModalOpen(false)}
        onSuccess={() => {
          fetchAllData();
          setActiveTab('b2b_marketplace');
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
