import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, AlertCircle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { getAdminReports, updateAdminReportStatus } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';

const AdminReports = () => {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ pendingCount: 0, reviewingCount: 0, resolvedCount: 0 });
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
        setTotalCount(res.total);
        setStats(res.stats || { pendingCount: 0, reviewingCount: 0, resolvedCount: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل الشكاوي والمقترحات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, appliedSearchTerm]);

  useEffect(() => {
    setStatusFilter(searchParams.get('status') || 'all');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">الشكاوي والمقترحات</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">متابعة بلاغات المستخدمين والرد عليها من لوحة المشرف</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <button
          type="button"
          onClick={() => focusReports('open')}
          aria-label={`عرض البلاغات قيد المتابعة: ${stats.pendingCount || 0}`}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-right hover:border-amber-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">قيد المتابعة</span>
            <span className="text-2xl font-black text-slate-800">{stats.pendingCount || 0}</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => focusReports('resolved')}
          aria-label={`عرض البلاغات التي تم حلها: ${stats.resolvedCount || 0}`}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-right hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">تم حلها</span>
            <span className="text-2xl font-black text-slate-800">{stats.resolvedCount || 0}</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => focusReports('all')}
          aria-label={`عرض كل الرسائل: ${totalCount || 0}`}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 text-right hover:border-blue-300 hover:shadow-md transition cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي الرسائل</span>
            <span className="text-2xl font-black text-slate-800">{totalCount || 0}</span>
          </div>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-6 border-b border-slate-200">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'open', label: 'قيد المتابعة' },
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setTypeFilter('all'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold border ${typeFilter === 'all' ? 'bg-[#00D2B4] text-white border-[#00D2B4]' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          الكل
        </button>
        <button
          onClick={() => { setTypeFilter('complaint'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold border ${typeFilter === 'complaint' ? 'bg-[#00D2B4] text-white border-[#00D2B4]' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          شكاوى
        </button>
        <button
          onClick={() => { setTypeFilter('suggestion'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold border ${typeFilter === 'suggestion' ? 'bg-[#00D2B4] text-white border-[#00D2B4]' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          مقترحات
        </button>
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
            <h3 className="text-lg font-bold text-slate-700">لا توجد شكاوى أو مقترحات في هذا القسم</h3>
            <p className="text-sm text-slate-400 mt-1">ستظهر هنا فور إرسال المستخدمين رسائلهم من صفحة الشكاوي والمقترحات.</p>
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
