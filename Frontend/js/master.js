// js/master.js

let userToken = localStorage.getItem('userToken') || '';

// Load header/footer and initialize after load
document.addEventListener('DOMContentLoaded', () => {
  fetch('masterpage.html')
    .then(res => res.text())
    .then(html => {
      // Extract header and footer sections
      const headerHtml = html.split('<!-- HEADER END -->')[0];
      const footerHtml = html.split('<!-- FOOTER END -->')[0].split('<!-- FOOTER START -->')[1];

      document.getElementById('main-header').innerHTML = headerHtml.replace('<!-- HEADER START -->', '').trim();
      document.getElementById('main-footer').innerHTML = footerHtml.trim();

      // Cart count only fetched if logged in
      if (userToken) {
        const admin = document.getElementById("show-admin")
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        console.log(payload)
        if(payload.role === "Admin") {
          console.log("Yepeee")
          admin.style.display = "block"
          console.log(admin)
        }
        const cartCount = document.getElementById('cartCount');
        fetch(`http://localhost:3000/Orders/TotalCartItems`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (cartCount) {
              cartCount.textContent = data.CartTotal || 0;
            }
          });
      }

      // Init after DOM elements exist
      initHeaderLogic();
    });
});

function initHeaderLogic() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  const signOutBtn = document.getElementById('signOutBtn');
  const cartButton = document.querySelector('.btn-outline-dark');

  let isLoggedIn = !!userToken;
  
  function toggleAuthUI() {
    if (isLoggedIn) {
      loginBtn?.classList.add('d-none');
      signupBtn?.classList.add('d-none');
      accountDropdown?.classList.remove('d-none');
    } else {
      loginBtn?.classList.remove('d-none');
      signupBtn?.classList.remove('d-none');
      accountDropdown?.classList.add('d-none');
    }
  }

  
  function ShowLoginModal() {
    showModal('Login', `
      <input type="email" id="loginEmail" class="form-control mb-2" placeholder="Email" />
      <input type="password" id="loginPassword" class="form-control" placeholder="Password" /><br>
      <button class="btn btn-primary" id="forgetPasswordBtn">Forget Password</button>
    `,
    async () => {
      const Email = document.getElementById('loginEmail').value;
      const Password = document.getElementById('loginPassword').value;

      const res = await fetch('http://localhost:3000/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email, Password })
      });

      const data = await res.json();
      alert(data.message || data.error);
      console.log(res.ok , data.accessToken)
      if (res.ok && data.accessToken) {
        userToken = data.accessToken;
        localStorage.setItem('userToken', userToken);
        isLoggedIn = true;
        toggleAuthUI();

        // Update cart count after login
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
          fetch(`http://localhost:3000/Orders/TotalCartItems`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            }
          })
            .then(res => res.json())
            .then(data => {
              cartCount.textContent = data.CartTotal || 0;
            });
        }
        setTimeout(() => {
  const modal = document.querySelector('.modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}, 100);
      }
    });
}

  function showModal(title, fields, onSubmit) {
    const existing = document.querySelector('.modal');
    if (existing) existing.remove();
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop fade show';
    modalBackdrop.style.zIndex = 1040;

    const modal = document.createElement('div');
    modal.className = 'modal fade show d-block';
    modal.style.zIndex = 1050;
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${fields}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary btn-submit">Submit</button>
          </div>
        </div>
      </div>`;

    document.body.append(modalBackdrop, modal);

    modal.querySelector('.btn-close').onclick = closeModal;
    modal.querySelector('.btn-cancel').onclick = closeModal;
    modal.querySelector('.btn-submit').onclick = onSubmit;

    function closeModal() {
      modal.remove();
      modalBackdrop.remove();
    }
  }
    // Block cart access if not logged in
    cartButton?.addEventListener('click', (e) => {
      if (!userToken || userToken.trim() === '') {
        e.preventDefault();
        alert("You must logged in first!")
        ShowLoginModal()
        return false;
      }
    });

  loginBtn?.addEventListener('click', () => {
    ShowLoginModal()
  });

  signupBtn?.addEventListener('click', () => {
    showModal('Sign Up', `
      <input type="text" id="signupFirstname" class="form-control mb-2" placeholder="First Name" />
      <input type="text" id="signupLastname" class="form-control mb-2" placeholder="Last Name" />
      <select id="signupGender" class="form-control mb-2">
        <option value="" disabled selected>Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="email" id="signupEmail" class="form-control mb-2" placeholder="Enter your email" />
      <input type="password" id="signupPassword" class="form-control" placeholder="Create Password" />
    `, async () => {
      const Firstname = document.getElementById('signupFirstname').value;
      const Lastname = document.getElementById('signupLastname').value;
      const Gender = document.getElementById('signupGender').value;
      const Email = document.getElementById('signupEmail').value;
      const Password = document.getElementById('signupPassword').value;

      const res = await fetch('http://localhost:3000/Auth/SendVerificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Firstname, Lastname, Gender, Email, Password })
      });

      const data = await res.json();
      alert(data.message || data.errors?.[0]?.msg);

      if (res.ok) {
        document.querySelector('.modal').remove();
        document.querySelector('.modal-backdrop').remove();
      }
    });
  });

  signOutBtn?.addEventListener('click', () => {
    isLoggedIn = false;
    userToken = '';
    localStorage.removeItem('userToken');
    toggleAuthUI();
  });

  toggleAuthUI();

  // Forgot password flow
document.body.addEventListener('click', e => {
  if (e.target && e.target.id === 'forgetPasswordBtn') {
    showModal('Reset Password', `
      <input type="email" id="password-reset-email" class="form-control mb-2" placeholder="Enter your registered email" />
    `, async () => {
      const Email = document.getElementById('password-reset-email').value;
      const res = await fetch('http://localhost:3000/Users/PasswordChangeVerify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email })
      });

      const data = await res.json();
      alert(data.message || data.error);

      const modal = document.querySelector('.modal');
      const backdrop = document.querySelector('.modal-backdrop');
      if (modal) modal.remove();
      if (backdrop) backdrop.remove();
    });
  }
});


  // Token check on homepage
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    fetch('http://localhost:3000/Auth/CompleteRegister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(err => alert('Verification failed.'));
  }
// Add search bar listener to master.js
const searchForm = document.createElement('form');
searchForm.className = 'd-flex ms-auto';
searchForm.innerHTML = `
  <input class="form-control me-2" type="search" id="headerSearchInput" placeholder="Search products..." aria-label="Search">
  <button class="btn btn-outline-primary" type="submit">Search</button>
`;

const headerTarget = document.getElementById('main-header');
const interval = setInterval(() => {
  const nav = headerTarget?.querySelector('.SearchBar');
  if (nav && !document.getElementById('headerSearchInput')) {
    nav.appendChild(searchForm);
    clearInterval(interval);
  }
}, 200);

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const query = document.getElementById('headerSearchInput').value.trim();
  if (!query) return alert('Please enter a product name.');
  const encoded = encodeURIComponent(query);
  window.location.href = `searchresults.html?text=${encoded}&index=1`;
});

}
