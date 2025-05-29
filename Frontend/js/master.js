
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImVtYWlsIjoid2ZhcmlkQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDExJFNqSWVFNDBRaS41WXl1WWhQUWUvSE9odXdITWlvOUk2ZXR0YWJ0R2U2bUYzZkhweC5XUDVPIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNzQ4NTI3NzM2LCJleHAiOjE3NDg1NDU3MzZ9.xJP-LffbQscdEvU6ywcHUKZ-SqGEf2Yx2lrTKcSbdNk';

document.addEventListener('DOMContentLoaded', () => {
  fetch('masterpage.html')
    .then(res => res.text())
    .then(html => {
      // Extract header and footer sections
      const headerHtml = html.split('<!-- HEADER END -->')[0];
      const footerHtml = html.split('<!-- FOOTER END -->')[0].split('<!-- FOOTER START -->')[1];

      document.getElementById('main-header').innerHTML = headerHtml.replace('<!-- HEADER START -->', '').trim();
      document.getElementById('main-footer').innerHTML = footerHtml.trim();

        const cartCount = document.getElementById('cartCount');
        fetch(`http://localhost:3000/Orders/TotalCartItems`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${userToken}`},
          
        })
        .then(res =>res.json())
        .then(data => {cartCount.textContent = data.CartTotal})
      initHeaderLogic();
    });
});

function initHeaderLogic() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  const signOutBtn = document.getElementById('signOutBtn');

  let isLoggedIn = false;

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

  loginBtn?.addEventListener('click', () => {
    isLoggedIn = true;
    userToken = 'your-jwt-token';
    toggleAuthUI();
  });

  signupBtn?.addEventListener('click', () => {
    isLoggedIn = true;
    userToken = 'your-jwt-token';
    toggleAuthUI();
  });

  signOutBtn?.addEventListener('click', () => {
    isLoggedIn = false;
    userToken = '';
    toggleAuthUI();
  });

  toggleAuthUI();
}

