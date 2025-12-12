document.querySelectorAll(".buy").forEach(btn => {
  btn.addEventListener("click", async () => {
    try {
      const title = btn.dataset.title;
      const amount = parseFloat(btn.dataset.price);

      Pi.authenticate(
        scopes = ["payments"],
        onIncompletePaymentFound = (payment) => {
          console.log("Incomplete payment found:", payment);
        }
      ).then(async ({ user }) => {

        const paymentData = {
          amount,
          memo: title,
          metadata: { title }
        };

        const payment = await Pi.createPayment(paymentData, {
          onReadyForServerApproval: async (paymentId) => {
            await fetch("/api/payment/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId })
            });
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch("/api/payment/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid })
            });
          },

          onError: (error) => {
            console.error("Payment error:", error);
            alert("Payment failed. Check console.");
          },

          onCancel: () => {
            alert("Payment cancelled.");
          }
        });

      });
    } catch (err) {
      console.error(err);
      alert("Error occurred.");
    }
  });
});
