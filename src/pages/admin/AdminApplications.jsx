import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { getAdminApplications } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';
import ProfileImage from '../../components/ProfileImage';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 8,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearchTerm,
      };
      const res = await getAdminApplications(params);
      if (res.success) {
        setApplications(res.applications);
        setTotalPages(res.pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل طلبات التوظيف');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, appliedSearchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#86efac] text-[#15803d]">تم القبول</span>;
      case 'interview':
        return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">مقابلة عمل</span>;
      case 'rejected':
        return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fca5a5] text-[#b91c1c]">مرفوض</span>;
      default:
        return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fef08a] text-[#a16207]">قيد المراجعة</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">طلبات المتقدمين</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">متابعة جميع طلبات التوظيف المقدمة على المنصة</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center justify-start gap-8 border-b border-slate-200">
        {['all', 'pending', 'reviewing', 'interview', 'accepted', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            className={`pb-3 text-base font-bold transition border-b-2 ${
              statusFilter === st
                ? 'border-[#00D2B4] text-[#00D2B4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'all' && 'الكل'}
            {st === 'pending' && 'معلق'}
            {st === 'reviewing' && 'قيد الفحص'}
            {st === 'interview' && 'مقابلات'}
            {st === 'accepted' && 'مقبول'}
            {st === 'rejected' && 'مرفوض'}
          </button>
        ))}
      </div>

      {/* ── Search Input ── */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث باسم المتقدم أو البريد أو الهاتف"
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
                <th className="py-4 px-6">المتقدم</th>
                <th className="py-4 px-6 text-center">الوظيفة المُقدم عليها</th>
                <th className="py-4 px-6 text-center">الشركة</th>
                <th className="py-4 px-6 text-center">تاريخ التقديم</th>
                <th className="py-4 px-6 text-center">الحاله</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00D2B4]" />
                    <span>جاري تحميل طلبات التوظيف...</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    لا توجد طلبات تقديم في هذا القسم
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <ProfileImage src={app.user?.avatar || app.avatar} alt={app.user?.name || app.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                        <div>
                          <span className="font-bold text-slate-800 block">{app.user?.name || app.name}</span>
                          <span className="text-xs text-slate-400 font-normal">{app.email || app.user?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center text-slate-800">
                      {app.job?.title || 'وظيفة محذوفة'}
                    </td>

                    <td className="py-4 px-6 text-center text-slate-600">
                      {app.job?.company || '—'}
                    </td>

                    <td className="py-4 px-6 text-center text-slate-600 font-normal dir-ltr">
                      {new Date(app.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col items-center justify-center gap-2">
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
        {totalCount > 0 && (
          <div className="mt-2 px-4 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
            {applications.length} / {totalCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
