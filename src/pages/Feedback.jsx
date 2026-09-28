import { useEffect, useState } from 'react';
import { MessageSquare, Lightbulb, AlertTriangle, Send, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { REPORTS } from '../api/endpoints';

const statusLabel = {
  pending: 'قيد الانتظار',
  reviewing: 'قيد المراجعة',
  resolved: 'تم الحل',
  rejected: 'مغلقة',
};

const statusColor = {
  pending: { bg: '#fef9c3', color: '#a16207' },
  reviewing: { bg: '#dbeafe', color: '#1d4ed8' },
  resolved: { bg: '#dcfce7', color: '#15803d' },
  rejected: { bg: '#fee2e2', color: '#b91c1c' },
};

const Feedback = () => {
  const [type, setType] = useState('complaint');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    try {
      const res = await api.get(REPORTS.MINE);
      if (res.data?.success) setReports(res.data.reports || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (subject.trim().length < 3) {
      setError('العنوان يجب أن يكون 3 أحرف على الأقل');
      return;
    }
    if (message.trim().length < 10) {
      setError('التفاصيل يجب أن تكون 10 أحرف على الأقل');
      return;
    }

    setSending(true);
    try {
      const res = await api.post(REPORTS.CREATE, { type, subject: subject.trim(), message: message.trim() });
      setSuccess(res.data?.message || 'تم الإرسال بنجاح');
      setSubject('');
      setMessage('');
      fetchMine();
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر إرسال البلاغ، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1D3557', margin: '0 0 6px' }}>الشكاوي والمقترحات</h1>
      <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>بلّغ عن مشكلة أو اقترح تحسين للمنصة، والإدارة هترد عليك.</p>

      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
        <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '4px', display: 'flex', marginBottom: '20px' }}>
          {[
            { val: 'complaint', label: 'شكوى', icon: AlertTriangle },
            { val: 'suggestion', label: 'مقترح', icon: Lightbulb },
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setType(r.val)}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                background: type === r.val ? '#fff' : 'transparent',
                color: type === r.val ? '#00D2B4' : '#94a3b8',
                boxShadow: type === r.val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <r.icon size={16} />
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>العنوان</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={type === 'suggestion' ? 'مثال: إضافة فلتر حسب المرتب' : 'مثال: مشكلة في التقديم على وظيفة'}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>التفاصيل</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="اكتب التفاصيل بوضوح حتى تتمكن الإدارة من المتابعة..."
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              background: '#00D2B4',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            إرسال
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1D3557', margin: '0 0 14px' }}>رسائلي السابقة</h2>
      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>جاري التحميل...</p>
      ) : reports.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '28px', textAlign: 'center', color: '#94a3b8' }}>
          <MessageSquare size={28} style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: 700 }}>لا توجد شكاوى أو مقترحات بعد</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((r) => {
            const st = statusColor[r.status] || statusColor.pending;
            return (
              <div key={r._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: r.type === 'suggestion' ? '#0f766e' : '#b45309' }}>
                      {r.type === 'suggestion' ? 'مقترح' : 'شكوى'}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{r.subject}</h3>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    {statusLabel[r.status] || r.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.7 }}>{r.message}</p>
                {r.adminReply && (
                  <div style={{ marginTop: '12px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#0f766e' }}>رد الإدارة</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>{r.adminReply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feedback;
