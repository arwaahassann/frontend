import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, Clock, Bookmark, BookmarkCheck, Search,
  ChevronLeft, ChevronRight, X, Filter, RotateCcw, ArrowUpDown, ChevronDown
} from 'lucide-react';
import api from '../api/axiosConfig';
import { PUBLIC_JOBS, SEEKER } from '../api/endpoints';
import LocationInput from '../components/LocationInput';

const JOBS_PER_PAGE = 6; // 6 وظائف لكل صفحة لأداء فائق السرعة

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const debounceTimerRef = useRef(null);

  // جلب المفضلة
  useEffect(() => {
    api.get(SEEKER.SAVED_JOBS)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.savedJobs)) {
          setSavedIds(new Set(res.data.savedJobs.map((j) => j._id)));
        }
      })
      .catch(() => {});
  }, []);

  // دالة جلب الوظائف مع كل الفلاتر
  const fetchJobs = (page = 1, queryText = search) => {
    setLoading(true);
    let url = `${PUBLIC_JOBS.ALL}?page=${page}&limit=${JOBS_PER_PAGE}`;
    if (queryText.trim()) {
      url += `&search=${encodeURIComponent(queryText.trim())}`;
    }
    if (locationFilter !== 'all') {
      url += `&location=${encodeURIComponent(locationFilter)}`;
    }
    if (jobTypeFilter !== 'all') {
      url += `&jobType=${encodeURIComponent(jobTypeFilter)}`;
    }
    if (levelFilter !== 'all') {
      url += `&level=${encodeURIComponent(levelFilter)}`;
    }
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}`;
    }

    api.get(url)
      .then((res) => {
        if (res.data.success) {
          setJobs(res.data.jobs || []);
          setTotalJobs(res.data.total || (res.data.jobs ? res.data.jobs.length : 0));
          setTotalPages(res.data.pages || 1);
          setCurrentPage(res.data.page || page);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // البحث التلقائي السريع مع Debounce (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchJobs(1, search);
    }, 300);

    return () => clearTimeout(debounceTimerRef.current);
  }, [search, locationFilter, jobTypeFilter, levelFilter, sortBy]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchJobs(newPage, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocationFilter('all');
    setJobTypeFilter('all');
    setLevelFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleToggleSave = async (e, jobId) => {
    e.stopPropagation();
    try {
      const res = await api.post(SEEKER.TOGGLE_SAVE(jobId));
      if (res.data.success) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          res.data.saved ? next.add(jobId) : next.delete(jobId);
          return next;
        });
      }
    } catch {
      /* ignore */
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'منذ اليوم';
    if (diff === 1) return 'منذ يوم';
    return `منذ ${diff} أيام`;
  };

  const selectStyle = {
    padding: '9px 28px 9px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '13px',
    fontFamily: 'Cairo, sans-serif',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
    direction: 'rtl',
    appearance: 'none',
  };

  const isFiltered = search || locationFilter !== 'all' || jobTypeFilter !== 'all' || levelFilter !== 'all' || sortBy !== 'newest';

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', maxWidth: '950px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* الهيدر */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1D3557' }}>جميع الوظائف المتاحة 💼</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            تصفح أحدث الوظائف المنشورة مع خيارات الفلترة المتقدمة والترتيب
          </p>
        </div>
      </div>

      {/* البحث الذكي السريع */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <input
          type="text"
          placeholder="ابحث فوراً بالمسمى الوظيفي، اسم الشركة، أو المهارات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 48px 14px 44px',
            border: '1.5px solid #cbd5e1',
            borderRadius: '14px',
            fontSize: '14px',
            fontFamily: 'Cairo, sans-serif',
            outline: 'none',
            direction: 'rtl',
            boxSizing: 'border-box',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s',
          }}
        />
        <Search size={20} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 🎯 شريط الفلاتر المتقدمة والترتيب (Advanced Filter Bar) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D3557', fontWeight: 800, fontSize: '13px' }}>
          <Filter size={16} color="#00D2B4" /> تصفية:
        </div>

        {/* فلتر المحافظة / الدولة مع إمكانية البحث والكتابة والاختيار */}
        <div style={{ width: '230px', minWidth: '190px' }}>
          <LocationInput
            name="locationFilter"
            compact={true}
            value={locationFilter === 'all' ? '' : locationFilter}
            onChange={(e) => {
              const val = e.target.value;
              setLocationFilter(val && val.trim() ? val.trim() : 'all');
            }}
            placeholder="🌍 كل المحافظات أو اكتب بلدك..."
          />
        </div>

        {/* فلتر نوع الدوام */}
        <div style={{ position: 'relative' }}>
          <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">كل أنواع الدوام</option>
            <option value="دوام كامل">دوام كامل</option>
            <option value="دوام جزئي">دوام جزئي</option>
            <option value="عن بُعد">عن بُعد (Remote)</option>
            <option value="عقد">عقد</option>
          </select>
          <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* فلتر المستوى المهني */}
        <div style={{ position: 'relative' }}>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={selectStyle}>
            <option value="all">كل المستويات</option>
            <option value="مبتدئ">مبتدئ (Entry-level)</option>
            <option value="متوسط">متوسط (Mid-level)</option>
            <option value="خبير">خبير (Senior)</option>
            <option value="مدير">إداري / مدير</option>
          </select>
          <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* الترتيب */}
        <div style={{ position: 'relative', marginRight: 'auto' }}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selectStyle, background: '#f8fafc', borderColor: '#00D2B4' }}>
            <option value="newest">🕒 الأحدث نشراً</option>
            <option value="salary_high">💰 الأعلى راتباً</option>
            <option value="oldest">📅 الأقدم</option>
          </select>
          <ChevronDown size={14} color="#00D2B4" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* زر إعادة ضبط الفلاتر */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#fee2e2',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            <RotateCcw size={12} /> إعادة ضبط
          </button>
        )}
      </div>

      {/* عدد النتائج */}
      {!loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 700 }}>
            إجمالي الوظائف المتاحة: <span style={{ color: '#00D2B4', fontWeight: 900 }}>{totalJobs}</span> وظيفة
          </p>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
            الصفحة {currentPage} من {totalPages}
          </span>
        </div>
      )}

      {/* قائمة الوظائف */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>جاري تحميل الوظائف...</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#64748b' }}>لا توجد وظائف تطابق خيارات البحث والفلترة الحالية</p>
          <button
            onClick={handleResetFilters}
            style={{
              marginTop: '12px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              background: '#00D2B4',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            عرض كل الوظائف
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {jobs.map((job) => {
            const isSaved = savedIds.has(job._id);
            return (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                {/* حفظ الوظيفة */}
                <button
                  onClick={(e) => handleToggleSave(e, job._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    color: isSaved ? '#f59e0b' : '#cbd5e1',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isSaved ? (
                    <BookmarkCheck size={22} fill="#f59e0b" color="#f59e0b" />
                  ) : (
                    <Bookmark size={22} />
                  )}
                </button>

                {/* التفاصيل */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: '16px', color: '#1D3557' }}>{job.title}</p>
                    <span style={{ fontSize: '11px', background: '#f0fdfa', color: '#00D2B4', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      {job.category || 'عام'}
                    </span>
                    {job.level && (
                      <span style={{ fontSize: '11px', background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        {job.level}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{job.company}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#00D2B4" /> {job.location}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={13} color="#00D2B4" /> {job.jobType}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#00D2B4" /> {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Logo */}
                {job.logoUrl ? (
                  <img
                    src={job.logoUrl}
                    alt={job.company}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '1.5px solid #e2e8f0',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #1D3557 0%, #264362 100%)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '20px',
                      color: '#ffffff',
                    }}
                  >
                    {job.company?.charAt(0) || 'ش'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 الترقيم بالأرقام (Pagination UI) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          {/* السابق */}
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: currentPage === 1 ? 0.4 : 1,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '13px',
              fontWeight: 800,
              color: '#334155',
            }}
          >
            <ChevronRight size={16} /> السابق
          </button>

          {/* أرقام الصفحات */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: currentPage === pageNumber ? '2px solid #00D2B4' : '1.5px solid #cbd5e1',
                fontFamily: 'Cairo, sans-serif',
                background: currentPage === pageNumber ? '#00D2B4' : '#ffffff',
                color: currentPage === pageNumber ? '#ffffff' : '#334155',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '14px',
                boxShadow: currentPage === pageNumber ? '0 4px 12px rgba(0, 210, 180, 0.35)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {pageNumber}
            </button>
          ))}

          {/* التالي */}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: currentPage === totalPages ? 0.4 : 1,
              fontFamily: 'Cairo, sans-serif',
              fontSize: '13px',
              fontWeight: 800,
              color: '#334155',
            }}
          >
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default Jobs;
