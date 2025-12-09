// تهيئة Pi SDK
if (typeof Pi !== "undefined") {
    Pi.init({ version: "2.0", sandbox: true });
} else {
    console.warn("Pi SDK لم يتم تحميله. افتح الموقع من Pi Browser.");
}

let currentUser = null;

// تسجيل الدخول
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", async () => {
    try {
        const scopes = ["username", "payments", "wallet"];
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        currentUser = auth.user;
        alert("تم تسجيل الدخول: " + currentUser.username);
    } catch (err) {
        console.error("Login error: ", err);
    }
});

function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment detected:", payment);
}

// فتح صفحة المنتج
function openProduct(id) {
    document.querySelector(".products").classList.add("hidden");
    document.getElementById("productDetails").classList.remove("hidden");

    document.getElementById("pdImage").src = "https://via.placeholder.com/500";
    document.getElementById("pdTitle").innerText = "iPhone 15 Pro Max";
    document.getElementById("pdPrice").innerText = "105000 Pi";
}

function closeProduct() {
    document.querySelector(".products").classList.remove("hidden");
    document.getElementById("productDetails").classList.add("hidden");
}

// الدفع
function checkout() {
    if (!currentUser) {
        alert("يجب تسجيل الدخول أولاً.");
        return;
    }

    const amount = 105000;

    Pi.createPayment({
        amount: amount,
        memo: "شراء منتج من Forsale AI",
        metadata: { product_id: "p1", buyer: currentUser.username }
    }, {
        onReadyForServerApproval(paymentId) {
            console.log("Approval needed:", paymentId);

            fetch("/api/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
            }).then(res => res.json()).then(data => {
                console.log("Server approve:", data);
            });
        },

        onReadyForServerCompletion(paymentId, txid) {
            console.log("Completion:", paymentId, txid);

            fetch("/api/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, txid, user: currentUser })
            }).then(res => res.json()).then(data => {
                console.log("Server complete:", data);
                alert("تم الدفع بنجاح!");
            });
        },

        onCancel() {
            alert("تم إلغاء العملية.");
        },

        onError(error) {
            console.error("Payment error:", error);
            alert("حدث خطأ أثناء الدفع.");
        }
    });
}
