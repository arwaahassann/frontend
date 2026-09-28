import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, AlertCircle, Trash2, Eye, X, MapPin, Building2, Briefcase, CalendarDays, CircleDollarSign, GraduationCap, Clock3, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminJobs, getAdminJobDetails, updateAdminJobStatus, deleteAdminJob } from '../../api/admin';

const AdminJobs = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all'); // all | reviewing | active | rejected
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [cursorByPage, setCursorByPage] = useState({ 1: null });
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);
  const [detailsJob, setDetailsJob] = useState(null);
  const [rejectionJob, setRejectionJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const fetchRequestId = useRef(0);

  const fetchJobs = useCallback(async () => {
    const requestId = ++fetchRequestId.current;
    try {
      setLoading(true);
      setError('');
      const params = {
        limit: 8,
        cursor: cursorByPage[page] || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearchTerm,
      };
      const res = await getAdminJobs(params);
      if (requestId === fetchRequestId.current && res.success) {
        setJobs(res.jobs);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore === true);
      }
    } catch (err) {
      if (requestId === fetchRequestId.current) {
        setError(err.response?.data?.message || 'حدث خطأ في تحميل بيانات الوظائف');
      }
    } finally {
      if (requestId === fetchRequestId.current) setLoading(false);
    }
  }, [page, cursorByPage, statusFilter, appliedSearchTerm]);

  useEffect(() => {
    setStatusFilter(searchParams.get('status') || 'all');
    setSearchTerm(searchParams.get('search') || '');
    setAppliedSearchTerm(searchParams.get('search') || '');
    setPage(1);
    setCursorByPage({ 1: null });
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
    return () => {
      fetchRequestId.current += 1;
    };
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setCursorByPage({ 1: null });
    setAppliedSearchTerm(searchTerm);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    setCursorByPage({ 1: null });
  };

  const handleOpenDetails = async (job) => {
    setDetailsLoadingId(job._id);
    setError('');
    try {
      const res = await getAdminJobDetails(job._id);
      if (res.success) setDetailsJob(res.job);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تحميل تفاصيل الوظيفة');
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setCursorByPage((current) => ({ ...current, [page + 1]: nextCursor }));
    setPage((current) => current + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage((current) => current - 1);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setUpdatingId(jobId);
      const res = await updateAdminJobStatus(
        jobId,
        newStatus,
        newStatus === 'rejected' ? rejectionReason : undefined
      );
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
        if (detailsJob?._id === jobId) setDetailsJob(null);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر تحديث حالة الوظيفة');
    } finally {
      setUpdatingId(null);
    }
    return false;
  };

  const openRejectionDialog = (job) => {
    setRejectionReason('');
    setRejectionJob(job);
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    if (!rejectionJob) return;
    const updated = await handleStatusChange(rejectionJob._id, 'rejected');
    if (updated) {
      setRejectionJob(null);
      setRejectionReason('');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوظيفة وكافة بياناتها نهائياً من المنصة؟')) return;
    try {
      setUpdatingId(jobId);
      const res = await deleteAdminJob(jobId);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف الوظيفة');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#86efac] text-[#15803d]">نشطه</span>;
    }
    if (status === 'reviewing') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fef08a] text-[#a16207]">قيد المراجعه</span>;
    }
    if (status === 'deletion_pending') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">طلب حذف</span>;
    }
    if (status === 'closed') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">مغلقة</span>;
    }
    return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fca5a5] text-[#b91c1c]">مرفوضه</span>;
  };

  const formatJobDate = (date) => (
    date ? new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">اداره الوظائف</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">اداره ومراجعه جميع الوظائف والموافقة على التعديلات والحذف</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center justify-start gap-8 border-b border-slate-200">
        <button
          onClick={() => handleStatusFilterChange('all')}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'all'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => handleStatusFilterChange('reviewing')}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'reviewing'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          قيد المراجعه
        </button>
        <button
          onClick={() => handleStatusFilterChange('deletion_pending')}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'deletion_pending'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          طلبات الحذف
        </button>
        <button
          onClick={() => handleStatusFilterChange('active')}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'active'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          نشطه
        </button>
        <button
          onClick={() => handleStatusFilterChange('rejected')}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'rejected'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          مرفوضه
        </button>
      </div>

      {/* ── Search Input ── */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن وظيفه"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/30 focus:border-[#00D2B4] transition text-center font-medium shadow-sm"
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

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#EAEAEA] text-slate-700 text-sm font-bold border-b border-slate-200">
                <th className="py-4 px-6">الوظيفه</th>
                <th className="py-4 px-6 text-center">الشركه</th>
                <th className="py-4 px-6 text-center">تاريخ التسجيل</th>
                <th className="py-4 px-6 text-center">الحاله</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00D2B4]" />
                    <span>جاري تحميل قائمة الوظائف...</span>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    لا توجد وظائف مسجلة في هذا القسم
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/80 transition">
                    {/* الوظيفه */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-slate-800 block">{j.title}</span>
                        <span className="text-xs text-slate-400">{j.location} • {j.jobType}</span>
                      </div>
                    </td>

                    {/* الشركه */}
                    <td className="py-4 px-6 text-center text-slate-700">
                      {j.company || j.postedBy?.company || 'رووت'}
                    </td>

                    {/* تاريخ التسجيل */}
                    <td className="py-4 px-6 text-center text-slate-600 font-normal dir-ltr">
                      {new Date(j.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    {/* الحاله */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(j.status)}
                    </td>

                    {/* الإجراءات */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(j)}
                          disabled={detailsLoadingId === j._id}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                          aria-label={`عرض تفاصيل إعلان ${j.title}`}
                        >
                          {detailsLoadingId === j._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>تفاصيل</span>
                        </button>
                        {/* حالة طلب الحذف */}
                        {j.status === 'deletion_pending' ? (
                          <>
                            <button
                              onClick={() => handleDeleteJob(j._id)}
                              disabled={updatingId === j._id}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition text-xs font-bold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                              title="الموافقة على حذف الوظيفة نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>موافقة على الحذف</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(j._id, 'active')}
                              disabled={updatingId === j._id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-xs font-bold disabled:opacity-50"
                              title="رفض طلب الحذف وإبقاء الوظيفة نشطة"
                            >
                              رفض الحذف
                            </button>
                          </>
                        ) : (
                          <>
                            {/* اعتماد الوظيفة */}
                            {j.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(j._id, 'active')}
                                disabled={updatingId === j._id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition text-xs font-bold disabled:opacity-50"
                                title="الموافقة على الوظيفة وتفعيلها"
                              >
                                اعتماد
                              </button>
                            )}

                            {/* رفض الوظيفة */}
                            {j.status === 'reviewing' && (
                              <button
                                onClick={() => openRejectionDialog(j)}
                                disabled={updatingId === j._id}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-xs font-bold disabled:opacity-50"
                                title="رفض الوظيفة"
                              >
                                رفض
                              </button>
                            )}

                            {/* إغلاق الوظيفة النشطة */}
                            {j.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(j._id, 'closed')}
                                disabled={updatingId === j._id}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-xs font-bold disabled:opacity-50"
                              >
                                إغلاق
                              </button>
                            )}

                            {/* زر حذف المشرف العام */}
                            <button
                              onClick={() => handleDeleteJob(j._id)}
                              disabled={updatingId === j._id}
                              className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-bold disabled:opacity-50"
                              title="حذف الوظيفة نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectionJob && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && updatingId !== rejectionJob._id) {
              setRejectionJob(null);
            }
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-rejection-title"
            dir="rtl"
            onSubmit={handleRejectSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="job-rejection-title" className="text-xl font-black text-slate-800">
              رفض إعلان {rejectionJob.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              اكتبي سبب الرفض ليصل لصاحب الشركة، أو اتركيه فارغًا لإبلاغه بأنه لم يتم توضيح السبب.
            </p>
            <label htmlFor="job-rejection-reason" className="mt-5 block text-sm font-bold text-slate-700">
              سبب الرفض (اختياري)
            </label>
            <textarea
              id="job-rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              maxLength={500}
              rows={5}
              placeholder="اكتبي سبب رفض الإعلان..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">{rejectionReason.length}/500</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionJob(null)}
                  disabled={updatingId === rejectionJob._id}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updatingId === rejectionJob._id}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {updatingId === rejectionJob._id ? 'جارٍ الإرسال...' : 'تأكيد الرفض وإرسال الإشعار'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {detailsJob && (
        <div
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setDetailsJob(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-job-details-title"
            dir="rtl"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div>
                <p className="mb-1 text-sm font-bold text-[#00a990]">مراجعة إعلان الوظيفة</p>
                <h2 id="admin-job-details-title" className="text-xl font-black text-slate-800 md:text-2xl">{detailsJob.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{detailsJob.company || detailsJob.postedBy?.company || 'اسم الشركة غير متوفر'}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsJob(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="إغلاق تفاصيل الإعلان"
              >
                <X size={21} />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">
              <div className="mb-6 flex flex-wrap gap-2">
                {getStatusBadge(detailsJob.status)}
                {[detailsJob.category, detailsJob.level, detailsJob.jobType].filter(Boolean).map(label => (
                  <span key={label} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{label}</span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'مكان العمل', value: detailsJob.location, icon: MapPin },
                  { label: 'نوع الوظيفة', value: detailsJob.jobType, icon: Briefcase },
                  { label: 'الراتب', value: detailsJob.salary, icon: CircleDollarSign },
                  { label: 'سنوات الخبرة', value: detailsJob.experience, icon: Clock3 },
                  { label: 'المؤهل المطلوب', value: detailsJob.degree || detailsJob.qualifications, icon: GraduationCap },
                  { label: 'موعد انتهاء التقديم', value: formatJobDate(detailsJob.closingDate), icon: CalendarDays },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Icon size={15} className="text-[#00a990]" /> {label}
                    </div>
                    <p className="m-0 text-sm font-bold leading-6 text-slate-800">{value || 'غير محدد'}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                <section>
                  <h3 className="mb-2 text-base font-black text-slate-800">وصف الإعلان والمهام</h3>
                  <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{detailsJob.description || 'لا يوجد وصف مضاف.'}</p>
                </section>

                <section>
                  <h3 className="mb-2 text-base font-black text-slate-800">متطلبات الوظيفة</h3>
                  {Array.isArray(detailsJob.requirements) && detailsJob.requirements.length > 0 ? (
                    <ul className="list-inside list-disc space-y-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {detailsJob.requirements.map((requirement, index) => <li key={`${index}-${requirement}`}>{requirement}</li>)}
                    </ul>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">لا توجد متطلبات مضافة.</p>
                  )}
                </section>

                {detailsJob.qualifications && detailsJob.degree && detailsJob.qualifications !== detailsJob.degree && (
                  <section>
                    <h3 className="mb-2 text-base font-black text-slate-800">المؤهلات والخبرات</h3>
                    <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{detailsJob.qualifications}</p>
                  </section>
                )}

                <section className="rounded-xl border border-slate-200 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-800">
                    <Building2 size={18} className="text-[#00a990]" /> بيانات الشركة وصاحب الإعلان
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">الشركة:</strong> {detailsJob.company || detailsJob.postedBy?.company || 'غير محدد'}</p>
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">مسؤول التواصل:</strong> {detailsJob.postedBy?.name || 'غير متوفر'}</p>
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">البريد الإلكتروني:</strong> {detailsJob.postedBy?.email || 'غير متوفر'}</p>
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">رقم التواصل الأساسي للشركة:</strong> {detailsJob.postedBy?.phone || 'غير متوفر'}</p>
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">مجال الشركة:</strong> {detailsJob.postedBy?.companyIndustry || 'غير محدد'}</p>
                    <p className="m-0 text-slate-600"><strong className="text-slate-800">تاريخ نشر الإعلان:</strong> {formatJobDate(detailsJob.createdAt)}</p>
                  </div>
                </section>
              </div>
            </div>

            {detailsJob.status === 'reviewing' && (
              <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  disabled={updatingId === detailsJob._id}
                  onClick={() => openRejectionDialog(detailsJob)}
                  className="rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  رفض الإعلان
                </button>
                <button
                  type="button"
                  disabled={updatingId === detailsJob._id}
                  onClick={() => handleStatusChange(detailsJob._id, 'active')}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updatingId === detailsJob._id ? 'جاري الاعتماد...' : 'اعتماد الإعلان'}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-3 mt-6" dir="rtl">
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" /> السابق
          </button>
          <span className="px-3 py-1 text-sm font-bold text-slate-600">الصفحة {page}</span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            التالي <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {jobs.length > 0 && (
          <div className="mt-2 px-4 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
            {jobs.length} وظيفة في هذه الصفحة
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
