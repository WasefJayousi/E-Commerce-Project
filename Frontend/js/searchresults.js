document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const text = params.get('text');
  let index = parseInt(params.get('index')) || 1;

  const container = document.getElementById('search-results-container');
  const pagination = document.getElementById('pagination');

  function fetchResults() {
    fetch(`http://localhost:3000/Products/SearchProduct?text=${encodeURIComponent(text)}&index=${index}`)
      .then(res => res.json())
      .then(data => {
        renderProducts(data.products);
        renderPagination(data.products.length);
      })
      .catch(err => console.error('Search error:', err));
  }

  function renderProducts(products) {
    container.innerHTML = '';
    if (!products.length) {
      container.innerHTML = '<p>No products found.</p>';
      return;
    }

    products.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100">
          <a href="viewproduct.html?productid=${p.ProductID}&categoryid=${p.CategoryID}">
            <img src="https://dummyimage.com/300x200/dee2e6/6c757d" class="card-img-top" alt="Product image">
          </a>
          <div class="card-body">
            <h5 class="card-title">${p.Productname}</h5>
            <p class="card-text">$${p.Price}</p>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  function renderPagination(count) {
    pagination.innerHTML = '';
    const hasPrev = index > 1;
    const hasNext = count === 10;

    if (hasPrev) {
      pagination.innerHTML += `<li class="page-item"><a class="page-link" href="?text=${text}&index=${index - 1}">Previous</a></li>`;
    }

    pagination.innerHTML += `<li class="page-item active"><a class="page-link">${index}</a></li>`;

    if (hasNext) {
      pagination.innerHTML += `<li class="page-item"><a class="page-link" href="?text=${text}&index=${index + 1}">Next</a></li>`;
    }
  }

  fetchResults();
});
