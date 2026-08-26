import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { SEEKER, EMPLOYER } from '../api/endpoints';
import {
  User, Mail, Phone, MapPin, Briefcase, FileText, Download,
  Settings, Award, Clock, CheckCircle, MessageSquare, XCircle, Globe, Building2, Users, PlusCircle
} from 'lucide-react';

// ======================================================
// 👤 ملف الباحث عن عمل (Job Seeker Profile)
// ======================================================
const SeekerProfile = ({ profile, stats }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

    {/* 👈 العمود الأيمن (بطاقة المستخدم + الإحصائيات) */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* كارت المستخدم والصورة الشخصية */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '30px 24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 16px',
            border: '3px solid #00D2B4',
            boxShadow: '0 8px 24px rgba(0, 210, 180, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1D3557, #00D2B4)',
            color: '#ffffff',
            fontSize: '36px',
            fontWeight: 900,
          }}
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            profile?.name?.charAt(0) || 'م'
          )}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1D3557', margin: '0 0 6px' }}>
          {profile?.name || 'مستخدم جديد'}
        </h2>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            background: '#e6fffa',
            color: '#00D2B4',
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '20px',
          }}
        >
          {profile?.jobTitle || 'باحث عن عمل'}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: '18px', fontSize: '13px', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color="#94a3b8" />
            <span dir="ltr" style={{ fontWeight: 700 }}>{profile?.email || 'غير محدد'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} color="#94a3b8" />
            <span style={{ fontWeight: 700 }}>{profile?.phone || 'غير محدد'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} color="#94a3b8" />
            <span style={{ fontWeight: 700 }}>{profile?.location || 'غير محدد'}</span>
          </div>
        </div>

        <Link
          to="/settings"
          style={{
            display: 'block',
            marginTop: '22px',
            padding: '11px',
            borderRadius: '12px',
            border: '1.5px solid #00D2B4',
            background: '#ffffff',
            color: '#00D2B4',
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 210, 180, 0.1)',
            transition: 'all 0.2s',
          }}
        >
          تعديل البيانات والصورة ✏️
        </Link>
      </div>

      {/* إحصائيات طلبات الوظائف */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 900, color: '#1D3557' }}>
          إحصائيات طلبات الوظائف 📊
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#1D3557', display: 'block' }}>{stats?.applications || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700 }}>إجمالي طلباتي</span>
          </div>
          <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', display: 'block' }}>{stats?.accepted || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>مقبول 🎉</span>
          </div>
          <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #fed7aa' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', display: 'block' }}>{stats?.reviewing || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#9a3412', fontWeight: 700 }}>قيد المراجعة 🔍</span>
          </div>
          <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#2563eb', display: 'block' }}>{stats?.interviews || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 700 }}>مقابلات 📅</span>
          </div>
        </div>
      </div>

    </div>

    {/* 👉 العمود الأيسر (السيرة الذاتية، النبذة، المهارات، الخبرات) */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* كارت السيرة الذاتية CV */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #99f6e4',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#00D2B4',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 210, 180, 0.3)',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>السيرة الذاتية (CV)</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                {profile?.cvUrl ? 'تم إرفاق السيرة الذاتية وجاهزة للتقديم' : 'لم يتم إرفاق السيرة الذاتية بعد'}
              </p>
            </div>
          </div>

          {profile?.cvUrl ? (
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: '#1D3557',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(29, 53, 87, 0.25)',
              }}
            >
              <Download size={15} /> عرض وتحميل الـ CV
            </a>
          ) : (
            <Link
              to="/settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: '#00D2B4',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
              }}
            >
              + إرفاق CV الآن
            </Link>
          )}
        </div>
      </div>

      {/* نبذة شخصية */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
          نبذة شخصية 📝
        </h3>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.8', fontWeight: 600 }}>
          {profile?.bio || 'قم بإضافة نبذة مختصرة عن خبراتك وشغفك للفت انتباه مسؤولي التوظيف عبر شاشة تعديل الملف.'}
        </p>
      </div>

      {/* المهارات والتقنيات */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
          المهارات والتقنيات 🛠️
        </h3>
        {profile?.skills && profile.skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #ccfbf1',
                  fontSize: '12.5px',
                  fontWeight: 800,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
            لم يتم إضافة مهارات بعد. اضغط على "تعديل الملف" لإضافة مهاراتك.
          </p>
        )}
      </div>

      {/* الخبرات السابقة */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
          الخبرات السابقة 💼
        </h3>
        {profile?.experiences && profile.experiences.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.experiences.map((exp, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1D3557' }}>{exp.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{exp.company}</p>
                </div>
                <span style={{ fontSize: '11.5px', color: '#00D2B4', fontWeight: 800, background: '#e6fffa', padding: '4px 10px', borderRadius: '8px' }}>
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
            لم يتم إضافة خبرات سابقة بعد.
          </p>
        )}
      </div>

    </div>

  </div>
);

// ======================================================
// 🏢 ملف صاحب العمل / الشركة (Employer Profile)
// ======================================================
const EmployerProfile = ({ profile, stats }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

    {/* 👈 العمود الأيمن (هوية الشركة + الإحصائيات) */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* كارت الشركة والشعار */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '30px 24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 auto 16px',
            border: '3px solid #00D2B4',
            boxShadow: '0 8px 24px rgba(0, 210, 180, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            color: '#1D3557',
            fontSize: '36px',
            fontWeight: 900,
          }}
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt={profile.company || profile.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
          ) : (
            <Building2 size={42} color="#00D2B4" />
          )}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1D3557', margin: '0 0 6px' }}>
          {profile?.company || profile?.name || 'شركة معتمدة'}
        </h2>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            background: '#e6fffa',
            color: '#00D2B4',
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '20px',
          }}
        >
          مسؤول التوظيف: {profile?.name || 'المدير'}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: '18px', fontSize: '13px', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color="#94a3b8" />
            <span dir="ltr" style={{ fontWeight: 700 }}>{profile?.email || 'غير محدد'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} color="#94a3b8" />
            <span style={{ fontWeight: 700 }}>{profile?.phone || 'غير محدد'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} color="#94a3b8" />
            <span style={{ fontWeight: 700 }}>{profile?.location || 'القاهرة - مصر'}</span>
          </div>
        </div>

        <Link
          to="/settings"
          style={{
            display: 'block',
            marginTop: '22px',
            padding: '11px',
            borderRadius: '12px',
            border: '1.5px solid #00D2B4',
            background: '#ffffff',
            color: '#00D2B4',
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 210, 180, 0.1)',
            transition: 'all 0.2s',
          }}
        >
          تعديل بيانات الشركة والشعار ✏️
        </Link>
      </div>

      {/* إحصائيات التوظيف للشركة */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 900, color: '#1D3557' }}>
          نشاط التوظيف للشركة 📈
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', display: 'block' }}>{stats?.activeJobs || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>وظائف معلنة 💼</span>
          </div>
          <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#2563eb', display: 'block' }}>{stats?.applicants || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 700 }}>إجمالي المتقدمين 👥</span>
          </div>
          <div style={{ gridColumn: 'span 2', background: '#e6fffa', padding: '12px', borderRadius: '14px', textAlign: 'center', border: '1px solid #99f6e4' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f766e', display: 'block' }}>{stats?.interviews || 0}</span>
            <span style={{ fontSize: '11.5px', color: '#0f766e', fontWeight: 800 }}>مقابلات مجدولة 📅</span>
          </div>
        </div>
      </div>

    </div>

    {/* 👉 العمود الأيسر (عن الشركة، المجال، الإجراءات السريعة) */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* عن الشركة ومجال العمل */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 900, color: '#1D3557', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#00D2B4" /> عن الشركة ومجال العمل
        </h3>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.8', fontWeight: 600 }}>
          {profile?.bio || 'لم يتم إضافة نبذة تعريفية عن الشركة بعد. يمكنك إضافة وصف الشركة وقيمها ومجال عملها من شاشة تعديل البيانات.'}
        </p>
      </div>

      {/* المجال وقطاع الأعمال */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 900, color: '#1D3557', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#00D2B4" /> المجال / قطاع الأعمال
        </h3>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '10px',
            background: '#f0fdfa',
            color: '#0f766e',
            border: '1px solid #ccfbf1',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          {profile?.companyIndustry || 'برمجيات وتكنولوجيا المعلومات'}
        </span>
      </div>

      {/* روابط سريعة للتوظيف */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
          روابط سريعة للتوظيف ⚡
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <Link
            to="/manage/new"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#00D2B4',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
              transition: 'transform 0.15s',
            }}
          >
            <PlusCircle size={17} /> نشر إعلان وظيفة جديد
          </Link>

          <Link
            to="/manage"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#1D3557',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(29, 53, 87, 0.25)',
              transition: 'transform 0.15s',
            }}
          >
            <Users size={17} /> إدارة الوظائف والمتقدمين
          </Link>
        </div>
      </div>

    </div>

  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get(SEEKER.PROFILE);
        const apiProfile = profileRes.data.user;
        // دمج بيانات الـ API مع بيانات الـ Context
        // الـ Context دايماً أحدث (بيتحدث فوراً بعد كل تعديل)
        setProfile({
          ...apiProfile,
          // avatar من الـ Context له الأولوية (أحدث من API في حالة التغيير الفوري)
          avatar: user?.avatar || apiProfile?.avatar || '',
          name: apiProfile?.name || user?.name || '',
        });

        if (user?.role === 'employer') {
          const [jobsRes, appsRes] = await Promise.all([
            api.get(EMPLOYER.MY_JOBS).catch(() => ({ data: { jobs: [] } })),
            api.get(EMPLOYER.ALL_APPLICANTS).catch(() => ({ data: { applications: [] } })),
          ]);
          const activeJobs = (jobsRes.data.jobs || []).filter((j) => j.status === 'active').length;
          const apps = appsRes.data.applications || [];
          const interviews = apps.filter((a) => a.status === 'interview').length;
          setStats({ activeJobs, applicants: apps.length, interviews });
        } else {
          const statsRes = await api.get(SEEKER.APPLICATION_STATS);
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontFamily: 'Cairo, sans-serif' }}>
      جاري تحميل بيانات الملف الشخصي...
    </div>
  );

  const isEmployer = user?.role === 'employer';

  return (
    <div dir="rtl" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Cairo, sans-serif', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1D3557' }}>
            {isEmployer ? 'الملف التعريفي للشركة 🏢' : 'ملفي الشخصي 👤'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            {isEmployer
              ? 'إدارة بيانات وهوية الشركة وشعارها ومسؤول التوظيف ومتابعة الإحصائيات'
              : 'عَرض وتحديث بياناتك وصورتك والسيرة الذاتية والخبرات'}
          </p>
        </div>
        <Link
          to="/settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            background: '#00D2B4',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
            transition: 'all 0.2s',
          }}
        >
          <Settings size={16} />
          {isEmployer ? 'تعديل بيانات الشركة والشعار' : 'الإعدادات وتعديل الملف'}
        </Link>
      </div>

      {isEmployer ? (
        <EmployerProfile profile={profile} stats={stats} />
      ) : (
        <SeekerProfile profile={profile} stats={stats} />
      )}

    </div>
  );
};

export default Profile;
