import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  ShoppingBag,
  FileText,
  Clock,
  Lock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getAdminStats } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalEmployers: 0,
      totalJobs: 0,
      totalApplications: 0,
      activeJobs: 0,
      reviewingJobs: 0,
      closedJobs: 0,
      rejectedJobs: 0,
      thisWeek: {
        newUsers: 0,
        newEmployers: 0,
        newApplications: 0,
      },
    },
    activities: [],
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data.stats;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
              مرحباً بك {user?.name ? user.name.split(' ')[0] : ''}
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#00D2B4]/15 text-[#0f766e]">
              مشرف
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">نظرة عامة على المنصة</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <button type="button" onClick={() => navigate('/admin/applications')} className="w-full cursor-pointer font-sans text-slate-800 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
          <span className="text-sm font-bold text-slate-600 mb-1">طلبات التقديم</span>
          <span className="text-3xl font-black text-slate-800 tracking-tight">
            {loading ? '...' : (stats.totalApplications || 0).toLocaleString('en-US')}
          </span>
        </button>

        <button type="button" onClick={() => navigate('/admin/jobs')} className="w-full cursor-pointer font-sans text-slate-800 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
          </div>
          <span className="text-sm font-bold text-slate-600 mb-1">اجمالي الوظائف</span>
          <span className="text-3xl font-black text-slate-800 tracking-tight">
            {loading ? '...' : (stats.totalJobs || 0).toLocaleString('en-US')}
          </span>
        </button>

        <button type="button" onClick={() => navigate('/admin/companies')} className="w-full cursor-pointer font-sans text-slate-800 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-8 h-8 text-emerald-500" />
          </div>
          <span className="text-sm font-bold text-slate-600 mb-1">اجمالي الشركات</span>
          <span className="text-3xl font-black text-slate-800 tracking-tight">
            {loading ? '...' : (stats.totalEmployers || 0).toLocaleString('en-US')}
          </span>
        </button>

        <button type="button" onClick={() => navigate('/admin/users')} className="w-full cursor-pointer font-sans text-slate-800 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <span className="text-sm font-bold text-slate-600 mb-1">اجمالي المستخدمين</span>
          <span className="text-3xl font-black text-slate-800 tracking-tight">
            {loading ? '...' : (stats.totalUsers || 0).toLocaleString('en-US')}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button type="button" onClick={() => navigate('/admin/jobs?status=rejected')} className="w-full font-sans text-slate-800 text-right cursor-pointer bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block mb-1">مرفوضه</span>
              <span className="text-xl font-black text-slate-800">
                {loading ? '...' : (stats.rejectedJobs || 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          </button>

          <button type="button" onClick={() => navigate('/admin/jobs?status=closed')} className="w-full font-sans text-slate-800 text-right cursor-pointer bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block mb-1">مغلقه</span>
              <span className="text-xl font-black text-slate-800">
                {loading ? '...' : (stats.closedJobs || 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
          </button>

          <button type="button" onClick={() => navigate('/admin/jobs?status=reviewing')} className="w-full font-sans text-slate-800 text-right cursor-pointer bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block mb-1">قيد المراجعه</span>
              <span className="text-xl font-black text-slate-800">
                {loading ? '...' : (stats.reviewingJobs || 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </button>

          <button type="button" onClick={() => navigate('/admin/jobs?status=active')} className="w-full font-sans text-slate-800 text-right cursor-pointer bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block mb-1">الوظائف النشطه</span>
              <span className="text-xl font-black text-slate-800">
                {loading ? '...' : (stats.activeJobs || 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
