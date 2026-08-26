import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { EMPLOYER } from '../../api/endpoints';
import {
  Search, Bell, Users, Calendar, Eye, Pencil, Trash2, PlusCircle
} from 'lucide-react';

const statusConfig = {
  active:  { label: 'نشط',   bg: '#dcfce7', color: '#16a34a' },
  pending: { label: 'مجدول', bg: '#dbeafe', color: '#2563eb' },
  closed:  { label: 'مغلق',  bg: '#fee2e2', color: '#ef4444' },
};

const tabs = [
  { key: 'all',     label: 'الكل' },
  { key: 'active',  label: 'نشط' },
  { key: 'closed',  label: 'مغلق' },
  { key: 'pending', label: 'مجدول' },
];

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchJobs = () => {
    setLoading(true);
    api.get(EMPLOYER.MY_JOBS)
      .then((res) => {
        if (res.data.success) {
          setJobs(res.data.jobs || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الوظيفة نهائياً؟')) return;
    try {
      const res = await api.delete(EMPLOYER.DELETE_JOB(id));
      if (res.data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== id));
      }
    } catch {
      alert('حدث خطأ أثناء محاولة حذف الوظيفة');
    }
  };

  // تصفية الوظائف حسب التبويب والبحث
  const filteredJobs = jobs.filter((job) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'active'
        ? job.status === 'active' || !job.status
        : job.status === activeTab;

    const matchesSearch = search.trim()
      ? job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.category?.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchesTab && matchesSearch;
  });

  const counts = {
    all:     jobs.length,
    active:  jobs.filter((j) => j.status === 'active' || !j.status).length,
    closed:  jobs.filter((j) => j.status === 'closed').length,
    pending: jobs.filter((j) => j.status === 'pending').length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '2024-05-01';
    const d = new Date(dateString);
    return d.toISOString().split('T')[0];
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. شريط البحث العلوي مع أيقونة الإشعارات طِبقاً للفيجما */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/notifications')}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <Bell size={20} />
        </button>

        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="ابحث عن الوظائف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 44px 12px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              fontFamily: 'Cairo, sans-serif',
              outline: 'none',
              direction: 'rtl',
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* 2. عنوان الصفحة والوصف + زر نشر وظيفة جديدة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 900, color: '#1D3557' }}>
            إدارة الوظائف
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            إدارة وعرض جميع الوظائف المنشورة
          </p>
        </div>

        <Link
          to="/manage/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#00D2B4',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'Cairo, sans-serif',
            boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
          }}
        >
          <PlusCircle size={16} /> نشر وظيفة جديدة
        </Link>
      </div>

      {/* 3. شريط التبويبات المطابق للفيجما 100% */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '4px 12px',
          display: 'flex',
          gap: '8px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 24px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                fontSize: '14px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#1D3557' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? '#b2f5ea' : '#f1f5f9',
                  color: isActive ? '#00A890' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {count}
              </span>

              {/* المؤشر السفلي التيل في الفيجما */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#00D2B4',
                    borderRadius: '3px 3px 0 0',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. شبكة كروت الوظائف المطابقة للفيجما 100% (3 Columns) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          جاري تحميل الوظائف...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1.5px dashed #e2e8f0',
          }}
        >
          <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#64748b' }}>
            لا توجد وظائف معروضة في هذه الفئة
          </p>
          <Link
            to="/manage/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: '#00D2B4',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            <PlusCircle size={16} /> أضف أول وظيفة الآن
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => {
            const st = statusConfig[job.status] || statusConfig.active;
            const applicantsCount = job.applicantsCount || 0;
            const targetCount = 32;
            const fillPercentage = Math.min(100, Math.round((applicantsCount / targetCount) * 100)) || 75;
            const viewsCount = job.viewsCount || 145;

            return (
              <div
                key={job._id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                {/* الرأس: شارة الحالة + عنوان الوظيفة وتاريخ النشر */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      padding: '4px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: st.bg,
                      color: st.color,
                    }}
                  >
                    {st.label}
                  </span>

                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1D3557' }}>
                      {job.title}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                      تاريخ النشر: {formatDate(job.createdAt)}
                    </p>
                  </div>
                </div>

                {/* 3 صفوف إحصائيات مع الأيقونات (مطابقة للفيجما) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f8fafc', paddingTop: '10px' }}>
                  {/* المتقدمين */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 800, color: '#1D3557' }}>
                      {applicantsCount}/{targetCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600 }}>
                      المتقدمين <Users size={15} color="#94a3b8" />
                    </span>
                  </div>

                  {/* الموعد النهائي */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#475569' }}>
                      {job.closingDate || '2024-05-31'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600 }}>
                      الموعد النهائي <Calendar size={15} color="#94a3b8" />
                    </span>
                  </div>

                  {/* المشاهدات */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#475569' }}>
                      {viewsCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600 }}>
                      المشاهدات <Eye size={15} color="#94a3b8" />
                    </span>
                  </div>
                </div>

                {/* شريط نسبة الملء (Progress Bar) */}
                <div style={{ marginTop: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                    <span>{fillPercentage}%</span>
                    <span>نسبة الملء</span>
                  </div>
                  <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${fillPercentage}%`,
                        background: '#00D2B4',
                        borderRadius: '999px',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>

                {/* زر عرض المتقدمين الفل ويدث باللون الأخضر الفاتح في الفيجما */}
                <Link
                  to={`/manage/${job._id}/applications`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '12px',
                    background: '#e6fffa',
                    color: '#00D2B4',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: '1px solid #b2f5ea',
                    transition: 'all 0.15s',
                  }}
                >
                  <Eye size={16} /> عرض
                </Link>

                {/* صفي الأزرار: تعديل وحذف المطابق للفيجما */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* زر التعديل باللون الأزرق الفاتح */}
                  <button
                    onClick={() => navigate(`/manage/${job._id}/edit`)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 800,
                      fontFamily: 'Cairo, sans-serif',
                    }}
                  >
                    <Pencil size={15} /> تعديل
                  </button>

                  {/* زر الحذف باللون الوردي/الأحمر الفاتح */}
                  <button
                    onClick={(e) => handleDelete(e, job._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="حذف الوظيفة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ManageJobs;
