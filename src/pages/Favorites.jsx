import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Clock, BookmarkCheck, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { SEEKER } from '../api/endpoints';

const JOBS_PER_PAGE = 8;

const Favorites = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.get(SEEKER.SAVED_JOBS)
      .then((res) => {
        if (res.data.success) setSavedJobs(res.data.savedJobs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (e, jobId) => {
    e.stopPropagation();
    try {
      const res = await api.post(SEEKER.TOGGLE_SAVE(jobId));
      if (res.data.success && !res.data.saved) {
        setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch { /* ignore */ }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return 'منذ اليوم';
    if (diff === 1) return 'منذ يوم';
    return `منذ ${diff} أيام`;
  };

  const totalPages = Math.ceil(savedJobs.length / JOBS_PER_PAGE);
  const paginated = savedJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '30px' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#1D3557' }}>
          قائمة الوظائف المفضلة ⭐
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          الوظائف التي قمت بحفظها للرجوع إليها والتقديم لاحقاً
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>جاري تحميل المفضلة...</div>
      ) : savedJobs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Bookmark size={26} color="#94a3b8" />
          </div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#475569' }}>لا توجد وظائف محفوظة حالياً</p>
          <p style={{ margin: '4px 0 16px', fontSize: '12.5px', color: '#94a3b8' }}>تصفح قائمة الوظائف واضغط على علامة المفضلة لحفظ أي فرصة تعجبك</p>
          <button
            onClick={() => navigate('/jobs')}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              background: '#00D2B4',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            تصفح الوظائف الآن 💼
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {paginated.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00D2B4';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Bookmark Toggle */}
                <button
                  type="button"
                  onClick={(e) => handleUnsave(e, job._id)}
                  title="إلغاء الحفظ"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookmarkCheck size={24} fill="#f59e0b" color="#f59e0b" />
                </button>

                {/* Job Information */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#1D3557' }}>
                    {job.title}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    {job.company}
                  </p>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#00D2B4" /> {job.location}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={13} color="#00D2B4" /> {job.jobType}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#94a3b8" /> {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Company Logo or Initials */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1D3557 0%, #264362 100%)',
                    color: '#ffffff',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}
                >
                  {job.company?.charAt(0) || 'ش'}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: currentPage === p ? '#1D3557' : '#ffffff',
                    color: currentPage === p ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
