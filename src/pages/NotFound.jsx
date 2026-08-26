import { useNavigate } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="min-h-[75vh] flex items-center justify-center p-6 font-sans"
    >
      <div className="bg-white rounded-3xl border border-slate-200 p-10 max-w-lg w-full text-center shadow-xl">
        
        {/* Badge 404 Icon */}
        <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-dashed border-[#00D2B4] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Compass size={40} className="text-[#00D2B4]" />
        </div>

        <span className="bg-amber-50 text-amber-700 px-3.5 py-1 rounded-full text-xs font-black inline-block mb-3.5 border border-amber-200">
          خطأ 404 - الصفحة غير موجودة
        </span>

        <h1 className="m-0 mb-2 text-2xl font-black text-slate-800 leading-tight">
          يبدو أنك ضللت الطريق! 🗺️
        </h1>

        <p className="m-0 mb-7 text-sm text-slate-500 leading-relaxed font-medium">
          الصفحة التي تحاول الوصول إليها غير موجودة، أو ربما تم تغيير رابطها أو حذفها.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-[#00D2B4] hover:bg-[#00bda2] text-white font-black text-sm border-0 cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Home size={18} /> العودة للرئيسية
          </button>

          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm cursor-pointer flex items-center gap-2 shadow-sm transition-all"
          >
            <Search size={18} /> تصفح الوظائف
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
