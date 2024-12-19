window.onload = function() {
    // Agregar event listener al botón de registro
    document.getElementById('registerButton').addEventListener('click', async function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const messageDiv = document.getElementById('message');
        messageDiv.textContent = '';

        // Validar que ambos campos estén llenos
        if (!username || !password) {
            messageDiv.textContent = 'Por favor, completa todos los campos.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            // Realizar la solicitud POST al servidor para registrar al usuario
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.textContent = 'Usuario registrado exitosamente';
                messageDiv.style.color = 'green';

                window.location.href = '/';
            } else {
                messageDiv.textContent = data.message || 'Error al registrar el usuario.';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            messageDiv.textContent = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
            messageDiv.style.color = 'red';
        }
    });
};
