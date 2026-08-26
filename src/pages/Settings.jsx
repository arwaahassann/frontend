import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Briefcase, Lock, Plus, Trash2,
  FileText, Upload, Save, CheckCircle, KeyRound, Building2,
  Camera, X, Eye, EyeOff
} from 'lucide-react';
import api from '../api/axiosConfig';
import { SEEKER } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import LocationInput from '../components/LocationInput';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const SettingsPage = () => {
  const { user, setUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    company: '',
    companyWebsite: '',
    companyIndustry: '',
    email: '',
    location: '',
    phone: '',
    bio: '',
    avatar: '',
    cvUrl: '',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [newExp, setNewExp] = useState({ title: '', company: '', period: '' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fileName, setFileName] = useState('');

  const isEmployer = user?.role === 'employer';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(SEEKER.PROFILE);
        const u = res.data.user;
        setFormData({
          name: u.name || '',
          jobTitle: u.jobTitle || (isEmployer ? 'مدير التوظيف' : 'باحث عن عمل'),
          company: u.company || '',
          companyWebsite: u.companyWebsite || '',
          companyIndustry: u.companyIndustry || '',
          email: u.email || '',
          location: u.location || 'القاهرة - مصر',
          phone: u.phone || '',
          bio: u.bio || '',
          avatar: u.avatar || '',
          cvUrl: u.cvUrl || '',
        });
        setSkills(u.skills || []);
        setExperiences(u.experiences || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isEmployer]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatarBase64 = reader.result;
      setFormData((prev) => ({ ...prev, avatar: avatarBase64 }));
      // تحديث الـ Sidebar فوراً بمجرد اختيار الصورة
      updateUser({ avatar: avatarBase64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    updateUser({ avatar: '' });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (newExp.title.trim() && newExp.company.trim()) {
      setExperiences([...experiences, { ...newExp }]);
      setNewExp({ title: '', company: '', period: '' });
    }
  };

  const handleRemoveExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('حجم الملف كبير جداً، يرجى اختيار ملف أقل من 15 ميجابايت.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, cvUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    if (!formData.name.trim()) {
      setMessage({ text: 'الاسم بالكامل إلزامي', type: 'error' });
      setSaving(false);
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setMessage({ text: 'البريد الإلكتروني إلزامي وبصيغة صحيحة', type: 'error' });
      setSaving(false);
      return;
    }
    if (isEmployer && !formData.company.trim()) {
      setMessage({ text: 'اسم الشركة إلزامي لحسابات أصحاب العمل', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        skills: isEmployer ? [] : skills,
        experiences: isEmployer ? [] : experiences,
      };

      const res = await api.put(SEEKER.PROFILE, payload);
      // تحديث الـ Context و localStorage فوراً (بيحدث الـ Sidebar فوراً)
      updateUser(res.data.user);
      setMessage({ text: 'تم حفظ وتحديث الملف بنجاح 🎉', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'حدث خطأ أثناء حفظ التعديلات',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!passwordData.currentPassword) {
      setMessage({ text: 'كلمة المرور الحالية مطلوبة', type: 'error' });
      return;
    }

    const isStrongPass =
      passwordData.newPassword.length >= 8 &&
      /[A-Z]/.test(passwordData.newPassword) &&
      /[a-z]/.test(passwordData.newPassword) &&
      /[0-9]/.test(passwordData.newPassword) &&
      /[^A-Za-z0-9]/.test(passwordData.newPassword);

    if (!isStrongPass) {
      setMessage({
        text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير (A-Z)، وحرف صغير (a-z)، ورقم (0-9)، ورمز خاص (مثل: @$!%*?&#)',
        type: 'error',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await api.put(SEEKER.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ text: 'تم تغيير كلمة المرور بنجاح! 🔒', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'تعذر تغيير كلمة المرور، تأكد من صحة الحالية',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontFamily: 'Cairo, sans-serif' }}>
        جاري تحميل الإعدادات...
      </div>
    );
  }

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 800,
    color: '#334155',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '11px',
    border: '1px solid #e2e8f0',
    fontSize: '13.5px',
    fontFamily: 'Cairo, sans-serif',
    outline: 'none',
    color: '#1E293B',
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#1D3557' }}>
          {isEmployer ? 'إعدادات الشركة والتوظيف 🏢' : 'الإعدادات والملف الشخصي ⚙️'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
          {isEmployer
            ? 'تحديث بيانات الشركة والشعار والبريد والتواصل ومقر العمل'
            : 'تحديث بياناتك الشخصية وصورتك والسيرة الذاتية وكلمة المرور'}
        </p>
      </div>

      {/* تنبيهات النجاح والخطأ */}
      {message.text && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#16a34a' : '#dc2626',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <CheckCircle size={16} />
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '6px', background: '#f1f5f9', borderRadius: '14px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: '10px',
            border: 'none',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeTab === 'profile' ? '#ffffff' : 'transparent',
            color: activeTab === 'profile' ? '#1D3557' : '#64748b',
            boxShadow: activeTab === 'profile' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {isEmployer ? <Building2 size={16} /> : <User size={16} />}
          {isEmployer ? 'بيانات الشركة واللوجو' : 'البيانات الشخصية والصورة'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: '10px',
            border: 'none',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeTab === 'security' ? '#ffffff' : 'transparent',
            color: activeTab === 'security' ? '#1D3557' : '#64748b',
            boxShadow: activeTab === 'security' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <KeyRound size={16} /> كلمة المرور والأمان
        </button>
      </div>

      {/* TAB 1: Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 🌟 كارت الصورة الشخصية / لوجو الشركة */}
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              {isEmployer ? 'شعار الشركة (Company Logo)' : 'الصورة الشخصية (Profile Picture)'}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* صورة المعاينة */}
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: isEmployer ? '16px' : '50%',
                  overflow: 'hidden',
                  border: '2px solid #00D2B4',
                  boxShadow: '0 2px 8px rgba(0,210,180,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1D3557 0%, #00D2B4 100%)',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : isEmployer ? (
                  formData.company?.charAt(0) || 'ش'
                ) : (
                  formData.name?.charAt(0) || 'م'
                )}
              </div>

              {/* أزرار التحكم بالصورة */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      padding: '8px 16px',
                      background: '#00D2B4',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'Cairo, sans-serif',
                      boxShadow: '0 2px 6px rgba(0,210,180,0.25)',
                    }}
                  >
                    <Camera size={15} />
                    {formData.avatar ? 'تغيير الصورة' : isEmployer ? 'رفع شعار الشركة' : 'رفع الصورة الشخصية'}
                  </button>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      style={{
                        padding: '8px 14px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: 800,
                        fontSize: '12px',
                        borderRadius: '10px',
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'Cairo, sans-serif',
                      }}
                    >
                      <Trash2 size={13} /> إزالة
                    </button>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                  الصيغ المدعومة: JPG, PNG, WEBP (الحد الأقصى: 5 ميجابايت)
                </p>
              </div>
            </div>
          </div>

          {/* فورمة صاحب العمل / الشركة */}
          {isEmployer ? (
            <div style={cardStyle}>
              <h2 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                بيانات الشركة وجهة التوظيف
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    اسم الشركة / المؤسسة <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" name="company" value={formData.company} onChange={handleChange} required
                    placeholder="مثال: شركة النور للحلول التقنية" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    اسم مسؤول التوظيف (HR) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="اسم المسؤول" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    المسمى الوظيفي للمسؤول <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required
                    placeholder="مدير الموارد البشرية / مسؤول التوظيف" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    القطاع والمجال <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" name="companyIndustry" value={formData.companyIndustry} onChange={handleChange}
                    placeholder="تكنولوجيا المعلومات / تجارة / صناعة" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    البريد الإلكتروني الرسمي <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="hr@company.com" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>الموقع الإلكتروني للشركة (Website)</label>
                  <input
                    type="text" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange}
                    placeholder="https://company.com" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    رقم هاتف التواصل للشركة <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text" name="phone" value={formData.phone} onChange={handleChange} required
                    placeholder="01012345678" style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    المقر الرئيسي / المدينة <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <LocationInput
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="اختر من القائمة أو اكتب مقر الشركة"
                    required
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>نبذة تعريفية عن الشركة ومجال عملها</label>
                  <textarea
                    name="bio" value={formData.bio} onChange={handleChange} rows={4}
                    placeholder="اكتب نبذة مختصرة عن الشركة ومشاريعها وقيمها لجذب أفضل الكفاءات والمتقدمين..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* فورمة الباحث عن عمل */
            <>
              {/* المعلومات الشخصية الأساسية */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  المعلومات الشخصية
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>
                      الاسم بالكامل <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      placeholder="الاسم الكامل" style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      المسمى الوظيفي <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required
                      placeholder="مثال: مطور ويب / طبيب / محاسب" style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      البريد الإلكتروني <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      placeholder="example@gmail.com" style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      الموقع الحالي <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <LocationInput
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="اختر من القائمة أو اكتب محافظتك / دولتك"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      رقم الهاتف للتواصل <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text" name="phone" value={formData.phone} onChange={handleChange} required
                      placeholder="01012345678" style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>نبذة تعريفية مختصرة عنك (Bio)</label>
                    <textarea
                      name="bio" value={formData.bio} onChange={handleChange} rows={3}
                      placeholder="اكتب نبذة تلخص خبراتك وشغفك لتظهر في ملفك الشخصي..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* السيرة الذاتية (CV) */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  السيرة الذاتية (CV)
                </h2>

                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                  <Upload size={30} color="#00D2B4" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>اضغط لاختيار ملف السيرة الذاتية الجديد</p>
                  <p style={{ margin: '4px 0 12px', fontSize: '12px', color: '#94a3b8' }}>ملف PDF أو Word بحد أقصى 15 ميجابايت</p>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
                  />

                  {(fileName || formData.cvUrl) && (
                    <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 800, color: '#0f766e', background: '#f0fdfa', padding: '6px 14px', borderRadius: '8px', display: 'inline-block' }}>
                      📄 {fileName || 'تم حفظ السيرة الذاتية بنجاح'}
                    </div>
                  )}
                </div>
              </div>

              {/* المهارات */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  المهارات والتقنيات
                </h2>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                    placeholder="اكتب مهارة (مثال: React, Node.js, محاسبة) واضغط إضافة"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    style={{
                      padding: '10px 18px',
                      background: '#00D2B4',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    + إضافة
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        background: '#f0fdfa',
                        color: '#0f766e',
                        border: '1px solid #ccfbf1',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>لم تقم بإضافة أي مهارات بعد</p>
                  )}
                </div>
              </div>

              {/* الخبرات */}
              <div style={cardStyle}>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  الخبرات المهنية السابقة
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  <input
                    type="text" placeholder="المسمى الوظيفي"
                    value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="اسم الشركة"
                    value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="الفترة (مثال: 2021 - 2024)"
                    value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddExperience}
                  style={{
                    padding: '8px 16px',
                    background: '#1D3557',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Cairo, sans-serif',
                    marginBottom: '14px',
                  }}
                >
                  + إضافة خبرة
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13.5px', color: '#1E293B', display: 'block' }}>{exp.title}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{exp.company} • {exp.period}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* زر الحفظ */}
          <div style={{ paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#00D2B4',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '14px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              <Save size={18} />
              {saving ? 'جاري الحفظ...' : 'حفظ وتحديث الملف'}
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: Security Form */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} style={{ ...cardStyle, maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800, color: '#1D3557', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            تغيير كلمة المرور 🔒
          </h2>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>كلمة المرور الحالية</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00D2B4',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Cairo, sans-serif',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <KeyRound size={13} /> نسيت الحالية؟ التغيير عبر رمز التحقق (OTP) 📩
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>كلمة المرور الجديدة (8 أحرف على الأقل، حرف كبير وصغير ورقم ورمز)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>تأكيد كلمة المرور الجديدة</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#1D3557',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '13.5px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                boxShadow: '0 2px 8px rgba(29, 53, 87, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              <Lock size={16} />
              {saving ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </div>
        </form>
      )}

      {/* 🔐 مودال استعادة وتغيير كلمة المرور برمز التحقق OTP */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={formData.email || user?.email || ''}
      />
    </div>
  );
};

export default SettingsPage;
