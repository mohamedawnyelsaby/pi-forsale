// Minimal frontend to demo Pi checkout integration (sandbox)
// Replace appPublicKey in index.html with your app public key (from Pi Developer -> API Key area).
(function(){
  const messageEl = document.getElementById('message');

  function showMessage(txt, type='info') {
    messageEl.textContent = txt;
    messageEl.className = 'message ' + type;
  }

  // Check Pi SDK loaded
  function piAvailable() {
    return window.Pi && typeof window.Pi.request === 'function';
  }

  async function openCheckout(title, price) {
    showMessage('Opening Pi checkout...', 'info');

    if (!piAvailable()) {
      console.error('Pi SDK not available. Make sure you open the page inside Pi Browser or include the SDK.');
      showMessage('Pi SDK not available. Open inside Pi Browser or check console.', 'error');
      return;
    }

    try {
      // This is an example: the Pi SDK may provide different methods.
      // The official flow is: open payment request and listen for callbacks.
      const payment = {
        name: title,
        price: price,
        currency: 'PI',
        // other metadata...
      };

      // In many Pi SDK versions the method is window.Pi.requestPayment or similar.
      // For sandbox/demo we use a generic example:
      const res = await window.Pi.request(payment);
      console.log('Pi SDK response:', res);
      showMessage('Payment initiated. Check Pi Browser UI.', 'success');
    } catch (err) {
      console.error('Payment error', err);
      showMessage('Payment Failed. Check console for details.', 'error');
    }
  }

  // attach handlers
  document.querySelectorAll('button.buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title;
      const price = Number(btn.dataset.price);
      openCheckout(title, price);
    });
  });

  // friendly note
  if (!piAvailable()) {
    showMessage('Tip: Open this page inside the Pi Browser for working payments.', 'notice');
  }
})();
