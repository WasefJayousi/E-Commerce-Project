document.addEventListener('DOMContentLoaded', () => {
  const userToken = localStorage.getItem('userToken');

  // Prevent form submission if already handled
  const postForm = document.getElementById('postProductForm');
  const updateForm = document.getElementById('updateProductForm');

  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        Productname: document.querySelector('#postProductForm [placeholder="Product Name"]').value,
        Quantity: document.querySelector('#postProductForm [placeholder="Quantity"]').value,
        Price: document.querySelector('#postProductForm [placeholder="Price"]').value,
        Description: document.querySelector('#postProductForm [placeholder="Description"]').value,
        Availability: document.querySelector('#postProductForm [placeholder="Availability"]').value,
        CategoryID: document.querySelector('#postProductForm [placeholder="Category ID"]').value,
        img: document.querySelector('#postProductForm [name="img"]').value
      };

      try {
        const res = await fetch('http://localhost:3000/Products/PostProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || data.error);
        if (res.ok) postForm.reset();
      } catch (err) {
        alert('Failed to submit product.');
        console.error(err);
      }
    });
  }

  if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const ProductID = document.querySelector('#updateProductForm [placeholder="Product ID"]').value;

      const payload = {
        Productname: document.querySelector('#updateProductForm [placeholder="Product Name"]').value,
        Quantity: document.querySelector('#updateProductForm [placeholder="Quantity"]').value,
        Price: document.querySelector('#updateProductForm [placeholder="Price"]').value,
        Description: document.querySelector('#updateProductForm [placeholder="Description"]').value,
        Availability: document.querySelector('#updateProductForm [placeholder="Availability"]').value,
        CategoryID: document.querySelector('#updateProductForm [placeholder="Category ID"]').value
      };

      try {
        const res = await fetch(`http://localhost:3000/Products/UpdateProduct/${ProductID}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        alert(data.message || data.error);
        if (res.ok) updateForm.reset();
      } catch (err) {
        alert('Failed to update product.');
        console.error(err);
      }
    });
  }
});
