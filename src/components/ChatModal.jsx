import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Loader2, Check, CheckCheck, MapPin, Building, User as UserIcon } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ applicationId, jobTitle: propJobTitle, otherPartyName: propOtherPartyName, otherPartyAvatar: propOtherPartyAvatar, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/messages/${applicationId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        if (res.data.chatDetails) {
          setChatDetails(res.data.chatDetails);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await api.post(`/api/messages/${applicationId}`, { content });
      if (res.data.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر إرسال الرسالة');
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // تفاصيل المستخدم والطرف الآخر بدقة ديناميكية كاملة
  const currentUserId = user?._id || user?.id;
  const isCandidate = user?.role === 'job_seeker' || chatDetails?.isApplicant;

  // استخراج الاسم الحقيقي للشركة بدون أي نصوص افتراضية
  const rawCompany = chatDetails?.job?.company || propOtherPartyName;
  const realCompanyName = (rawCompany && rawCompany !== 'الشركة الناشرة' && rawCompany !== 'شركة' && rawCompany !== 'صاحب العمل' && rawCompany !== 'شركة التوظيف')
    ? rawCompany
    : (user?.company || 'الشركة');

  const realApplicantName = chatDetails?.applicant?.name || propOtherPartyName || 'المرشح للوظيفة';

  const displayTitle = isCandidate ? realCompanyName : realApplicantName;
  const displaySubtitle = chatDetails?.job?.title || propJobTitle || 'الوظيفة';
  const displayAvatar = isCandidate
    ? (chatDetails?.job?.logoUrl || propOtherPartyAvatar)
    : (chatDetails?.applicant?.avatar || propOtherPartyAvatar);
  const displayLocation = isCandidate ? chatDetails?.job?.location : null;

  // تجميع الرسائل بالتواريخ
  const groupByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    msgs.forEach((msg) => {
      const msgDate = msg.createdAt
        ? new Date(msg.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      if (msgDate !== currentDate) {
        groups.push({ type: 'date', label: msgDate });
        currentDate = msgDate;
      }
      groups.push({ type: 'message', data: msg });
    });
    return groups;
  };

  const grouped = groupByDate(messages);

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 10, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'Cairo, sans-serif',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '630px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#ffffff',
        }}
      >
        {/* ======= HEADER (رأس الشات الذكي والديناميكي) ======= */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1D3557 0%, #15263F 100%)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          }}
        >
          {/* Avatar / Logo */}
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayTitle}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: isCandidate ? '12px' : '50%',
                objectFit: 'cover',
                border: '2px solid #00D2B4',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 210, 180, 0.35)',
              }}
            />
          ) : (
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: isCandidate ? '12px' : '50%',
                background: 'linear-gradient(135deg, #00D2B4, #00937E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '19px',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 210, 180, 0.4)',
              }}
            >
              {displayTitle?.charAt(0) || (isCandidate ? <Building size={20} /> : <UserIcon size={20} />)}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayTitle}
              </h3>
              <span style={{ fontSize: '10.5px', background: 'rgba(0, 210, 180, 0.2)', color: '#00D2B4', padding: '1px 7px', borderRadius: '6px', fontWeight: 800 }}>
                {isCandidate ? 'جهة العمل 🏢' : 'متقدم للوظيفة 👤'}
              </span>
            </div>
            
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>الوظيفة: <strong style={{ color: '#00D2B4' }}>{displaySubtitle}</strong></span>
              {displayLocation && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#cbd5e1' }}>
                  • <MapPin size={11} color="#00D2B4" /> {displayLocation}
                </span>
              )}
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <X size={17} />
          </button>
        </div>

        {/* ======= MESSAGES AREA (مساحة الرسائل بتمايز لوني واقعي 100%) ======= */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 18px',
            background: '#f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <Loader2 size={28} color="#00D2B4" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>جاري تحميل المحادثة...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={28} color="#94a3b8" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '15px', color: '#1D3557' }}>لا توجد رسائل سابقة</p>
                <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#64748b' }}>ابدأ المحادثة للتنسيق المباشر والمريح حول الوظيفة والمقابلة</p>
              </div>
            </div>
          ) : (
            grouped.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} style={{ textAlign: 'center', margin: '8px 0 4px' }}>
                    <span style={{ background: 'rgba(0,0,0,0.06)', color: '#64748b', fontSize: '11px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px' }}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
              const isMe = Boolean(currentUserId && senderId && String(senderId) === String(currentUserId));
              const senderName = isMe
                ? 'أنت'
                : (isCandidate ? displayTitle : (msg.sender?.name || displayTitle));
              const timeStr = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={msg._id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isMe ? 'flex-start' : 'flex-end',
                    maxWidth: '82%',
                  }}
                >
                  {/* اسم المرسل يظهر فقط لرسائل الطرف الآخر */}
                  {!isMe && (
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, marginBottom: '2px', marginRight: '4px', textAlign: 'right' }}>
                      {senderName}
                    </span>
                  )}

                  {/* 🌟 الفقاعة اللونية الواقعية:
                      - رسائلي (isMe): زمردي داكن فخم (#00A892) بنص أبيض ناصع
                      - رسائل الطرف الآخر (!isMe): بورسلين ناصع مع حد رمادي ناعم ونصوص داكنة */}
                  <div
                    style={{
                      padding: '10px 15px',
                      borderRadius: isMe
                        ? '16px 16px 16px 4px'
                        : '16px 16px 4px 16px',
                      background: isMe
                        ? 'linear-gradient(135deg, #00A892 0%, #008f7c 100%)'
                        : '#ffffff',
                      color: isMe ? '#ffffff' : '#0f172a',
                      border: isMe ? 'none' : '1.5px solid #e2e8f0',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      fontWeight: 600,
                      boxShadow: isMe
                        ? '0 3px 10px rgba(0, 168, 146, 0.28)'
                        : '0 2px 6px rgba(0,0,0,0.04)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* وقت الرسالة وحالة القراءة */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                      justifyContent: isMe ? 'flex-start' : 'flex-end',
                      padding: '0 4px',
                    }}
                  >
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>{timeStr}</span>
                    {isMe && (
                      msg.read
                        ? <CheckCheck size={13} color="#00D2B4" />
                        : <Check size={13} color="#94a3b8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ======= INPUT BAR (شريط كتابة وإرسال الرسائل) ======= */}
        <form
          onSubmit={handleSend}
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="اكتب رسالتك هنا..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              fontSize: '13.5px',
              fontFamily: 'Cairo, sans-serif',
              color: '#1E293B',
              background: '#f8fafc',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00D2B4';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 210, 180, 0.15)';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#f8fafc';
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: newMessage.trim() && !sending
                ? 'linear-gradient(135deg, #00D2B4, #00937E)'
                : '#e2e8f0',
              border: 'none',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: newMessage.trim() && !sending ? '#ffffff' : '#94a3b8',
              flexShrink: 0,
              boxShadow: newMessage.trim() && !sending ? '0 4px 12px rgba(0, 210, 180, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {sending
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={18} style={{ transform: 'scaleX(-1)' }} />
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
