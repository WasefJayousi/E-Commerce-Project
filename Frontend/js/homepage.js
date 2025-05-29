/*!
* Start Bootstrap - Shop Homepage v5.0.6 (https://startbootstrap.com/template/shop-homepage)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-homepage/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project
import { addToCart } from './cartUtils.js';      

document.addEventListener('DOMContentLoaded', function () {
  

  let isLoggedIn = false; // Simulated auth state
  let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImVtYWlsIjoid2ZhcmlkQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDExJFNqSWVFNDBRaS41WXl1WWhQUWUvSE9odXdITWlvOUk2ZXR0YWJ0R2U2bUYzZkhweC5XUDVPIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNzQ4NTI3NzM2LCJleHAiOjE3NDg1NDU3MzZ9.xJP-LffbQscdEvU6ywcHUKZ-SqGEf2Yx2lrTKcSbdNk'; // Placeholder for user JWT token


  
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
            <a href="viewproduct.html?productid=${product.ProductID}&categoryid=${product.CategoryID}" style="text-decoration: none; color: inherit;">
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
      e.preventDefault();
      const ProductID = this.dataset.productid;
      const Quantity = parseInt(this.dataset.quantity, 10);
      addToCart({ ProductID, Quantity } , userToken);
    });
  });
}


  fetch('http://localhost:3000/Products/HomePageProduct')
    .then(res => res.json())
    .then(data => renderProducts(data))
    .catch(err => console.error('Error loading products:', err));

});