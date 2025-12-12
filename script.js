// ============================================
// 🤖 Forsale AI - Fixed Payment Script
// IMPORTANT: Pi.init() must be called FIRST
// ============================================

let piInitialized = false;

// STEP 1: Initialize Pi SDK when page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing Forsale AI Payment System...');
  
  try {
    // Check if Pi SDK exists
    if (typeof Pi === 'undefined') {
      throw new Error('Pi SDK not found. Make sure you are using Pi Browser.');
    }

    console.log('📦 Pi SDK found, initializing...');

    // Initialize Pi SDK - THIS IS CRITICAL!
    await Pi.init({ 
      version: "2.0",
      sandbox: true // Set to false for mainnet
    });
    
    piInitialized = true;
    console.log('✅ Pi SDK initialized successfully!');
    
    // Update status message
    updateStatus('✅ Pi SDK Ready', 'success');
    
    // Now setup payment buttons
    setupPaymentButtons();
    
  } catch (error) {
    console.error('❌ Pi initialization failed:', error);
    updateStatus('❌ Please open in Pi Browser', 'error');
    alert('⚠️ This app must be opened in Pi Browser!\n\nError: ' + error.message);
  }
});

// STEP 2: Setup all payment buttons
function setupPaymentButtons() {
  console.log('🔘 Setting up payment buttons...');
  
  const buyButtons = document.querySelectorAll(".buy");
  
  if (buyButtons.length === 0) {
    console.warn('⚠️ No buy buttons found on page');
    return;
  }
  
  console.log(`📊 Found ${buyButtons.length} payment buttons`);

  buyButtons.forEach((btn, index) => {
    // Remove any existing listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Add click handler
    newBtn.addEventListener("click", handlePaymentClick);
    console.log(`✅ Button ${index + 1} ready: ${newBtn.dataset.title}`);
  });
}

// STEP 3: Handle payment button clicks
async function handlePaymentClick(event) {
  event.preventDefault();
  
  const btn = event.target;
  const title = btn.dataset.title;
  const amount = parseFloat(btn.dataset.price);

  console.log(`\n💰 Payment initiated: ${title} - ${amount} Pi`);

  // Check if Pi is initialized
  if (!piInitialized) {
    alert('⚠️ Pi SDK not initialized. Please refresh the page in Pi Browser.');
    return;
  }

  try {
    // Disable button during processing
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    
    updateStatus('🔐 Authenticating...', 'info');

    // Step 3.1: Authenticate user
    console.log('🔐 Authenticating user...');
    
    const authResult = await Pi.authenticate(
      ['payments'], // Required scopes
      function onIncompletePaymentFound(payment) {
        console.log('⚠️ Found incomplete payment:', payment);
        return payment.identifier;
      }
    );

    const user = authResult.user;
    console.log('✅ User authenticated:', {
      uid: user.uid,
      username: user.username
    });
    
    updateStatus(`Welcome ${user.username}! 👋`, 'success');

    // Step 3.2: Create payment
    console.log('💳 Creating payment...');
    updateStatus('Creating payment...', 'info');
    
    const paymentData = {
      amount: amount,
      memo: `Forsale AI: ${title}`,
      metadata: { 
        productTitle: title,
        userId: user.uid,
        timestamp: Date.now()
      }
    };

    console.log('📝 Payment data:', paymentData);

    // Step 3.3: Submit payment with callbacks
    const payment = await Pi.createPayment(paymentData, {
      // Callback 1: Server Approval
      onReadyForServerApproval: async function(paymentId) {
        console.log('\n📤 CALLBACK: onReadyForServerApproval');
        console.log('Payment ID:', paymentId);
        
        updateStatus('Approving payment...', 'info');
        
        try {
          const response = await fetch('/payment/approve', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              paymentId,
              userId: user.uid,
              amount,
              title
            })
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ Server approval response:', result);
          
          if (!result.success) {
            throw new Error(result.error || 'Approval failed');
          }
          
          updateStatus('Payment approved! ✅', 'success');
          
        } catch (error) {
          console.error('❌ Approval error:', error);
          updateStatus(`Approval failed: ${error.message}`, 'error');
          throw error;
        }
      },

      // Callback 2: Server Completion
      onReadyForServerCompletion: async function(paymentId, txid) {
        console.log('\n🎉 CALLBACK: onReadyForServerCompletion');
        console.log('Payment ID:', paymentId);
        console.log('Transaction ID:', txid);
        
        updateStatus('Completing payment...', 'info');
        
        try {
          const response = await fetch('/payment/complete', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              paymentId,
              txid,
              userId: user.uid
            })
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ Server completion response:', result);
          
          if (!result.success) {
            throw new Error(result.error || 'Completion failed');
          }
          
          updateStatus(
            `✅ Payment Complete! Order ID: ${result.orderId}`, 
            'success'
          );
          
          // Show success for longer
          setTimeout(() => {
            updateStatus('Ready for next payment', 'info');
          }, 10000);
          
        } catch (error) {
          console.error('❌ Completion error:', error);
          updateStatus(`Completion failed: ${error.message}`, 'error');
          throw error;
        }
      },

      // Callback 3: User Cancelled
      onCancel: function(paymentId) {
        console.log('\n🚫 CALLBACK: onCancel');
        console.log('Payment ID:', paymentId);
        updateStatus('Payment cancelled by user', 'notice');
      },

      // Callback 4: Error occurred
      onError: function(error, payment) {
        console.error('\n❌ CALLBACK: onError');
        console.error('Error:', error);
        console.error('Payment:', payment);
        updateStatus(`Error: ${error.message || 'Unknown error'}`, 'error');
      }
    });

    console.log('\n✅ Payment flow initiated successfully');
    console.log('Payment object:', payment);

  } catch (error) {
    console.error('\n💥 Fatal error in payment flow:', error);
    updateStatus(`Fatal error: ${error.message}`, 'error');
    alert(`Payment failed: ${error.message}\n\nCheck console for details.`);
    
  } finally {
    // Re-enable button
    btn.disabled = false;
    btn.textContent = 'Buy Now';
  }
}

// Helper function: Update status message
function updateStatus(text, type = 'info') {
  console.log(`📢 Status: ${text} [${type}]`);
  
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = text;
    statusDiv.className = `status ${type}`;
    
    // Color coding
    const colors = {
      info: { bg: 'rgba(0,242,255,0.1)', text: '#00f2ff' },
      success: { bg: 'rgba(46,204,113,0.1)', text: '#2ECC71' },
      error: { bg: 'rgba(255,82,82,0.1)', text: '#FF5252' },
      notice: { bg: 'rgba(255,215,0,0.1)', text: '#FFD700' }
    };
    
    const color = colors[type] || colors.info;
    statusDiv.style.background = color.bg;
    statusDiv.style.color = color.text;
  }
  
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
  }
}

// Debug helper - call from console
window.debugPi = function() {
  console.log('\n=== 🔍 Pi SDK Debug Info ===');
  console.log('Pi SDK loaded:', typeof Pi !== 'undefined');
  console.log('Pi initialized:', piInitialized);
  console.log('User Agent:', navigator.userAgent);
  console.log('Pi Browser:', navigator.userAgent.includes('PiBrowser'));
  console.log('Location:', window.location.href);
  console.log('=========================\n');
};

// Auto-run debug on load (can be removed in production)
setTimeout(() => {
  if (typeof window.debugPi === 'function') {
    window.debugPi();
  }
}, 2000);

console.log('📄 Payment script loaded successfully');
