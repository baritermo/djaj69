'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  X,
  RefreshCw,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  User,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Store,
  DollarSign,
  AlertCircle,
  LogIn,
} from 'lucide-react';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onOpenLoginModal?: () => void;
}

export default function UserOrdersModal({
  isOpen,
  onClose,
  currentUser,
  onOpenLoginModal,
}: UserOrdersModalProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualPhone, setManualPhone] = useState(currentUser?.phone || '');

  const userPhone = currentUser?.phone || manualPhone;

  const fetchUserOrders = useCallback(async () => {
    if (!userPhone || !userPhone.trim()) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/b2b-escrow?phone=${encodeURIComponent(userPhone.trim())}`);
      const data = await res.json();
      if (data.status === 'success') {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Fetch user orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [userPhone]);

  useEffect(() => {
    if (isOpen) {
      if (currentUser?.phone) {
        setManualPhone(currentUser.phone);
      }
      fetchUserOrders();
    }
  }, [isOpen, currentUser, fetchUserOrders]);

  if (!isOpen) return null;

  // Filter requests where current user is the SELLER (الطلبات الواردة التي تلقاها)
  const receivedOrders = requests.filter((r) => {
    if (!userPhone) return false;
    const cleanUserPhone = userPhone.replace(/\D/g, '').slice(-8);
    const cleanSellerPhone = (r.sellerPhone || '').replace(/\D/g, '');
    return cleanSellerPhone.includes(cleanUserPhone);
  });

  // Filter requests where current user is the BUYER (الطلبات الصادرة التي أرسلها)
  const sentOrders = requests.filter((r) => {
    if (!userPhone) return false;
    const cleanUserPhone = userPhone.replace(/\D/g, '').slice(-8);
    const cleanBuyerPhone = (r.buyerPhone || '').replace(/\D/g, '');
    return cleanBuyerPhone.includes(cleanUserPhone);
  });

  const displayedOrders = activeTab === 'received' ? receivedOrders : sentOrders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> قيد المراجعة وتواصل الوسيط
          </span>
        );
      case 'payment_received':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> تم تأكيد دفع بريدي موب وتجميد المبلغ 💳
          </span>
        );
      case 'in_delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <Truck className="w-3.5 h-3.5 text-purple-600" /> جاري الشحن والفحص والمعاينة 🚚
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> مكتملة ومحولة للبائع بنجاح ✅
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> ملغاة ومسترجعة ❌
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const openWhatsApp = (phone: string, targetName: string, offerTitle: string, dealId: number) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('213')) cleanPhone = '213' + cleanPhone;

    const msg = encodeURIComponent(
      `مرحباً ${targetName}، أتواصل معك بخصوص صفقة الشراء (#${dealId}) لـ "${offerTitle}" عبر وسيط منصة بورصة الجزائر.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right font-sans my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                طلباتي وصفقات الوساطة 📦
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  دفع بريدي موب 🇩🇿
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                متابعة الطلبات التي تلقيتها على إعلاناتك وصفقات الشراء الخاصة بك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserOrders}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="تحديث الطلبات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User identification or Manual Phone Lookup if not logged in */}
        {!currentUser && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>أدخل رقم هاتفك لاستعراض طلباتك، أو سجل الدخول لحسابك:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="tel"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="06XX XX XX XX"
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold dir-ltr text-right flex-1 sm:w-44"
              />
              <button
                onClick={fetchUserOrders}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shrink-0 cursor-pointer"
              >
                بحث
              </button>
              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>دخول</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher: Received (الواردة كبائع) vs Sent (الصادرة كمشتري) */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'received'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-amber-300" />
              <span>الطلبات الواردة (كبائع)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'received' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {receivedOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'sent'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-blue-200" />
              <span>طلباتي الصادرة (كمشتري)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'sent' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {sentOrders.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>وساطة آمنة ومضمونة 100%</span>
          </div>
        </div>

        {/* Orders List Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 text-slate-900">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-500 text-xs font-bold">جاري تحميل طلباتك...</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <Package className="w-14 h-14 mx-auto text-slate-300" />
              <h3 className="text-sm font-black text-slate-800">
                {activeTab === 'received'
                  ? 'لا توجد طلبات شراء واردة على إعلاناتك حتى الآن'
                  : 'لم تقم بتقديم أي طلبات شراء عبر الوسيط حتى الآن'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'received'
                  ? 'عندما يطلب مشترٍ شراء أحد منتجاتك أو إعلاناتك عبر وسيط المنصة، ستظهر كل التفاصيل وحالة الدفع هنا فوراً.'
                  : 'يمكنك تصفح السوق والضغط على "طلب شراء عبر وسيط المنصة" لضمان أموالك وفحص السلعة قبل الدفع.'}
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isSeller = activeTab === 'received';
              const otherPartyName = isSeller ? order.buyerName : order.sellerName;
              const otherPartyPhone = isSeller ? order.buyerPhone : order.sellerPhone;
              const otherPartyRole = isSeller ? 'المشتري' : 'البائع';

              return (
                <div
                  key={order.id}
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-md transition space-y-3"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs bg-slate-900 text-white px-2.5 py-1 rounded-xl">
                        طلب #{order.id}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 truncate">
                        {order.offerTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Other Party Info */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1.5">
                      <span className="text-slate-500 font-bold block">
                        طرف المعاملة ({otherPartyRole}):
                      </span>
                      <div className="font-black text-slate-900 text-sm">{otherPartyName}</div>
                      <div className="font-mono text-slate-600 dir-ltr text-right">{otherPartyPhone}</div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => openWhatsApp(otherPartyPhone, otherPartyName, order.offerTitle, order.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>تواصل واتساب</span>
                        </button>
                        <a
                          href={`tel:${otherPartyPhone}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition cursor-pointer"
                          title="اتصال"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Price & BaridiMob Info */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-500 font-bold block">المبلغ المتفق عليه:</span>
                        <div className="text-base font-black text-emerald-700">
                          {order.agreedPrice ? Number(order.agreedPrice).toLocaleString() : 'قابل للتفاوض'}{' '}
                          <span className="text-xs font-bold text-slate-600">د.ج</span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-700">
                        🛡️ طريقة الحماية: <strong>وسيط المنصة (بريدي موب)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Notes from Buyer */}
                  {order.notes && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-500 block mb-0.5">شروط وملاحظات المشتري:</span>
                      <p className="text-slate-800 font-medium">{order.notes}</p>
                    </div>
                  )}

                  {/* Status explanation card */}
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 text-[11px] text-emerald-950 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      {order.status === 'pending' && 'الطلب مسجل لدى وسيط المنصة، وسيتواصل معكم ممثل البورصة لتأكيد إيداع المبلغ عبر بريدي موب.'}
                      {order.status === 'payment_received' && 'تم إيداع وتجميد المبلغ بأمان في حساب المنصة. يمكن الآن البدء في تجهيز وشحن السلعة.'}
                      {order.status === 'in_delivery' && 'السلعة في مرحلة النقل والمعاينة من طرف المشتري قبل الإفراج عن المبلغ.'}
                      {order.status === 'completed' && 'تمت المعاينة بنجاح وتحويل المبلغ للبائع عبر بريدي موب.'}
                      {order.status === 'cancelled' && 'تم إلغاء هذه الصفقة واسترجاع المبلغ للمشتري.'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
