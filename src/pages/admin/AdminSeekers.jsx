import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Loader2, Search, UserRound, XCircle } from 'lucide-react';
import { getAdminSeekers, updateAdminSeekerStatus } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';
import ProfileImage from '../../components/ProfileImage';

const statusLabels = {
  active: 'نشط',
  reviewing: 'قيد المراجعة',
  suspended: 'موقوف',
};

const AdminSeekers = () => {
  const [searchParams] = useSearchParams();
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSeekers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminSeekers({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearchTerm,
      });
      if (!res.success) throw new Error(res.message || 'تعذر تحميل بيانات الباحثين عن عمل');
      setSeekers(res.seekers || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ في تحميل الباحثين عن عمل');
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
    fetchSeekers();
  }, [fetchSeekers]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearchTerm(searchTerm.trim());
  };

  const handleStatusChange = async (seekerId, status) => {
    try {
      setUpdatingId(seekerId);
      setActionError('');
      const res = await updateAdminSeekerStatus(seekerId, status);
      if (!res.success) throw new Error(res.message || 'تعذر تحديث حالة الباحث عن عمل');
      if (statusFilter !== 'all' && status !== statusFilter) {
        await fetchSeekers();
      } else {
        setSeekers((current) => current.map((seeker) => (
          seeker._id === seekerId ? { ...seeker, accountStatus: status } : seeker
        )));
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'تعذر تحديث حالة الباحث عن عمل');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'نشط' },
    { value: 'reviewing', label: 'قيد المراجعة' },
    { value: 'suspended', label: 'موقوف' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 text-right">
        <div>
          <h1 className="text-2xl font-black text-slate-800 md:text-3xl">الباحثون عن عمل</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">عرض وإدارة حسابات الباحثين عن عمل فقط</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
          إجمالي الباحثين: {totalCount.toLocaleString('ar-EG')}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="فلترة الباحثين حسب حالة الحساب">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={statusFilter === tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              statusFilter === tab.value
                ? 'border-[#00D2B4] text-[#0f766e]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-2xl gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">ابحث بالاسم أو البريد أو رقم الهاتف أو المسمى الوظيفي</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث بالاسم أو البريد أو رقم الهاتف أو المسمى الوظيفي"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-11 text-right text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#00D2B4] focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/20"
          />
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </label>
        <button type="submit" className="rounded-xl bg-[#1D3557] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#284a76]">
          بحث
        </button>
      </form>

      {(error || actionError) && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{actionError || error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
                <th scope="col" className="px-5 py-4">الباحث عن عمل</th>
                <th scope="col" className="px-5 py-4 text-center">البريد الإلكتروني</th>
                <th scope="col" className="px-5 py-4 text-center">رقم الهاتف</th>
                <th scope="col" className="px-5 py-4 text-center">تاريخ التسجيل</th>
                <th scope="col" className="px-5 py-4 text-center">الحالة</th>
                <th scope="col" className="px-5 py-4 text-center">إدارة الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#00D2B4]" />
                    جاري تحميل الباحثين عن عمل...
                  </td>
                </tr>
              ) : seekers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    لا يوجد باحثون عن عمل مطابقون لخيارات البحث
                  </td>
                </tr>
              ) : seekers.map((seeker) => (
                <tr key={seeker._id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex min-w-44 items-center gap-3">
                      <ProfileImage src={seeker.avatar} alt={seeker.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">{seeker.name}</p>
                        <p className="truncate text-xs font-medium text-slate-500">{seeker.jobTitle || 'باحث عن عمل'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-normal text-slate-600" dir="ltr">{seeker.email}</td>
                  <td className="px-5 py-4 text-center font-normal text-slate-600" dir="ltr">
                    {seeker.phone ? <a href={`tel:${seeker.phone}`} className="hover:text-[#0f766e]">{seeker.phone}</a> : '—'}
                  </td>
                  <td className="px-5 py-4 text-center font-normal text-slate-600">
                    {seeker.createdAt ? new Date(seeker.createdAt).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      seeker.accountStatus === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : seeker.accountStatus === 'reviewing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {seeker.accountStatus === 'active'
                        ? <CheckCircle className="h-3.5 w-3.5" />
                        : seeker.accountStatus === 'reviewing'
                          ? <Clock className="h-3.5 w-3.5" />
                          : <XCircle className="h-3.5 w-3.5" />}
                      {statusLabels[seeker.accountStatus] || 'غير محدد'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <select
                      aria-label={`تغيير حالة ${seeker.name}`}
                      value={seeker.accountStatus || 'active'}
                      onChange={(event) => handleStatusChange(seeker._id, event.target.value)}
                      disabled={updatingId === seeker._id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition focus:border-[#00D2B4] focus:ring-2 focus:ring-[#00D2B4]/20 disabled:opacity-50"
                    >
                      <option value="active">نشط</option>
                      <option value="reviewing">قيد المراجعة</option>
                      <option value="suspended">موقوف</option>
                    </select>
                    {updatingId === seeker._id && <Loader2 className="ms-2 inline h-4 w-4 animate-spin text-slate-400" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
        <UserRound className="h-4 w-4" />
        تظهر هنا حسابات الباحثين عن عمل فقط؛ إدارة الشركات متاحة في قسم الشركات.
      </div>
    </div>
  );
};

export default AdminSeekers;
