/**
 * دالة تصدير بيانات المتقدمين إلى ملف CSV/Excel بترميز UTF-8 سليم يدعم اللغة العربية
 */
export const exportApplicantsToCSV = (applicants = [], jobTitle = 'كل_الوظائف') => {
  if (!applicants || applicants.length === 0) {
    alert('لا توجد بيانات متقدمين لتصديرها.');
    return;
  }

  const headers = [
    'اسم المتقدم',
    'البريد الإلكتروني',
    'رقم الهاتف',
    'العنوان والمحافظة',
    'الوظيفة المتقدم عليها',
    'الشركة',
    'سنوات الخبرة',
    'المهارات',
    'الراتب المتوقع',
    'إمكانية البدء',
    'حالة الطلب',
    'تاريخ التقديم',
  ];

  const statusMap = {
    pending: 'قيد الانتظار',
    reviewing: 'قيد المراجعة',
    interview: 'مقابلة عمل',
    accepted: 'تم القبول',
    rejected: 'تم الاعتذار',
  };

  const rows = applicants.map((app) => [
    app.name || app.user?.name || '',
    app.email || app.user?.email || '',
    app.phone || app.user?.phone || '',
    app.location || app.user?.location || '',
    app.job?.title || jobTitle,
    app.job?.company || '',
    app.experience || '',
    (app.skills || (Array.isArray(app.user?.skills) ? app.user.skills.join(' - ') : '')).replace(/,/g, ' - '),
    app.expectedSalary || '',
    app.availability || '',
    statusMap[app.status] || app.status || 'قيد الانتظار',
    app.createdAt ? new Date(app.createdAt).toLocaleDateString('ar-EG') : '',
  ]);

  // بناء محتوى الـ CSV
  const csvContent =
    '\uFEFF' + // UTF-8 BOM لدعم اللغة العربية في Excel
    [headers.join(','), ...rows.map((row) => row.map((val) => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `تقرير_المتقدمين_${jobTitle.replace(/[\s/\\:]+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
