// js/user-orders.js

let userToken = localStorage.getItem('userToken') || '';
const shipmentPrice = 5.00;

function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

function ClearCart() {
    fetch('http://localhost:3000/Orders/ClearCart' , {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    })  .then(res => res.json())
      .then(data => {
        console.log(data.message);
      })
      .catch(err => console.error('Clearing Cart Failed:', err));
}

function renderOrders(items) {
  const products = items.cartresult
  const container = document.getElementById('order-items-container');
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p>No items to review.</p>';
    return;
  }

  products.forEach(item => {
    const card = document.createElement('div');
    card.className = 'col-12 mb-4';

    card.innerHTML = `
      <div class="card h-100 p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
        <div>
          <h5 class="fw-bolder">${item.Productname}</h5>
          <p class="mb-1">Quantity: ${item.Quantity}</p>
          <p class="mb-1">Price: ${formatCurrency(item.Price)}</p>
          <p class="mb-0">Total: ${formatCurrency(item.Price * item.Quantity)}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  const itemTotal = parseInt(items.total_cart_price,10)
  const grandTotal = itemTotal + shipmentPrice

  const summary = document.getElementById('order-summary-section');
  summary.innerHTML = `
    <div class="card p-4">
      <p class="mb-2">Item Total: ${formatCurrency(itemTotal)}</p>
      <p class="mb-2">Shipment: ${formatCurrency(shipmentPrice)}</p>
      <h5 class="mb-3">Total: <strong>${formatCurrency(grandTotal)}</strong></h5>
      <button class="btn btn-primary" id="payNowBtn">Proceed to Pay</button>
    </div>
  `;
console.log(products)
document.getElementById('payNowBtn').addEventListener('click', () => {
  fetch('http://localhost:3000/Orders/Create-Checkout-Paymentintent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(products)
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Something went wrong.');
        throw new Error(`Request failed with status ${res.status}`);
      }

      return data; // ✅ return for next .then()
    })
    .then(data => {
      console.log('Order placed:', data);

      const clientSecret = data.client_secret; // ✅ make sure backend sends this
      console.log()
      if (!clientSecret) {
        alert('Missing clientSecret from server.');
        return;
      }

      localStorage.removeItem('checkoutItems');
      localStorage.setItem('stripe_client_secret', clientSecret);

      ClearCart(); // your own function to clear local UI/cart state
      window.location.href = 'payment.html';
    })
    .catch(err => console.error('Order creation failed:', err));
});

}

document.addEventListener('DOMContentLoaded', () => {
  const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
  renderOrders(checkoutItems);
});
