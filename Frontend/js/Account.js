
function fetchUserInfo() {
  fetch('http://localhost:3000/Users/GetUserInfo', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
    .then(res => res.json())
    .then(data => {
      const info = data.UserInfo[0];
      document.getElementById('user-email').textContent = info.Email;
      document.getElementById('user-firstname').textContent = info.Firstname;
      document.getElementById('user-lastname').textContent = info.Lastname;
      document.getElementById('user-gender').textContent = info.Gender;
      document.getElementById('user-role').textContent = info.Role;
      document.getElementById('user-joindate').textContent = new Date(info.JoinDate).toLocaleDateString();
    })
    .catch(err => console.error('Failed to load user info:', err));
}

function requestEmailUpdate() {
  const Email = document.getElementById('new-email').value;
  fetch('http://localhost:3000/Users/EmailChangeVerify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({ Email })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(err => alert('Email update verification failed.'));
}

function completeEmailUpdate() {
  const token = document.getElementById('email-token').value;
  fetch('http://localhost:3000/Users/EmailUpdate', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({ token })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(err => alert('Email update failed.'));
}

function updateName() {
  const firstname = document.getElementById('new-firstname').value;
  const lastname = document.getElementById('new-lastname').value;
  fetch('http://localhost:3000/Users/Updatename', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({ firstname, lastname })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(err => alert('Name update failed.'));
}

function requestPasswordReset() {
  const Email = document.getElementById('password-email').value;
  fetch('http://localhost:3000/Users/PasswordChangeVerify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email })
  })
    .then(res => res.json())
    .then(data =>  alert(data.message || data.error))
    .catch(err => alert('Password reset verification failed.'));
}

function completePasswordUpdate() {
  const token = document.getElementById('password-token').value;
  const Password = document.getElementById('new-password').value;
  fetch('http://localhost:3000/Users/PasswordUpdate', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, Password })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error || data.errors[0].msg))
    .catch(err => alert('Password update failed.'));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchUserInfo);
