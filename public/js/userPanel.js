// Código para manejar el panel de cambio de usuario.

// Para actualizar el mensaje de bienvenida con el nombre de usuario
function updateWelcomeMessage() {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (currentUser && currentUserRole) {
        welcomeMessage.textContent = `Welcome ${currentUser} (${currentUserRole})`;
    } else {
        welcomeMessage.textContent = '';
    }
}

// Event listener cuando al cargar el contenido (similar a window.onload)
document.addEventListener('DOMContentLoaded', () => {
    const userSelect = document.getElementById('userSelect');
    const applyUserButton = document.getElementById('applyUser');

    // Por defecto, si no hay usuario lo ponemos como user1
    if (!localStorage.getItem('currentUser')) {
        const defaultUser = 'user1';
        const defaultUserRole = 'user';
        localStorage.setItem('currentUser', defaultUser);
        localStorage.setItem('currentUserRole', defaultUserRole);
        userSelect.value = defaultUser;
    } else {
        userSelect.value = localStorage.getItem('currentUser');
    }

    // Event listener cuando se aplique el usuario escogido
    applyUserButton.addEventListener('click', () => {
        const selectedUser = userSelect.options[userSelect.selectedIndex];
        const userName = selectedUser.value;
        const userRole = selectedUser.getAttribute('data-role');

        // Guarda en localstorage y alerta del cambio
        localStorage.setItem('currentUser', userName);
        localStorage.setItem('currentUserRole', userRole);

        alert(`Usuario cambiado a ${userName} con el rol ${userRole}`);
        updateWelcomeMessage();
        location.reload();
    });

    updateWelcomeMessage();
});