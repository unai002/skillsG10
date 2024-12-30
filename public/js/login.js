window.onload = function () {
    document.getElementById('loginButton').addEventListener('click', async function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const messageDiv = document.getElementById('message');
        messageDiv.textContent = '';

        if (!username || !password) {
            messageDiv.textContent = 'Por favor, completa todos los campos.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Inicio de sesión exitoso';
                messageDiv.style.color = 'green';

                window.location.href = '/skills/';
            } else {
                messageDiv.textContent = data.message || 'Error al iniciar sesión.';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            messageDiv.textContent = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
            messageDiv.style.color = 'red';
        }
    });
};
