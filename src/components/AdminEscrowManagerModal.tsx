'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
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
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

interface AdminEscrowManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AdminEscrowManagerModal({
  isOpen,
  onClose,
  onRefresh,
}: AdminEscrowManagerModalProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [editingAdminNotes, setEditingAdminNotes] = useState<{ [id: number]: string }>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchEscrowRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/b2b-escrow');
      const data = await res.json();
      if (data.status === 'success') {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Fetch escrow requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchEscrowRequests();
    }
  }, [isOpen, fetchEscrowRequests]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/b2b-escrow', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminNotes: editingAdminNotes[id],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: newStatus, adminNotes: editingAdminNotes[id] ?? req.adminNotes } : req
          )
        );
        if (onRefresh) onRefresh();
      } else {
        alert(data.message || 'فشل تحديث الحالة');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء التحديث');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveAdminNotes = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/b2b-escrow', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          adminNotes: editingAdminNotes[id],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('تم حفظ الملاحظات الإدارية بنجاح');
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, adminNotes: editingAdminNotes[id] } : req
          )
        );
      }
    } catch {
      alert('خطأ أثناء حفظ الملاحظات');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف طلب الوساطة رقم #${id} نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/b2b-escrow?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert('خطأ أثناء حذف الطلب');
    }
  };

  // WhatsApp contact helper
  const openWhatsApp = (phone: string, roleName: string, offerTitle: string, dealId: number) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('213')) cleanPhone = '213' + cleanPhone;

    const msg = encodeURIComponent(
      `مرحباً ${roleName}، نتواصل معك من إدارة منصة بورصة الجزائر بخصوص صفقة الوساطة الآمنة (#${dealId}) لمنتج "${offerTitle}".`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> قيد المراجعة والاتصال
          </span>
        );
      case 'payment_received':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> تم تأكيد دفع بريدي موب 💳
          </span>
        );
      case 'in_delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <Truck className="w-3.5 h-3.5 text-purple-600" /> جاري الشحن والمعاينة 🚚
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> مكتملة ومحولة للبائع ✅
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-1 rounded-xl text-xs font-black">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> ملغاة / مسترجعة ❌
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

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const totalHeldAmount = requests
    .filter((r) => r.status === 'payment_received' || r.status === 'in_delivery')
    .reduce((sum, r) => sum + (Number(r.agreedPrice) || 0), 0);

  const totalCompletedAmount = requests
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (Number(r.agreedPrice) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right font-sans my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                لوحة تحكم وسيط المنصة وصفقات بريدي موب 🛡️
                <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                  حساب المدير (Admin)
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                متابعة وتأمين صفقات الشراء، تأكيد وصول دفعات BaridiMob، وتنسيق الشحن بين البائع والمشتري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEscrowRequests}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="تحديث البيانات"
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

        {/* Stats Summary Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-bold block">إجمالي طلبات الوساطة:</span>
            <span className="text-lg font-black text-slate-900">{requests.length} طلب</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-blue-200 shadow-sm">
            <span className="text-blue-700 font-bold block">مبالغ بريدي موب المحجوزة حالياً:</span>
            <span className="text-lg font-black text-blue-800">{totalHeldAmount.toLocaleString()} د.ج</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm">
            <span className="text-emerald-700 font-bold block">إجمالي الصفقات المكتملة:</span>
            <span className="text-lg font-black text-emerald-800">{totalCompletedAmount.toLocaleString()} د.ج</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm">
            <span className="text-amber-700 font-bold block">قيد المراجعة والمتابعة:</span>
            <span className="text-lg font-black text-amber-800">
              {requests.filter((r) => r.status === 'pending').length} صفقات
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 ml-1">تصفية:</span>
          {[
            { id: 'all', label: `الكل (${requests.length})` },
            { id: 'pending', label: `⏳ قيد المراجعة (${requests.filter((r) => r.status === 'pending').length})` },
            { id: 'payment_received', label: `💳 تم الدفع (${requests.filter((r) => r.status === 'payment_received').length})` },
            { id: 'in_delivery', label: `🚚 جاري الشحن (${requests.filter((r) => r.status === 'in_delivery').length})` },
            { id: 'completed', label: `✅ مكتملة (${requests.filter((r) => r.status === 'completed').length})` },
            { id: 'cancelled', label: `❌ ملغاة (${requests.filter((r) => r.status === 'cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 text-slate-900">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-500 text-xs font-bold">جاري تحميل صفقات الوساطة...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">لا توجد طلبات وساطة في هذا القسم حالياً</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header of deal card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs bg-slate-900 text-white px-2.5 py-1 rounded-xl">
                      صفقة #{req.id}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 truncate">
                      {req.offerTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                </div>

                {/* Grid info: Buyer, Seller, Payment & Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* 1. Buyer Box */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>المشتري (صاحب الطلب):</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{req.buyerName}</div>
                    <div className="font-mono text-xs text-slate-600 dir-ltr text-right">{req.buyerPhone}</div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => openWhatsApp(req.buyerPhone, req.buyerName, req.offerTitle, req.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>واتساب المشتري</span>
                      </button>
                      <a
                        href={`tel:${req.buyerPhone}`}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title="اتصال"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* 2. Seller Box */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>البائع (صاحب الإعلان):</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{req.sellerName}</div>
                    <div className="font-mono text-xs text-slate-600 dir-ltr text-right">{req.sellerPhone}</div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => openWhatsApp(req.sellerPhone, req.sellerName, req.offerTitle, req.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>واتساب البائع</span>
                      </button>
                      <a
                        href={`tel:${req.sellerPhone}`}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title="اتصال"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* 3. BaridiMob Payment & Price Details */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="font-black text-slate-700 flex items-center gap-1 mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>المبلغ المتفق عليه:</span>
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        {req.agreedPrice ? Number(req.agreedPrice).toLocaleString() : 'غير محدد'} د.ج
                      </div>

                      {req.transactionRef && (
                        <div className="mt-1 text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                          رقم الحوالة: <strong>{req.transactionRef}</strong>
                        </div>
                      )}
                    </div>

                    {req.paymentReceipt && (
                      <button
                        onClick={() => setSelectedReceiptImage(req.paymentReceipt)}
                        className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>معاينة وصل بريدي موب 📸</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes from Buyer */}
                {req.notes && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 block mb-0.5">ملاحظات وشروط المشتري:</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">{req.notes}</p>
                  </div>
                )}

                {/* Admin Private Notes & Action Bar */}
                <div className="p-3.5 bg-slate-900 rounded-2xl text-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                      <span>⚙️ التحكم في حالة الصفقة:</span>
                    </span>

                    <button
                      onClick={() => handleDelete(req.id)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 mr-auto transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف الصفقة</span>
                    </button>
                  </div>

                  {/* Status Buttons Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={updatingId === req.id || req.status === 'pending'}
                      onClick={() => handleUpdateStatus(req.id, 'pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        req.status === 'pending'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      ⏳ قيد المراجعة
                    </button>

                    <button
                      disabled={updatingId === req.id || req.status === 'payment_received'}
                      onClick={() => handleUpdateStatus(req.id, 'payment_received')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        req.status === 'payment_received'
                          ? 'bg-blue-500 text-white font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      💳 تأكيد دفع بريدي موب
                    </button>

                    <button
                      disabled={updatingId === req.id || req.status === 'in_delivery'}
                      onClick={() => handleUpdateStatus(req.id, 'in_delivery')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        req.status === 'in_delivery'
                          ? 'bg-purple-500 text-white font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      🚚 جاري الشحن والفحص
                    </button>

                    <button
                      disabled={updatingId === req.id || req.status === 'completed'}
                      onClick={() => handleUpdateStatus(req.id, 'completed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        req.status === 'completed'
                          ? 'bg-emerald-500 text-white font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      ✅ مكتملة (تم التحويل للبائع)
                    </button>

                    <button
                      disabled={updatingId === req.id || req.status === 'cancelled'}
                      onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        req.status === 'cancelled'
                          ? 'bg-red-500 text-white font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      ❌ إلغاء واسترجاع
                    </button>
                  </div>

                  {/* Admin Notes Box */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={
                        editingAdminNotes[req.id] !== undefined
                          ? editingAdminNotes[req.id]
                          : req.adminNotes || ''
                      }
                      onChange={(e) =>
                        setEditingAdminNotes((prev) => ({
                          ...prev,
                          [req.id]: e.target.value,
                        }))
                      }
                      placeholder="ملاحظات المدير الداخلية (سجل المكالمة، رقم الحساب، موعد المعاينة...)"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => handleSaveAdminNotes(req.id)}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                    >
                      حفظ الملاحظة
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reçu BaridiMob Zoom Modal */}
      {selectedReceiptImage && (
        <div
          onClick={() => setSelectedReceiptImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2 text-center">
            <button
              onClick={() => setSelectedReceiptImage(null)}
              className="absolute top-4 left-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedReceiptImage}
              alt="وصل تحويل بريدي موب"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
            <p className="text-white text-xs font-bold mt-2">وصل تحويل بريدي موب المرفق من المشتري</p>
          </div>
        </div>
      )}
    </div>
  );
}
