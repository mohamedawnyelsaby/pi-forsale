(function () {
  const msg = document.getElementById("message");

  function show(text, type = "info") {
    msg.textContent = text;
    msg.className = "message " + type;
  }

  function piAvailable() {
    return window.Pi && typeof window.Pi.createPayment === "function";
  }

  async function openCheckout(title, amount) {
    if (!piAvailable()) {
      show("افتح الصفحة داخل Pi Browser – الـ SDK غير متوفر", "error");
      return;
    }

    show("جاري بدء عملية الدفع…");

    try {
      await Pi.createPayment(
        {
          amount,
          memo: title,
          metadata: { product: title }
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            console.log("approval step", paymentId);

            await fetch("/payment/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId })
            });

            show("تمت الموافقة وتأكيد الخطوة الأولى ✔️", "info");
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("completion step", paymentId, txid);

            await fetch("/payment/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid })
            });

            show("اكتملت عملية الدفع بنجاح ✔️🎉", "success");
          },

          onCancel: () => {
            show("تم إلغاء العملية ❌", "error");
          },

          onError: (err) => {
            console.error(err);
            show("حدث خطأ أثناء الدفع ❌", "error");
          }
        }
      );
    } catch (e) {
      console.error(e);
      show("تعذر بدء الدفع — راجع الكونسول", "error");
    }
  }

  document.querySelectorAll("button.buy").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCheckout(btn.dataset.title, Number(btn.dataset.price));
    });
  });

  if (!piAvailable()) {
    show("Tip: لازم تفتح الموقع من داخل Pi Browser", "notice");
  }
})();
