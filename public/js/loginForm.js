form.addEventListener('submit', function (e) {
  e.preventDefault();
  errorDiv.textContent = '';
  const data = {
    email: form.email.value,
    password: form.password.value
  };
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(data)
  })
  .then(async res => {
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      } else {
        throw new Error('Server error or invalid response');
      }
    }
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      throw new Error('Server error or invalid response');
    }
  })
  .then(data => {
    if (data.role === 'manager') window.location = '/manager-dashboard';
    else if (data.role === 'director') window.location = '/dashboard';
    else if (data.role === 'salesAgent') window.location = '/sales-manager-dashboard';
    else window.location = '/';
  })
  .catch(err => {
    errorDiv.textContent = err.message;
  });
});

console.log('Login POST body:', req.body);