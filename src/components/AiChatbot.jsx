import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, Minimize2, ChevronDown, Building2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AiChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isEmployer = user?.role === 'employer';

  const getInitialMessage = () => {
    if (isEmployer) {
      return {
        sender: 'ai',
        text: `أهلاً بك يا ${user?.name?.split(' ')[0] || 'شريكنا العزيز'}! 🏢✨\nأنا مستشارك الذكي لإدارة التوظيف واستقطاب المواهب في "وظيفة العمر". كيف يمكنني مساعدتك في توظيف واختيار أفضل الكفاءات اليوم؟`,
        suggestions: ['كيف أكتب إعلان وظيفة جذاب؟', 'كيف أختار أفضل مرشح؟', 'أسئلة مقابلة عمل مقترحة', 'كيف أحدد الراتب المناسب؟'],
      };
    }
    return {
      sender: 'ai',
      text: `أهلاً بك يا ${user?.name?.split(' ')[0] || 'صديقنا'}! 🤖✨\nأنا مستشارك المهني الذكي في "وظيفة العمر". كيف يمكنني مساعدتك في تطوير مسارك المهني أو الاستعداد لمقابلاتك اليوم؟`,
      suggestions: ['نصائح لتحسين الـ CV', 'التحضير لمقابلة العمل', 'نصائح التفاوض على الراتب', 'استكشاف الوظائف'],
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [user?.role, user?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/career-coach', { message: text });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.reply,
            suggestions: res.data.suggestions || [],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'عذراً، حدث خطأ مؤقت في الاتصال بالمستشار الذكي. يرجى المحاولة بعد قليل.',
          suggestions: isEmployer ? ['كيف أختار أفضل مرشح؟', 'كيف أحدد الراتب؟'] : ['نصائح للسيرة الذاتية', 'التحضير للمقابلة'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, sans-serif', zIndex: 9998 }}>
      
      {/* 1. الزر العائم الأنيق المدمج لفتح الشات بوت */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={isEmployer ? 'مستشار التوظيف الذكي (AI)' : 'المستشار المهني الذكي (AI)'}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            background: 'linear-gradient(135deg, #1D3557 0%, #00D2B4 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            padding: isHovered ? '10px 18px' : '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 210, 180, 0.35)',
            fontSize: '13px',
            fontWeight: 800,
            transition: 'all 0.25s ease',
            zIndex: 9998,
          }}
        >
          <Sparkles size={18} color="#ffffff" />
          {isHovered && (
            <span style={{ whiteSpace: 'nowrap', animation: 'fadeInModal 0.2s ease-out' }}>
              {isEmployer ? 'مستشار التوظيف AI' : 'المستشار المهني AI'}
            </span>
          )}
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
        </button>
      )}

      {/* 2. نافذة الشات بوت المنبثقة */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '540px',
            maxHeight: 'calc(100vh - 80px)',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'fadeInModal 0.2s ease-out',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #1D3557 0%, #264362 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(0, 210, 180, 0.2)',
                  border: '1px solid #00D2B4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isEmployer ? <Building2 size={18} color="#00D2B4" /> : <Bot size={18} color="#00D2B4" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900 }}>
                  {isEmployer ? 'مستشار التوظيف الذكي' : 'المستشار المهني (AI)'}
                </h3>
                <span style={{ fontSize: '11px', color: '#00D2B4', fontWeight: 600 }}>
                  ● متصل ومستعد للمساعدة
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                    background: msg.sender === 'user' ? '#1D3557' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1E293B',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {msg.text}
                </div>

                {/* الاقتراحات السريعة التفاعلية */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '6px',
                      maxWidth: '90%',
                    }}
                  >
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        style={{
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
                          color: '#0f766e',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'Cairo, sans-serif',
                          transition: 'all 0.15s',
                        }}
                      >
                        💡 {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
                <Sparkles size={14} color="#00D2B4" /> جاري التفكير وصياغة الرد...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              background: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isEmployer ? 'اكتب استفسارك عن التوظيف...' : 'اكتب سؤالك المهني هنا...'}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontFamily: 'Cairo, sans-serif',
                outline: 'none',
                color: '#1E293B',
              }}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#00D2B4',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !inputMessage.trim() || loading ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default AiChatbot;
