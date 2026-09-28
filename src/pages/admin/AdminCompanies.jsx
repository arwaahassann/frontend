import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, AlertCircle, Eye, X, Building2, UserRound, Mail, Phone, MapPin, Globe, BriefcaseBusiness, CalendarDays } from 'lucide-react';
import { getAdminCompanies, updateAdminCompanyStatus } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';
import ProfileImage from '../../components/ProfileImage';

const AdminCompanies = () => {
  const [searchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all'); // all | reviewing | active | suspended
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [detailsCompany, setDetailsCompany] = useState(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 8,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearchTerm,
      };
      const res = await getAdminCompanies(params);
      if (res.success) {
        setCompanies(res.companies);
        setTotalPages(res.pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل بيانات الشركات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, appliedSearchTerm]);

  useEffect(() => {
    setStatusFilter(searchParams.get('status') || 'all');
    setSearchTerm(searchParams.get('search') || '');
    setAppliedSearchTerm(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      setUpdatingId(companyId);
      const res = await updateAdminCompanyStatus(companyId, newStatus);
      if (res.success) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === companyId ? { ...c, accountStatus: newStatus } : c))
        );
        if (detailsCompany?._id === companyId) setDetailsCompany(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر تحديث حالة الشركة');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#86efac] text-[#15803d]">مقبوله</span>;
    }
    if (status === 'reviewing') {
      return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fef08a] text-[#a16207]">قيد المراجعه</span>;
    }
    return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fca5a5] text-[#b91c1c]">مرفوضه</span>;
  };

  const formatCompanyDate = (date) => (
    date ? new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">اداره الشركه</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">اداره ومراجعه الشركات المسجله</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center justify-start gap-8 border-b border-slate-200">
        <button
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'all'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => { setStatusFilter('reviewing'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'reviewing'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          قيد المراجعه
        </button>
        <button
          onClick={() => { setStatusFilter('active'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'active'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          معتمده
        </button>
        <button
          onClick={() => { setStatusFilter('suspended'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            statusFilter === 'suspended'
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
            placeholder="ابحث عن شركه"
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
                <th className="py-4 px-6">الشركه</th>
                <th className="py-4 px-6 text-center">البريد الالكتروني</th>
                <th className="py-4 px-6 text-center">رقم التواصل الأساسي</th>
                <th className="py-4 px-6 text-center">تاريخ التسجيل</th>
                <th className="py-4 px-6 text-center">الحاله</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00D2B4]" />
                    <span>جاري تحميل بيانات الشركات...</span>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    لا توجد شركات مسجلة في هذا القسم
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    {/* الشركه + Logo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <ProfileImage src={c.avatar} alt={c.company || c.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                        <span className="font-bold text-slate-800">{c.company || c.name}</span>
                      </div>
                    </td>

                    {/* البريد الإلكتروني */}
                    <td className="py-4 px-6 text-center text-slate-600 font-normal dir-ltr">
                      {c.email}
                    </td>

                    <td className="py-4 px-6 text-center font-normal dir-ltr">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="font-semibold text-slate-700 hover:text-[#00a990]">
                          {c.phone}
                        </a>
                      ) : (
                        <span className="font-bold text-rose-600">غير مسجل — مطلوب قبل الاعتماد</span>
                      )}
                    </td>

                    {/* تاريخ التسجيل */}
                    <td className="py-4 px-6 text-center text-slate-600 font-normal dir-ltr">
                      {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    {/* الحاله */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(c.accountStatus || 'active')}
                    </td>

                    {/* الإجراءات */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsCompany(c)}
                          className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                          aria-label={`عرض تفاصيل شركة ${c.company || c.name}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          تفاصيل
                        </button>
                        {c.accountStatus !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(c._id, 'active')}
                            disabled={updatingId === c._id}
                            className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition text-xs font-bold disabled:opacity-50"
                          >
                            اعتماد
                          </button>
                        )}
                        {c.accountStatus !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(c._id, 'suspended')}
                            disabled={updatingId === c._id}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-bold disabled:opacity-50"
                          >
                            تعليق
                          </button>
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

      {detailsCompany && (
        <div
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setDetailsCompany(null);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-company-details-title"
            dir="rtl"
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-4">
                <ProfileImage src={detailsCompany.avatar} alt={detailsCompany.company || detailsCompany.name} className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-cover" />
                <div>
                  <p className="mb-1 text-sm font-bold text-[#00a990]">مراجعة حساب الشركة</p>
                  <h2 id="admin-company-details-title" className="text-xl font-black text-slate-800 md:text-2xl">
                    {detailsCompany.company || detailsCompany.name}
                  </h2>
                  <div className="mt-2">{getStatusBadge(detailsCompany.accountStatus || 'active')}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsCompany(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="إغلاق تفاصيل الشركة"
              >
                <X size={21} />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">
              <h3 className="mb-3 text-base font-black text-slate-800">بيانات الشركة</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: 'اسم الشركة', value: detailsCompany.company || detailsCompany.name, icon: Building2 },
                  { label: 'مجال العمل', value: detailsCompany.companyIndustry, icon: BriefcaseBusiness },
                  { label: 'الموقع', value: detailsCompany.location, icon: MapPin },
                  { label: 'الموقع الإلكتروني', value: detailsCompany.companyWebsite, icon: Globe },
                  { label: 'تاريخ التسجيل', value: formatCompanyDate(detailsCompany.createdAt), icon: CalendarDays },
                  { label: 'حالة الحساب', value: detailsCompany.accountStatus === 'reviewing' ? 'في انتظار الموافقة' : detailsCompany.accountStatus === 'active' ? 'معتمد' : 'معلق', icon: Building2 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Icon size={15} className="text-[#00a990]" /> {label}
                    </div>
                    {label === 'الموقع الإلكتروني' && value ? (
                      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="break-all text-sm font-bold text-sky-700 hover:underline">{value}</a>
                    ) : (
                      <p className="m-0 break-words text-sm font-bold leading-6 text-slate-800">{value || 'غير متوفر'}</p>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="mb-3 mt-6 text-base font-black text-slate-800">بيانات مسؤول الحساب</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: 'اسم المسؤول', value: detailsCompany.name, icon: UserRound },
                  { label: 'البريد الإلكتروني', value: detailsCompany.email, icon: Mail },
                  { label: 'رقم التواصل الأساسي للشركة', value: detailsCompany.phone, icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Icon size={15} className="text-[#00a990]" /> {label}
                    </div>
                    <p className={`m-0 break-all text-sm font-bold leading-6 ${!value && label === 'رقم التواصل الأساسي للشركة' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {value || (label === 'رقم التواصل الأساسي للشركة' ? 'غير مسجل — مطلوب قبل اعتماد الشركة' : 'غير متوفر')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {detailsCompany.accountStatus === 'reviewing' && (
              <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  disabled={updatingId === detailsCompany._id}
                  onClick={() => handleStatusChange(detailsCompany._id, 'suspended')}
                  className="rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  رفض الشركة
                </button>
                <button
                  type="button"
                  disabled={updatingId === detailsCompany._id}
                  onClick={() => handleStatusChange(detailsCompany._id, 'active')}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updatingId === detailsCompany._id ? 'جاري الاعتماد...' : 'اعتماد الشركة'}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="flex flex-col items-center justify-center gap-2">
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
        {totalCount > 0 && (
          <div className="mt-2 px-4 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
            {companies.length} / {totalCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
