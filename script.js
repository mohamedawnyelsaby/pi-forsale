(function () {
  const msg = document.getElementById("message");

  function show(txt, type = "info") {
    msg.textContent = txt;
    msg.className = "message " + type;
  }

  function piAvailable() {
    return window.Pi && window.Pi.createPayment;
  }

  async function openCheckout(title, amount) {
    if (!piAvailable()) {
      show("افتح الصفحة داخل Pi Browser – SDK مش شغال", "error");
      return;
    }

    show("جاري فتح عملية الدفع…");

    try {
      const payment = await Pi.createPayment({
        amount,
        memo: title,
        metadata: { product: title }
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          // إرسال للسيرفر للموافقة
          await fetch("/payment/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId })
          });
          show("تمت الموافقة على العملية. استكمال الدفع…", "info");
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch("/payment/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid })
          });
          show("تمت العملية بنجاح ✔️", "success");
        },

        onCancel: () => show("تم إلغاء العملية ❌", "error"),
        onError: (err) => {
          console.error(err);
          show("خطأ أثناء الدفع!", "error");
        }
      });

      console.log("Pi payment object:", payment);

    } catch (err) {
      console.error("Payment error", err);
      show("خطأ — راجع الكونسول", "error");
    }
  }

  document.querySelectorAll("button.buy").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCheckout(btn.dataset.title, Number(btn.dataset.price));
    });
  });

  if (!piAvailable()) {
    show("Tip: افتح الموقع داخل Pi Browser", "notice");
  }
})();
