import { addToCart } from './cartUtils.js';      

let userToken = localStorage.getItem('userToken') || '';
document.addEventListener('DOMContentLoaded', function () {
        const params = new URLSearchParams(window.location.search);
        const ProductID = params.get('productid');

        if (!ProductID) {
          document.getElementById('product-title').textContent = 'Product not found';
          return;
        }

        fetch(`http://localhost:3000/Products/Viewproduct/${ProductID}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => res.json())
          .then(data => {
            const product = data.product; 
            document.getElementById('product-title').textContent = product.Productname;
            document.getElementById('product-price').textContent = `$${product.Price}`;
            document.getElementById('product-description').textContent = product.Description || 'No description available';
            document.getElementById('product-sku').textContent = `SKU: ${product.ProductID}`;
            document.getElementById('product-availability').textContent = `Availability: ${product.Availability}` 
            // If image URL is part of your DB, set it here:
            // document.getElementById('product-image').src = product.ImageURL;
          })
          .catch(err => {
            console.error('Error loading product:', err);
            document.getElementById('product-title').textContent = 'Failed to load product';
          });

        document.getElementById('addToCartBtn').addEventListener('click', () => {
          if(!userToken) return alert("You must log in first!")
          const Quantity = parseInt(document.getElementById('inputQuantity').value, 10);
          console.log(`Add to cart: ProductID=${ProductID}, Quantity=${Quantity}`);
          addToCart({ProductID,Quantity} , userToken)
          // Implement addToCart logic here if desired
        });
  function renderProducts(products) {
  const productContainer = document.querySelector('.row-cols-2');
  productContainer.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'col mb-5';
    card.innerHTML = `
      <div class="card h-100">
        <a href="viewproduct.html?productid=${product.ProductID}&categoryid=${product.CategoryID}">
          <img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="${product.Productname}" />
        </a>
        <div class="card-body p-4">
          <div class="text-center">
            <a href="viewproduct.html?productid=${product.ProductID}" style="text-decoration: none; color: inherit;">
              <h5 class="fw-bolder">${product.Productname}</h5>
            </a>
            $${product.Price}
          </div>
        </div>
        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
          <div class="text-center">
            <button class="btn btn-outline-dark mt-auto add-to-cart-btn" 
              data-productid="${product.ProductID}" 
              data-quantity="1">Add to cart</button>
          </div>
        </div>
      </div>
    `;
    productContainer.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      if(!userToken) return alert("You must log in first!")
      e.preventDefault();
      const ProductID = this.dataset.productid;
      const Quantity = parseInt(this.dataset.quantity, 10);
      addToCart({ ProductID, Quantity } , userToken);
    });
  });
}
const categoryId = params.get('categoryid');
  fetch(`http://localhost:3000/Products/RelatedProducts/${categoryId}`)
    .then(res => res.json())
    .then(data => {renderProducts(data)})
    .catch(err => console.error('Error loading products:', err));
});