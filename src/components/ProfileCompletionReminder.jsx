import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { SEEKER } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { getProfileCompletion } from '../utils/profileCompletion';

const ProfileCompletionReminder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?._id;
  const userRole = user?.role;
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!userId || !['job_seeker', 'employer'].includes(userRole)) {
      return () => {
        active = false;
      };
    }

    setLoadError(false);

    api.get(SEEKER.PROFILE)
      .then(response => {
        if (active) setProfile(response.data.user);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [userId, userRole, retryKey]);

  if (!user || !['job_seeker', 'employer'].includes(userRole)) return null;

  if (loadError) {
    return (
      <div role="alert" style={styles.errorBanner}>
        <AlertCircle size={18} />
        <span style={{ flex: 1 }}>تعذر التحقق من اكتمال بيانات الحساب.</span>
        <button type="button" onClick={() => setRetryKey(value => value + 1)} style={styles.retryButton}>
          <RefreshCw size={15} /> إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const currentProfile = {
    ...profile,
    name: user.name ?? profile.name,
    jobTitle: user.jobTitle ?? profile.jobTitle,
    email: user.email ?? profile.email,
    phone: user.phone ?? profile.phone,
    location: user.location ?? profile.location,
    company: user.company ?? profile.company,
    companyIndustry: user.companyIndustry ?? profile.companyIndustry,
    cvUrl: user.cvUrl ?? profile.cvUrl,
  };
  const { completion, missingFields } = getProfileCompletion(currentProfile, user.role);

  if (!missingFields.length) return null;

  return (
    <section aria-label="تذكير باستكمال بيانات الحساب" style={styles.banner}>
      <div style={styles.heading}>
        <div>
          <strong style={styles.title}>بيانات مهمة ناقصة ({missingFields.length})</strong>
          <span style={styles.description}>أكمل بياناتك التالية حتى يكتمل ملف الحساب.</span>
        </div>
        <span style={styles.percentage}>{completion}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="نسبة اكتمال البيانات الأساسية"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion}
        style={styles.progressTrack}
      >
        <div style={{ ...styles.progressValue, width: `${completion}%` }} />
      </div>
      <div style={styles.footer}>
        <div style={styles.fieldList}>
          {missingFields.map(field => <span key={field.key} style={styles.fieldTag}>{field.label}</span>)}
        </div>
        <button type="button" onClick={() => navigate('/settings')} style={styles.action}>
          استكمال البيانات <ArrowLeft size={15} />
        </button>
      </div>
    </section>
  );
};

const styles = {
  banner: {
    position: 'sticky',
    top: '10px',
    zIndex: 20,
    marginBottom: '20px',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #fed7aa',
    background: '#fff7ed',
    boxShadow: '0 4px 12px rgba(154, 52, 18, 0.06)',
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  title: { display: 'block', color: '#9a3412', fontSize: '14px', fontWeight: 900 },
  description: { display: 'block', marginTop: '3px', color: '#64748b', fontSize: '12px' },
  percentage: { flexShrink: 0, color: '#9a3412', fontSize: '14px', fontWeight: 900 },
  progressTrack: { height: '7px', overflow: 'hidden', borderRadius: '999px', background: '#e2e8f0' },
  progressValue: { height: '100%', borderRadius: 'inherit', background: '#f97316', transition: 'width 0.2s ease' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '10px' },
  fieldList: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  fieldTag: { padding: '4px 9px', borderRadius: '999px', background: '#ffedd5', color: '#9a3412', fontSize: '11px', fontWeight: 800 },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    border: 'none',
    borderRadius: '8px',
    background: '#9a3412',
    color: '#fff',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  errorBanner: {
    position: 'sticky',
    top: '10px',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '12px 16px',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '13px',
    fontWeight: 700,
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    background: '#fff',
    color: '#b91c1c',
    fontFamily: 'inherit',
    fontWeight: 800,
    cursor: 'pointer',
  },
};

export default ProfileCompletionReminder;
