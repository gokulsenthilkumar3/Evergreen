document.getElementById('setup').addEventListener('submit', async event => {
  event.preventDefault();
  const button = document.querySelector('button');
  button.disabled = true;
  try {
    const result = await window.evergreenSetup.submit({ username: document.getElementById('username').value,
      email: document.getElementById('email').value, password: document.getElementById('password').value });
    if (result.error) throw new Error(result.error);
    document.getElementById('password').value = '';
  } catch (error) { document.getElementById('error').textContent = error.message; button.disabled = false; }
});
