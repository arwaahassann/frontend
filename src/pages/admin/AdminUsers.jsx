import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { getAdminUsers, updateAdminUserStatus } from '../../api/admin';
import AdminPagination from '../../components/admin/AdminPagination';
import ProfileImage from '../../components/ProfileImage';

const AdminUsers = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState(() => searchParams.get('role') || 'all');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 8,
        role: roleFilter,
        search: appliedSearchTerm,
      };
      const res = await getAdminUsers(params);
      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, [appliedSearchTerm, page, roleFilter]);

  useEffect(() => {
    setRoleFilter(searchParams.get('role') || 'all');
    setSearchTerm(searchParams.get('search') || '');
    setAppliedSearchTerm(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearchTerm(searchTerm);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setUpdatingId(userId);
      const res = await updateAdminUserStatus(userId, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, accountStatus: newStatus } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر تحديث الحالة');
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
    return <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-[#fca5a5] text-[#b91c1c]">مرفوض</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">اداره المستخدمين</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">اداره جميع مستخدمين المنصه</p>
      </div>

      <div className="flex items-center justify-start gap-8 border-b border-slate-200">
        <button
          onClick={() => { setRoleFilter('all'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            roleFilter === 'all'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => { setRoleFilter('job_seeker'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            roleFilter === 'job_seeker'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          باحث عن عمل
        </button>
        <button
          onClick={() => { setRoleFilter('employer'); setPage(1); }}
          className={`pb-3 text-base font-bold transition border-b-2 ${
            roleFilter === 'employer'
              ? 'border-[#00D2B4] text-[#00D2B4]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          صاحب العمل
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن المستخدم"
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#EAEAEA] text-slate-700 text-sm font-bold border-b border-slate-200">
                <th className="py-4 px-6">الاسم</th>
                <th className="py-4 px-6 text-center">النوع</th>
                <th className="py-4 px-6 text-center">البريد الالكتروني</th>
                <th className="py-4 px-6 text-center">رقم الهاتف</th>
                <th className="py-4 px-6 text-center">الحاله</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00D2B4]" />
                    <span>جاري تحميل المستخدمين...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    لا يوجد مستخدمين مطابقين لخيارات البحث
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <ProfileImage src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                        <span className="font-bold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">{u.role === 'job_seeker' ? 'باحث عن عمل' : 'صاحب عمل'}</td>
                    <td className="py-4 px-6 text-center">{u.email}</td>
                    <td className="py-4 px-6 text-center">{u.phone || '—'}</td>
                    <td className="py-4 px-6 text-center">{getStatusBadge(u.accountStatus)}</td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={u.accountStatus || 'reviewing'}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/30"
                      >
                        <option value="active">مقبوله</option>
                        <option value="reviewing">قيد المراجعه</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AdminUsers;
