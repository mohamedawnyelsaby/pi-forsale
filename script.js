(function () {
  const msg = document.getElementById("message");

  const show = (text, type = "info") => {
    msg.textContent = text;
    msg.className = "message " + type;
  };

  const piAvailable = () =>
    window.Pi && typeof window.Pi.createPayment === "function";

  async function openCheckout(title, amount) {
    if (!piAvailable()) {
      show("افتح الموقع داخل Pi Browser", "error");
      return;
    }

    show("بدء عملية الدفع…");

    try {
      await Pi.createPayment(
        {
          amount,
          memo: title,
          metadata: { product: title }
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch("/payment/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId })
            });

            show("تمت الموافقة ✔️", "info");
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch("/payment/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid })
            });

            show("تم الدفع بنجاح ✔️🎉", "success");
          },

          onCancel: () => show("تم إلغاء العملية ❌", "error"),
          onError: (err) => {
            console.error(err);
            show("خطأ أثناء الدفع ❌", "error");
          }
        }
      );
    } catch (e) {
      console.error(e);
      show("خطأ في بدء الدفع", "error");
    }
  }

  // 🔥🔥🔥 اضيف الكود هنا بالظبط 🔥🔥🔥
  function enableButtons() {
    const ready = window.Pi && typeof window.Pi.createPayment === "function";

    document.querySelectorAll("button.buy").forEach(btn => {
      btn.disabled = !ready;
      btn.style.opacity = ready ? "1" : "0.4";
      btn.style.cursor = ready ? "pointer" : "not-allowed";
    });

    if (!ready) {
      show("يجب فتح الموقع داخل Pi Browser ليعمل الدفع", "notice");
    }
  }

  window.addEventListener("load", enableButtons);
  // 🔥🔥🔥 نهاية الإضافة 🔥🔥🔥


  document.querySelectorAll("button.buy").forEach((btn) =>
    btn.addEventListener("click", () =>
      openCheckout(btn.dataset.title, Number(btn.dataset.price))
    )
  );

  if (!piAvailable()) {
    show("Tip: افتح ال
