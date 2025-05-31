function completePasswordUpdate() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const Password = document.getElementById('new-password').value;

  if (!token) {
    alert('Token is missing in the URL.');
    return;
  }

  fetch('http://localhost:3000/Users/PasswordUpdate', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, Password })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || data.error);
      if (data.message) {
        window.location.href = 'HomePage.html';
      }
    })
    .catch(err => alert('Password update failed.'));
}
