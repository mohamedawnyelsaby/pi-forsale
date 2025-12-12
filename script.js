let selectedProduct = null;
let selectedPrice = 0;

document.addEventListener("DOMContentLoaded", () => {

    // Ensure Pi SDK is loaded
    if (typeof Pi === "undefined") {
        console.warn("Pi SDK not loaded");
        return;
    }

    // Init SDK
    Pi.init({
        version: "2.0",
        sandbox: true
    });

    console.log("Pi SDK initialized successfully");
});

function openCheckout(product, price) {
    selectedProduct = product;
    selectedPrice = price;

    document.getElementById("checkout-product").innerText = "Product: " + product;
    document.getElementById("checkout-price").innerText = "Price: " + price + " Pi";

    document.getElementById("checkout-modal").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("checkout-modal").style.display = "none";
}

async function checkout() {
    try {
        const payment = await Pi.createPayment({
            amount: selectedPrice,
            memo: selectedProduct,
            metadata: { product: selectedProduct }
        }, {
            onReadyForServerApproval: (paymentId) => {
                return fetch("/payment/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                return fetch("/payment/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid })
                });
            },
            onCancel: () => alert("Payment canceled"),
            onError: (err) => alert("Payment error: " + err)
        });

        console.log(payment);

    } catch (error) {
        alert("Error: " + error);
        console.error(error);
    }
}
