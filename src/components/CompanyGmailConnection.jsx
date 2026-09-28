import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, Mail, Unlink } from 'lucide-react';
import api from '../api/axiosConfig';
import { EMPLOYER } from '../api/endpoints';

const CompanyGmailConnection = () => {
  const [searchParams] = useSearchParams();
  const [connection, setConnection] = useState({ loading: true, connected: false, email: '' });
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(EMPLOYER.GMAIL_STATUS);
      setConnection({ loading: false, connected: data.connected, email: data.email || '' });
    } catch (error) {
      setConnection({ loading: false, connected: false, email: '' });
      setMessage(error.response?.data?.message || 'تعذر التحقق من ربط Gmail.');
      setMessageType('error');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const result = searchParams.get('gmail');
    if (result === 'connected') {
      setMessage('تم ربط Gmail بنجاح. ستُرسل قرارات التوظيف من هذا البريد.');
      setMessageType('success');
    } else if (result === 'error') {
      setMessage('لم يكتمل ربط Gmail. تأكدي من اختيار الحساب الصحيح ومنح صلاحية الإرسال.');
      setMessageType('error');
    }
  }, [fetchStatus, searchParams]);

  const handleConnect = async () => {
    setWorking(true);
    setMessage('');
    try {
      const { data } = await api.get(EMPLOYER.GMAIL_CONNECT_URL);
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error.response?.data?.message || 'تعذر بدء ربط Gmail.');
      setMessageType('error');
      setWorking(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('هل تريدين فصل Gmail؟ لن يمكن إرسال قرارات التوظيف بالبريد حتى ربط حساب مرة أخرى.')) return;
    setWorking(true);
    setMessage('');
    try {
      const { data } = await api.delete(EMPLOYER.GMAIL_CONNECTION);
      setConnection({ loading: false, connected: false, email: '' });
      setMessage(data.message || 'تم فصل Gmail.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'تعذر فصل Gmail.');
      setMessageType('error');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section
      aria-labelledby="company-gmail-heading"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ color: '#1D3557', background: '#eff6ff', borderRadius: '12px', padding: '10px' }}>
            <Mail size={20} />
          </span>
          <div>
            <h2 id="company-gmail-heading" style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#1D3557' }}>
              بريد الشركة لإشعارات المتقدمين
            </h2>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.7 }}>
              اربطي Gmail الخاص بالشركة لإرسال دعوات المقابلات وقرارات القبول والرفض مباشرةً منه.
            </p>
            <div style={{ marginTop: '7px', fontSize: '12px', fontWeight: 800, color: connection.connected ? '#15803d' : '#b45309' }}>
              {connection.loading
                ? 'جارٍ التحقق من حالة الربط...'
                : connection.connected
                  ? `مرتبط: ${connection.email}`
                  : 'لا يوجد بريد شركة مرتبط حالياً'}
            </div>
          </div>
        </div>

        {connection.connected ? (
          <button type="button" onClick={handleDisconnect} disabled={working} style={buttonStyle('#fff', '#b91c1c', '#fecaca')}>
            {working ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />}
            فصل Gmail
          </button>
        ) : (
          <button type="button" onClick={handleConnect} disabled={working || connection.loading} style={buttonStyle('#1D3557', '#fff', '#1D3557')}>
            {working ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            ربط Gmail
          </button>
        )}
      </div>
      {message && (
        <div
          role={messageType === 'error' ? 'alert' : 'status'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            marginTop: '14px',
            color: messageType === 'error' ? '#b91c1c' : '#15803d',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {messageType === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {message}
        </div>
      )}
    </section>
  );
};

const buttonStyle = (background, color, borderColor) => ({
  border: `1px solid ${borderColor}`,
  borderRadius: '10px',
  padding: '10px 14px',
  background,
  color,
  fontFamily: 'Cairo, sans-serif',
  fontSize: '12px',
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export default CompanyGmailConnection;
