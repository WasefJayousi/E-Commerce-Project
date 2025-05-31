let client_secret = ''

function loadHistory(status) {
  fetch(`http://localhost:3000/Orders/History?status=${encodeURIComponent(status)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
  })
    .then(res => res.json())
    .then(data => {renderOrders(data,status)})
    .catch(err => console.error('Failed to fetch order history:', err));
}

function renderOrders(orderItems , status) {
    console.log(status)
    orderItems = orderItems.orders
  const container = document.getElementById('orders-container');
  container.innerHTML = '';

  if (!orderItems || orderItems.length === 0) {
    container.innerHTML = '<p class="text-center">No orders found for this category.</p>';
    return;
  }

  // Group items by OrderID
  const ordersGrouped = {};
  orderItems.forEach(item => {
    if (!ordersGrouped[item.OrderID]) {
      ordersGrouped[item.OrderID] = {
        OrderID: item.OrderID,
        Status: item.ShipmentStatus || item.Status,
        Date: item.Date,
        Total: 0,
        ClientSecret:item.StripeClientSecret,
        Items: [],

      };
    }
    ordersGrouped[item.OrderID].Items.push(item);
    ordersGrouped[item.OrderID].Total += parseFloat(item.Price) * item.Quantity;
  });

  // Render grouped orders
  Object.values(ordersGrouped).forEach(order => {
    order.Total += 5
    console.log(order.ClientSecret)
    const div = document.createElement('div');
    div.className = 'card mb-4';
    div.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">Order #${order.OrderID}</h5>
        <span>Shipment Cost $5</span>
        <p>Status: ${order.Status}</p>
        <p>Date: ${order.Date}</p>
        <ul class="list-group mb-3">
          ${order.Items.map(i => `
            <li class="list-group-item d-flex justify-content-between">
            <span></span>
              <span>${i.Productname} (x${i.Quantity})</span>
              <span>$${(i.Price * i.Quantity).toFixed(2)}</span>
            </li>
          `).join('')}
        </ul>
        <h6 class="text-end">Total: $${order.Total.toFixed(2)}</h6>
        ${status === 'Unpaid' ? `<div class="text-end mt-3"><button class="btn btn-success proceed-pay-btn" data-clientsecret="${order.ClientSecret}">Proceed to Pay</button>
        <button class="btn btn-danger cancel-order-btn" data-orderid="${order.OrderID}">Cancel Order</button>
        </div>` : ''}
      </div>
    `;
    container.appendChild(div);
  });

    // Attach event listener to Proceed to Pay buttons
  document.querySelectorAll('.proceed-pay-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Save SecretID or related info if needed in localStorage
      const ClientSecret = button.dataset.clientsecret;
      localStorage.setItem('stripe_client_secret', ClientSecret);
       window.location.href = 'payment.html';
    });
  });

    // Attach event listener to Cancel Order buttons
  document.querySelectorAll('.cancel-order-btn').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.dataset.orderid;
      if (confirm('Are you sure you want to cancel this order?')) {
        fetch(`http://localhost:3000/Orders/Cancel-Order/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            alert(data.message || data.error);
            loadHistory('Unpaid');
          })
          .catch(err => alert('Failed to cancel order.'));
      }
    });
  });
}

