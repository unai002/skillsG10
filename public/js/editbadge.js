function handleBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = '/admin/badges';
    });
}

function updateImagePreview() {
    const imageUrl = document.getElementById('imageUrl').value;
    document.getElementById('imagePreview').src = `/badges/${imageUrl}`;
}

window.onload = function() {
    handleBackButton();
    const imageUrlInput = document.getElementById('imageUrl');
    const imageUrl = imageUrlInput.value;
    if (!imageUrl.includes('-min.png')) {
        imageUrlInput.value = imageUrl.replace('.png', '-min.png');
    }
    updateImagePreview();
}