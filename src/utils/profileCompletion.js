const normalizePhone = (value = '') => String(value)
  .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
  .trim();

export const getProfileCompletion = (profile = {}, role) => {
  const employer = role === 'employer';
  const phone = normalizePhone(profile.phone);
  const phoneDigits = phone.replace(/\D/g, '');
  const requiredFields = [
    { key: 'name', label: employer ? 'اسم مسؤول الحساب' : 'الاسم بالكامل', missing: !String(profile.name || '').trim() },
    { key: 'jobTitle', label: employer ? 'المسمى الوظيفي للمسؤول' : 'المسمى الوظيفي', missing: !String(profile.jobTitle || '').trim() },
    { key: 'email', label: 'البريد الإلكتروني', missing: !/^\S+@\S+\.\S+$/.test(String(profile.email || '').trim()) },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      missing: !/^[+\d\s().-]+$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15,
    },
    { key: 'location', label: 'الموقع', missing: !String(profile.location || '').trim() },
    ...(employer
      ? [
        { key: 'company', label: 'اسم الشركة', missing: !String(profile.company || '').trim() },
        { key: 'companyIndustry', label: 'القطاع والمجال', missing: !String(profile.companyIndustry || '').trim() },
      ]
      : [{ key: 'cvUrl', label: 'السيرة الذاتية', missing: !profile.cvUrl }]),
  ];
  const missingFields = requiredFields.filter(field => field.missing);

  return {
    completion: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100),
    missingFields,
  };
};
