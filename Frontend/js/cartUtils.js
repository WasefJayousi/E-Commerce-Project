
export function addToCart(item, userToken) {

    const payload = [
      {
        ProductID: item.ProductID,
        Quantity: item.Quantity
      }
    ];

    fetch('http://localhost:3000/Orders/AddToCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {console.log('Added to cart:', data) , alert(data.message)})
      .catch(err => console.error('Cart error:', err));
  }
