let selectedProduct = "";
let selectedPrice = 0;

// Open checkout modal
function openCheckout(product, price) {
    selectedProduct = product;
    selectedPrice = price;

    document.getElementById("checkout-product").innerText = "Product: " + product;
    document.getElementById("checkout-price").innerText = "Price: " + price + " Pi";

    document.getElementById("checkout-modal").style.display = "flex";
}

// Close checkout modal
function closeCheckout() {
    document.getElementById("checkout-modal").style.display = "none";
}

// Perform Pi Network payment
async function checkout() {
    try {
        if (!window.Pi) {
            alert("Pi SDK not detected. Please open this app inside Pi Browser.");
            return;
        }

        // Authenticate user
        const auth = await Pi.authenticate({
            scopes: ["username", "payments"]
        });

        // Prepare payment request
        const paymentData = {
            amount: selectedPrice,
            memo: `Purchase: ${selectedProduct}`,
            metadata: { product: selectedProduct }
        };

        // Create payment request
        const payment = await Pi.createPayment(paymentData, {
            onReadyForServerApproval: function (paymentId) {
                console.log("Payment ready for server approval:", paymentId);
            },
            onReadyForServerCompletion: function (paymentId, txid) {
                console.log("Payment completed:", paymentId, txid);
            },
            onCancel: function (reason) {
                alert("Payment canceled: " + reason);
            },
            onError: function (error) {
                alert("Payment error: " + error);
            }
        });

        alert("Payment Completed Successfully!");
        closeCheckout();

    } catch (error) {
        console.error("Payment Failure:", error);
        alert("Payment Failed. Check console for details.");
    }
}
