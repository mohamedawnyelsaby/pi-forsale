// عرض الوقت (الكود سابقاً)
function showTime() {
    document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
    showTime();
}, 1000);


// دالة معالجة دفع Pi Network داخل Pi Browser
function processPiPayment(amount) {
    if (typeof window.pi === "undefined" || !window.pi.pay) {
        alert("يرجى استخدام Pi Browser للدفع.");
        return;
    }

    window.pi.pay({
        appID: "com.forsaleai.app",  // عدل هذا بمعرف تطبيق Pi الخاص بك
        appMeta: "شراء iPhone 15 Pro من Forsale AI",
        amount: amount, // القيمة بالـ Pi
        memo: "دفع شراء iPhone 15 Pro"
    }, function(response) {
        if (response && response.err === 0) {
            alert("تم الدفع بنجاح!");
            // أغلق نافذة الدفع أو حدث حالتك هنا
            closeCheckoutModal();
        } else {
            alert("فشل الدفع أو تم الإلغاء.");
        }
    });
}

// دالة إغلاق مودال الدفع (تأكد أن لديك دالة بهذا الاسم أو أنشئها)
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
