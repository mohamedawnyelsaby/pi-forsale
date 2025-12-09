import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initPi = async () => {
      try {
        // التحقق من وجود SDK
        if (!window.Pi) {
          throw new Error("يجب فتح التطبيق من متصفح Pi Browser");
        }

        // تهيئة الـ SDK
        await window.Pi.init({ version: "2.0", sandbox: true });

        // بدء المصادقة
        const scopes = ["username", "payments", "wallet_address"];
        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

        console.log("Auth Success:", auth);
        
        // حفظ البيانات وتحويل المستخدم
        localStorage.setItem('user', JSON.stringify(auth.user));
        setIsLoading(false);
        navigate('/home'); 

      } catch (err) {
        console.error("Auth Error:", err);
        setError("فشل الاتصال بـ Pi Network. تأكد أنك داخل Pi Browser");
        setIsLoading(false);
      }
    };

    // تشغيل الدالة
    initPi();
  }, [navigate]);

  const onIncompletePaymentFound = (payment) => {
    console.log("Incomplete Payment:", payment);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center text-white">
      
      {/* اللوجو */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">Forsale <span className="text-blue-500 text-xl block">AI Market</span></h1>
      </div>

      {/* منطقة التحميل أو الخطأ */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-700">
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            {/* دائرة التحميل */}
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">جاري الاتصال بـ Pi Network...</p>
          </div>
        ) : error ? (
          <div className="text-red-400">
            <div className="text-4xl mb-2">⚠️</div>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="text-green-400">
            <p>تم تسجيل الدخول بنجاح!</p>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-gray-500 text-sm">Powered by Pi Network</p>
    </div>
  );
};

export default Login;
