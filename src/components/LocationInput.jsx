import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search, X } from 'lucide-react';

export const POPULAR_LOCATIONS = [
  // 🇪🇬 محافظات ومدن مصر
  'القاهرة - مصر',
  'الجيزة - مصر',
  'الإسكندرية - مصر',
  'التجمع الخامس والقاهرة الجديدة - مصر',
  'مدينة 6 أكتوبر والشيخ زايد - مصر',
  'المعادي ومدينة نصر - مصر',
  'العاصمة الإدارية الجديدة - مصر',
  'المنصورة (الدقهلية) - مصر',
  'طنطا (الغربية) - مصر',
  'الزقازيق (الشرقية) - مصر',
  'بنها (القليوبية) - مصر',
  'شبين الكوم (المنوفية) - مصر',
  'دمياط - مصر',
  'بورسعيد - مصر',
  'الإسماعيلية - مصر',
  'السويس - مصر',
  'أسيوط - مصر',
  'سوهاج - مصر',
  'قنا - مصر',
  'أسوان - مصر',
  'الأقصر - مصر',
  'بني سويف - مصر',
  'المنيا - مصر',
  'الفيوم - مصر',
  'الغردقة (البحر الأحمر) - مصر',
  'شرم الشيخ (جنوب سيناء) - مصر',
  'مرسى مطروح - مصر',
  'كفر الشيخ - مصر',
  'دمنهور (البحيرة) - مصر',
  'العريش (شمال سيناء) - مصر',
  'الوادي الجديد - مصر',

  // 🇸🇦 🇦🇪 دول الخليج والوطن العربي
  'الرياض - السعودية',
  'جدة - السعودية',
  'الدمام والخبر - السعودية',
  'مكة المكرمة - السعودية',
  'المدينة المنورة - السعودية',
  'دبي - الإمارات',
  'أبوظبي - الإمارات',
  'الشارقة - الإمارات',
  'الدوحة - قطر',
  'مدينة الكويت - الكويت',
  'المنامة - البحرين',
  'مسقط - سلطنة عمان',
  'عمان - الأردن',
  'بيروت - لبنان',
  'بغداد - العراق',
  'تونس - تونس',
  'الجزائر - الجزائر',
  'الدار البيضاء والرباط - المغرب',

  // 🌐 العمل عن بُعد والدولي
  'عن بُعد (Remote - داخل مصر)',
  'عن بُعد (Remote - الوطن العربي)',
  'عن بُعد (Remote - دولي)',
  'برلين - ألمانيا',
  'أمستردام - هولندا',
  'لندن - المملكة المتحدة',
  'تورونتو - كندا',
  'الولايات المتحدة الأمريكية',
];

const LocationInput = ({
  value = '',
  onChange,
  name = 'location',
  placeholder = 'ابحث أو اكتب الدولة / المحافظة...',
  required = false,
  readOnly = false,
  compact = false,
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = (searchTerm || value || '').trim().toLowerCase();

  const filteredLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(query)
  );

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex + 1];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const handleSelect = (loc) => {
    if (readOnly) return;
    if (onChange) {
      onChange({ target: { name, value: loc } });
    }
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
  };

  const handleInputChange = (e) => {
    if (readOnly) return;
    const val = e.target.value;
    setSearchTerm(val);
    setActiveIndex(0);
    if (onChange) {
      onChange(e);
    }
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (readOnly) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (filteredLocations.length > 0) {
          setActiveIndex((prev) => (prev < filteredLocations.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (filteredLocations.length > 0) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredLocations.length - 1));
        }
        break;

      case 'Enter':
        if (isOpen && activeIndex >= 0 && filteredLocations[activeIndex]) {
          e.preventDefault();
          handleSelect(filteredLocations[activeIndex]);
        } else if (isOpen) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
        break;

      case 'Tab':
        if (isOpen && activeIndex >= 0 && filteredLocations[activeIndex]) {
          handleSelect(filteredLocations[activeIndex]);
        } else {
          setIsOpen(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (readOnly) return;
    setSearchTerm('');
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
    setActiveIndex(-1);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', fontFamily: 'Cairo, sans-serif', ...style }} dir="rtl">
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        
        {/* أيقونة البحث */}
        <div
          style={{
            position: 'absolute',
            right: compact ? '10px' : '12px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D2B4',
          }}
        >
          <Search size={compact ? 14 : 16} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!readOnly) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          autoComplete="off"
          style={{
            width: '100%',
            height: compact ? '38px' : '44px',
            paddingRight: compact ? '32px' : '38px',
            paddingLeft: compact ? '48px' : '56px',
            paddingTop: 0,
            paddingBottom: 0,
            borderRadius: compact ? '10px' : '12px',
            border: '1px solid #e2e8f0',
            fontSize: compact ? '12.5px' : '13.5px',
            fontWeight: compact ? 700 : 500,
            fontFamily: 'Cairo, sans-serif',
            color: '#1E293B',
            background: readOnly ? '#f1f5f9' : '#ffffff',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = '#00D2B4';
            e.target.style.boxShadow = '0 0 0 2px rgba(0,210,180,0.15)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* أزرار الحذف والسهم */}
        <div style={{ position: 'absolute', left: compact ? '8px' : '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
          {value && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              title="مسح"
              style={{
                padding: '2px',
                borderRadius: '50%',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={compact ? 12 : 14} />
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                padding: '2px',
                color: '#94a3b8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronDown size={compact ? 14 : 16} />
            </button>
          )}
        </div>
      </div>

      {/* القائمة المنسدلة */}
      {isOpen && !readOnly && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            left: 0,
            maxHeight: '240px',
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #00D2B4',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 100,
            padding: '6px',
            minWidth: '220px',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#94a3b8',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none',
            }}
          >
            <span>🔍 تنقل بالأسهم أو اختر:</span>
            <span style={{ color: '#00D2B4', fontWeight: 900 }}>({filteredLocations.length})</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f8fafc', borderRadius: '8px' }}>
              <p style={{ margin: 0 }}>سيتم استخدام المكان كما كتبته:</p>
              <p style={{ margin: '2px 0 0', color: '#0f766e', fontWeight: 900 }}>"{value}"</p>
            </div>
          ) : (
            filteredLocations.map((loc, idx) => {
              const isSelected = value === loc;
              const isKeyboardActive = activeIndex === idx;

              return (
                <div
                  key={loc}
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? '#f0fdfa' : isKeyboardActive ? '#f0fdfa' : 'transparent',
                    color: isSelected || isKeyboardActive ? '#0f766e' : '#334155',
                    fontWeight: isSelected || isKeyboardActive ? 800 : 600,
                    marginBottom: '2px',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color={isSelected || isKeyboardActive ? '#00D2B4' : '#94a3b8'} />
                    <span>{loc}</span>
                  </div>
                  {isSelected && <Check size={13} color="#00D2B4" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
