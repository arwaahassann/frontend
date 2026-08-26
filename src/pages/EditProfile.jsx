import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const EditProfile = () => {
  const navigate    = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '', jobTitle: '', email: '', location: 'القاهره - مصر', phone: '', bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        const u = res.data.user;
        setFormData({
          name:     u.name     || '',
          jobTitle: u.jobTitle || '',
          email:    u.email    || '',
          location: u.location || 'القاهره - مصر',
          phone:    u.phone    || '',
          bio:      u.bio      || '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/api/users/profile', formData);
      setUser(res.data.user);
      setMessage('تم حفظ التعديلات بنجاح 🎉');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontFamily: 'Cairo, sans-serif' }}>جاري التحميل...</div>;

  const boxStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #d1d5db', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '24px' };
  const inputStyle = { width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontFamily: 'Cairo, sans-serif', color: '#334155', background: '#f8fafc', outline: 'none', direction: 'rtl', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'right' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', dir: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      
      {message && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: message.includes('نجاح') ? '#f0fdf4' : '#fef2f2', color: message.includes('نجاح') ? '#16a34a' : '#ef4444', border: `1px solid ${message.includes('نجاح') ? '#bbf7d0' : '#fecaca'}`, fontSize: '13px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* المربع الأول: المعلومات الشخصيه */}
        <div style={boxStyle}>
          <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>المعلومات الشخصيه</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>الاسم بالكامل</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>الاسم الوظيفي</label>
              <input
                type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                placeholder="مثال: مطور مواقع / مصمم UI/UX"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>البريد الالكتروني</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>الموقع الحالي</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="location" value={formData.location} onChange={handleChange}
                  style={{ ...inputStyle, appearance: 'none', paddingLeft: '40px' }}
                >
                  <option value="القاهره - مصر">القاهره - مصر</option>
                  <option value="الإسكندرية - مصر">الإسكندرية - مصر</option>
                  <option value="الرياض - السعودية">الرياض - السعودية</option>
                  <option value="جدة - السعودية">جدة - السعودية</option>
                  <option value="دبي - الإمارات">دبي - الإمارات</option>
                </select>
                <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>رقم الهاتف</label>
              <input
                type="text" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="01551051828"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>نبذة شخصية</label>
              <textarea
                name="bio" value={formData.bio} onChange={handleChange} rows={3}
                placeholder="اكتب نبذة مختصرة عنك وعن خبراتك..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit" disabled={saving}
            style={{ padding: '14px 48px', background: '#00D2B4', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', borderRadius: '9999px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'Cairo, sans-serif', boxShadow: '0 4px 20px rgba(0,210,180,0.35)' }}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProfile;
