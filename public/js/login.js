window.onload = function () {
    document.getElementById('loginButton').addEventListener('click', async function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const messageDiv = document.getElementById('message');
        messageDiv.textContent = ''; // Limpiar cualquier mensaje previo

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

            const data = await response.json(); // Parsear la respuesta JSON

            if (response.ok) {
                // Si la respuesta es exitosa, mostramos mensaje y almacenamos el token
                messageDiv.textContent = 'Inicio de sesión exitoso';
                messageDiv.style.color = 'green';

                // Guardar el token JWT en localStorage
                localStorage.setItem('authToken', data.token);

                // Redirigir a la página principal
                window.location.href = '/main.html'; // Asegúrate de que la ruta sea correcta
            } else {
                // Si la respuesta no es exitosa, mostrar mensaje de error
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
