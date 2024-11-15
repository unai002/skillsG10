document.addEventListener('DOMContentLoaded', () => {
    const userSelect = document.getElementById('userSelect');
    const applyUserButton = document.getElementById('applyUser');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Set default user to user1 only if not already set
    if (!localStorage.getItem('currentUser')) {
        const defaultUser = 'user1';
        const defaultUserRole = 'user';
        localStorage.setItem('currentUser', defaultUser);
        localStorage.setItem('currentUserRole', defaultUserRole);
        userSelect.value = defaultUser;
    } else {
        userSelect.value = localStorage.getItem('currentUser');
    }

    function updateWelcomeMessage() {
        const currentUser = localStorage.getItem('currentUser');
        const currentUserRole = localStorage.getItem('currentUserRole');
        if (currentUser && currentUserRole) {
            welcomeMessage.textContent = `Welcome ${currentUser} (${currentUserRole})`;
        } else {
            welcomeMessage.textContent = '';
        }
    }

    applyUserButton.addEventListener('click', () => {
        const selectedUser = userSelect.options[userSelect.selectedIndex];
        const userName = selectedUser.value;
        const userRole = selectedUser.getAttribute('data-role');

        localStorage.setItem('currentUser', userName);
        localStorage.setItem('currentUserRole', userRole);

        alert(`User changed to ${userName} with role ${userRole}`);
        updateWelcomeMessage();
        location.reload();
    });

    updateWelcomeMessage(); // Update the welcome message on page load
});