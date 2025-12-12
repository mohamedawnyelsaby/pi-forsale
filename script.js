// ============================================
// 🤖 Forsale AI - Fixed Payment Script
// ============================================

// Check if Pi SDK is loaded
if (typeof Pi === 'undefined') {
  console.error('❌ Pi SDK not found. Please open in Pi Browser.');
  alert('⚠️ This app must be opened in Pi Browser to work!');
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing payment buttons...');
  
  // Get all buy buttons
  const buyButtons = document.querySelectorAll(".buy");
  console.log(`📊 Found ${buyButtons.length} buy buttons`);

  buyButtons.forEach((btn, index) => {
    console.log(`🔘 Setting up button ${index + 1}`);
    
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      console.log('🖱️ Button clicked!');

      try {
        // Check Pi SDK
        if (typeof Pi === 'undefined') {
          throw new Error('Pi SDK not loaded. Open in Pi Browser.');
        }

        const title = btn.dataset.title;
        const amount = parseFloat(btn.dataset.price);

        console.log(`💰 Payment request: ${title} - ${amount} Pi`);

        // Show loading
        btn.disabled = true;
        btn.textContent = 'Processing...';

        // Authenticate user
        console.log('🔐 Authenticating...');
        const authResult = await Pi.authenticate(
          ['payments'], // scopes
          (payment) => {
            console.log('⚠️ Incomplete payment found:', payment);
          }
        );

        console.log('✅ Authentication successful:', authResult.user);

        // Create payment
        const paymentData = {
          amount,
          memo: title,
          metadata: { title, timestamp: Date.now() }
        };

        console.log('💳 Creating payment:', paymentData);

        const payment = await Pi.createPayment(paymentData, {
          onReadyForServerApproval: async (paymentId) => {
            console.log('📤 Approving payment:', paymentId);
            
            try {
              const response = await fetch('/payment/approve', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId })
              });

              const result = await response.json();
              console.log('✅ Server approval:', result);

              if (!result.success) {
                throw new Error('Server approval failed');
              }
            } catch (error) {
              console.error('❌ Approval error:', error);
              throw error;
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('🎉 Completing payment:', paymentId, txid);
            
            try {
              const response = await fetch('/payment/complete', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, txid })
              });

              const result = await response.json();
              console.log('✅ Payment completed:', result);

              // Show success message
              showMessage('Payment successful! 🎉', 'success');
              
              if (!result.success) {
                throw new Error('Server completion failed');
              }
            } catch (error) {
              console.error('❌ Completion error:', error);
              throw error;
            }
          },

          onError: (error, payment) => {
            console.error('❌ Payment error:', error, payment);
            showMessage(`Payment failed: ${error.message}`, 'error');
          },

          onCancel: (paymentId) => {
            console.log('🚫 Payment cancelled:', paymentId);
            showMessage('Payment cancelled', 'notice');
          }
        });

        console.log('✅ Payment flow initiated:', payment);

      } catch (err) {
        console.error('💥 Error:', err);
        showMessage(err.message || 'An error occurred', 'error');
      } finally {
        // Reset button
        btn.disabled = false;
        btn.textContent = 'Buy Now';
      }
    });
  });
});

// Helper function to show messages
function showMessage(text, type = 'info') {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
  
  console.log(`📢 ${type.toUpperCase()}: ${text}`);
}

// Debug function - call from console
window.debugPiSDK = () => {
  console.log('=== Pi SDK Debug Info ===');
  console.log('Pi SDK loaded:', typeof Pi !== 'undefined');
  console.log('Pi Browser detected:', navigator.userAgent.includes('PiBrowser'));
  console.log('Config:', window.__PI_APP_CONFIG);
  console.log('=======================');
};
