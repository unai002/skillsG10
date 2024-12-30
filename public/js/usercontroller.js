function handleBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = '/admin/dashboard';
    });
}

window.onload = () => {
    // Función para mostrar/ocultar el formulario de cambio de contraseña
    const togglePasswordForm = (userId) => {
        const form = document.getElementById(`password-form-${userId}`);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    };

    // Añadir event listeners a todos los botones
    const buttons = document.querySelectorAll('[data-user-id]');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            togglePasswordForm(userId);
        });
    });

    handleBackButton();
};