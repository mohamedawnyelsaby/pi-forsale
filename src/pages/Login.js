import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // هيحاول 20 مرة (يعني 10 ثواني)

    const initPi = async () => {
      // دالة بتستنى لحد ما window.Pi تكون موجودة
      const waitForPi = () => {
        return new Promise((resolve, reject) => {
          const checkPi = setInterval(() => {
            attempts++;
            if (window.Pi) {
              clearInterval(checkPi);
              resolve(window.Pi);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkPi);
              reject(new Error("تأخر تحميل مكتبة Pi Network. تأكد من جودة الإنترنت."));
            }
          }, 500); // بيفحص كل نص ثانية
        });
      };

      try {
        console.log("جاري البحث عن Pi SDK...");
        
        // 1. انتظر تحميل المكتبة
        const Pi = await waitForPi();
        console.log("تم العثور على Pi SDK");

        // 2. تهيئة المكتبة
        await Pi.init({ version: "2.0", sandbox: true });
        console.log("تمت تهيئة Pi بنجاح");

        // 3. المصادقة
        const scopes = ["username", "payments", "wallet_address"];
        const auth = await Pi.authenticate(scopes, (payment) => {
          console.log("دفع غير مكتمل:", payment);
        });

        console.log("تم تسجيل الدخول:", auth);
        setStatus("success");
        
        // حفظ المستخدم وتوجيهه
        setTimeout(() => {
            navigate('/home'); 
        }, 1500);

      } catch (err) {
        console.error("فشل:", err);
        setStatus("error");
        setErrorMessage(err.message || "حدث خطأ غير متوقع");
        
        // لو الخطأ إن Pi مش موجودة أصلاً
        if (!window.Pi) {
             setErrorMessage("يجب فتح هذا الموقع داخل متصفح Pi Browser حصراً.");
        }
      }
    };

    initPi();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-5">
      
      <h1 className="text-3xl font-bold text-yellow-500 mb-10">Forsale Pi</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 w-full max-w-sm text-center">
        
        {/* حالة التحميل */}
        {status === "loading" && (
          <div>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">جاري الاتصال بـ Pi Network...</p>
            <p className="text-xs text-gray-500 mt-2">يرجى الانتظار</p>
          </div>
        )}

        {/* حالة الخطأ */}
        {status === "error" && (
          <div>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl text-red-500 font-bold mb-2">فشل الاتصال</h3>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400 w-full"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* حالة النجاح */}
        {status === "success" && (
          <div>
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl text-green-500 font-bold">تم تسجيل الدخول!</h3>
            <p className="text-gray-400 mt-2">جاري تحويلك للصفحة الرئيسية...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
