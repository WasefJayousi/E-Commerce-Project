// js/cart.js

// Simulated JWT token (replace with actual user auth logic)
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImVtYWlsIjoid2ZhcmlkQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDExJFNqSWVFNDBRaS41WXl1WWhQUWUvSE9odXdITWlvOUk2ZXR0YWJ0R2U2bUYzZkhweC5XUDVPIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNzQ4NTI3NzM2LCJleHAiOjE3NDg1NDU3MzZ9.xJP-LffbQscdEvU6ywcHUKZ-SqGEf2Yx2lrTKcSbdNk';
let currentCartItems = [];
function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}


function renderCartItems(items) {
  const product = items.cartresult
  const container = document.getElementById('cart-items-container');
  container.innerHTML = '';

  currentCartItems = items;

  if (product.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('checkout-section').innerHTML = '';
    return;
  }

  product.forEach(item => {
    const card = document.createElement('div');
    card.className = 'col-12 mb-4';

    card.innerHTML = `
      <div class="card h-100 p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
        <div class="mb-3 mb-md-0">
          <h5 class="fw-bolder">${item.Productname}</h5>
          <p class="mb-1">Price: ${formatCurrency(item.Price)}</p>
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-secondary btn-sm me-2 quantity-btn" data-action="decrement" data-id="${item.CartID}">-</button>
            <span class="me-2">${item.Quantity}</span>
            <button class="btn btn-outline-secondary btn-sm me-3 quantity-btn" data-action="increment" data-id="${item.CartID}">+</button>
            <span>Total: ${formatCurrency(item.Quantity * item.Price)}</span>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm remove-btn" data-id="${item.CartID}">Remove</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Checkout section
  const checkoutSection = document.getElementById('checkout-section');
  const totalPrice = items.total_cart_price
  checkoutSection.innerHTML = `
    <div class="card p-4">
      <h5 class="mb-3">Total: <strong>${formatCurrency(totalPrice)}</strong></h5>
      <button class="btn btn-success" id="checkoutBtn">Proceed to Checkout</button>
    </div>
  `;

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    // Store currentCartItems in localStorage and redirect
    localStorage.setItem('checkoutItems', JSON.stringify(currentCartItems));
    window.location.href = 'user-orders.html';
  });
  
  // Remove item
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', () => {
      const CartID = button.dataset.id;
      fetch('http://localhost:3000/Orders/DeleteCartItem', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ CartID })
      })
        .then(res => res.json())
        .then(() => fetchCartItems() , alert("item removed!"))
        .catch(err => console.error('Error removing item:', err));
    });
  });

  // Quantity change
  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', () => {
      const CartID = button.dataset.id;
      const changeType = button.dataset.action;
      const QuantityChange = changeType === 'increment' ? 1 : -1;

      fetch('http://localhost:3000/Orders/QuantityChange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ CartID, QuantityChange })
      })
        .then(res => res.json())
        .then(() => fetchCartItems())
        .catch(err => console.error('Error changing quantity:', err));
    });
  });
}

function fetchCartItems() {
  fetch('http://localhost:3000/Orders/View-Cart', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    }
  })
    .then(res => res.json())
    .then(data => {
      renderCartItems(data);
    })
    .catch(err => {
      console.error('Failed to load cart:', err);
      document.getElementById('cart-items-container').innerHTML = '<p>Error loading cart.</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCartItems();
});
