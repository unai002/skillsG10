function handleBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = '/skills/electronics';
    });
}

window.onload = function() {
    handleBackButton();
}