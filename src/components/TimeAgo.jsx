import { useEffect, useState } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const formatRelativeTime = (date, now) => {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return '';

  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < SECOND) return 'الآن';
  const units = [
    ['year', YEAR],
    ['month', MONTH],
    ['day', DAY],
    ['hour', HOUR],
    ['minute', MINUTE],
    ['second', SECOND],
  ];
  const [unit, duration] = units.find(([, unitDuration]) => elapsed >= unitDuration) || ['second', SECOND];
  const value = Math.floor(elapsed / duration);
  const formattedValue = new Intl.NumberFormat('ar-EG', {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).format(value);

  return `منذ ${formattedValue}`;
};

const TimeAgo = ({ date, style, className, title }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(interval);
  }, []);

  const dateValue = date ? new Date(date) : null;
  const label = formatRelativeTime(date, now);
  const absoluteDate = dateValue && Number.isFinite(dateValue.getTime())
    ? dateValue.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : undefined;
  const isoDate = dateValue && Number.isFinite(dateValue.getTime())
    ? dateValue.toISOString()
    : undefined;

  if (!label) return null;

  return (
    <time dateTime={isoDate} title={title || absoluteDate} style={style} className={className}>
      {label}
    </time>
  );
};

export default TimeAgo;
