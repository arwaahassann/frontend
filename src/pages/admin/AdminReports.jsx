import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, AlertCircle, CheckCircle, Clock, ShieldAlert, MessageSquareWarning, Lightbulb, XCircle } from 'lucide-react';
import { getAdminReports, updateAdminReportStatus } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';

const AdminReports = () => {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState(() => (
    ['complaint', 'suggestion'].includes(searchParams.get('type'))
      ? searchParams.get('type')
      : 'complaint'
  ));
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    complaintCount: 0,
    suggestionCount: 0,
    complaintOpenCount: 0,
    complaintResolvedCount: 0,
    complaintRejectedCount: 0,
    suggestionOpenCount: 0,
    suggestionResolvedCount: 0,
    suggestionRejectedCount: 0,
  });
  const [updatingId, setUpdatingId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const reportsListRef = useRef(null);

  const focusReports = (nextStatus) => {
    setStatusFilter(nextStatus);
    setPage(1);
    requestAnimationFrame(() => {
      reportsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const selectReportType = (nextType) => {
    setTypeFilter(nextType);
    setStatusFilter('all');
    setPage(1);
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminReports({
        page,
        limit: 8,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: appliedSearchTerm,
      });
      if (res.success) {
        setReports(res.reports);
        setTotalPages(res.pages);
        setStats({
          complaintCount: 0,
          suggestionCount: 0,
          complaintOpenCount: 0,
          complaintResolvedCount: 0,
          complaintRejectedCount: 0,
          suggestionOpenCount: 0,
          suggestionResolvedCount: 0,
          suggestionRejectedCount: 0,
          ...res.stats,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل الشكاوي والمقترحات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, appliedSearchTerm]);

  useEffect(() => {
    setStatusFilter(searchParams.get('status') || 'all');
    const requestedType = searchParams.get('type');
    setTypeFilter(['complaint', 'suggestion'].includes(requestedType) ? requestedType : 'complaint');
    setSearchTerm(searchParams.get('search') || '');
    setAppliedSearchTerm(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const handleUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await updateAdminReportStatus(id, {
        status,
        adminReply: replyDrafts[id] || '',
      });
      if (res.success) {
        setReports((prev) => prev.map((r) => (r._id === id ? { ...r, ...res.report } : r)));
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر تحديث البلاغ');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'resolved') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#86efac] text-[#15803d]">تم الحل</span>;
    }
    if (status === 'reviewing') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">قيد المراجعة</span>;
    }
    if (status === 'rejected') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fca5a5] text-[#b91c1c]">مغلقة</span>;
    }
    return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fef08a] text-[#a16207]">جديدة</span>;
  };

  const activeTypeStats = typeFilter === 'complaint'
    ? {
        total: stats.complaintCount,
        open: stats.complaintOpenCount,
        resolved: stats.complaintResolvedCount,
        rejected: stats.complaintRejectedCount,
      }
    : {
        total: stats.suggestionCount,
        open: stats.suggestionOpenCount,
        resolved: stats.suggestionResolvedCount,
        rejected: stats.suggestionRejectedCount,
      };
  const activeTypeLabel = typeFilter === 'complaint' ? 'الشكاوى' : 'المقترحات';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">الشكاوي والمقترحات</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">متابعة بلاغات المستخدمين والرد عليها من لوحة المشرف</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => selectReportType('complaint')}
          aria-pressed={typeFilter === 'complaint'}
          className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 text-right transition cursor-pointer ${
            typeFilter === 'complaint'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-100'
              : 'bg-white border-slate-200 hover:border-rose-200 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-base font-black text-slate-800 block">الشكاوى</span>
            <span className="text-xs font-bold text-slate-500">متابعة الشكاوى والرد عليها</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {stats.complaintCount}
          </div>
        </button>
        <button
          type="button"
          onClick={() => selectReportType('suggestion')}
          aria-pressed={typeFilter === 'suggestion'}
          className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 text-right transition cursor-pointer ${
            typeFilter === 'suggestion'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-100'
              : 'bg-white border-slate-200 hover:border-teal-200 hover:shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-base font-black text-slate-800 block">المقترحات</span>
            <span className="text-xs font-bold text-slate-500">مراجعة أفكار ومقترحات المستخدمين</span>
          </div>
          <div className="text-2xl font-black text-slate-800">
            {stats.suggestionCount}
          </div>
        </button>
      </div>

      <section aria-label={`إحصائيات ${activeTypeLabel}`} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-800">{activeTypeLabel}</h2>
          <span className="text-sm font-bold text-slate-500">الإجمالي: {activeTypeStats.total}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => focusReports('all')}
            aria-label={`عرض كل ${activeTypeLabel}: ${activeTypeStats.total}`}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-right hover:border-blue-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">الإجمالي</span>
              <span className="text-xl font-black text-slate-800">{activeTypeStats.total}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => focusReports('open')}
            aria-label={`عرض ${activeTypeLabel} قيد المتابعة: ${activeTypeStats.open}`}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-right hover:border-amber-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">قيد المتابعة</span>
              <span className="text-xl font-black text-slate-800">{activeTypeStats.open}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => focusReports('resolved')}
            aria-label={`عرض ${activeTypeLabel} التي تم حلها: ${activeTypeStats.resolved}`}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-right hover:border-emerald-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">تم الحل</span>
              <span className="text-xl font-black text-slate-800">{activeTypeStats.resolved}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => focusReports('rejected')}
            aria-label={`عرض ${activeTypeLabel} المغلقة: ${activeTypeStats.rejected}`}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-right hover:border-red-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">مغلقة</span>
              <span className="text-xl font-black text-slate-800">{activeTypeStats.rejected}</span>
            </div>
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-start gap-6 border-b border-slate-200">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'open', label: 'قيد المتابعة' },
          { id: 'reviewing', label: 'قيد المراجعة' },
          { id: 'resolved', label: 'تم الحل' },
          { id: 'rejected', label: 'مغلقة' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => focusReports(st.id)}
            className={`pb-3 text-base font-bold transition border-b-2 ${
              statusFilter === st.id
                ? 'border-[#00D2B4] text-[#00D2B4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث في العنوان أو التفاصيل"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/30 focus:border-[#00D2B4] font-medium shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div ref={reportsListRef} className="scroll-mt-6 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00D2B4]" />
            جاري التحميل...
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">لا توجد {activeTypeLabel} في هذا القسم</h3>
            <p className="text-sm text-slate-400 mt-1">ستظهر هنا فور إرسال المستخدمين {typeFilter === 'complaint' ? 'شكاواهم' : 'مقترحاتهم'}.</p>
          </div>
        ) : (
          reports.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-[#0f766e]">
                      {r.type === 'suggestion' ? 'مقترح' : 'شكوى'}
                    </span>
                    {getStatusBadge(r.status)}
                  </div>
                  <h3 className="text-base font-black text-slate-800">{r.subject}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {r.user?.name || 'مستخدم'} • {r.user?.email || ''} • {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-7">{r.message}</p>
              {r.relatedJob?.title && (
                <p className="text-xs font-bold text-slate-500">مرتبطة بوظيفة: {r.relatedJob.title}</p>
              )}
              <textarea
                placeholder="اكتب رد الإدارة هنا (اختياري)"
                value={replyDrafts[r._id] ?? r.adminReply ?? ''}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r._id]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium"
                rows={2}
              />
              <div className="flex items-center gap-2 flex-wrap">
                {r.status !== 'reviewing' && (
                  <button
                    onClick={() => handleUpdate(r._id, 'reviewing')}
                    disabled={updatingId === r._id}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold disabled:opacity-50"
                  >
                    بدء المراجعة
                  </button>
                )}
                {r.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdate(r._id, 'resolved')}
                    disabled={updatingId === r._id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold disabled:opacity-50"
                  >
                    تم الحل
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdate(r._id, 'rejected')}
                    disabled={updatingId === r._id}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold disabled:opacity-50"
                  >
                    إغلاق
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AdminReports;
