function handleBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = '/admin/dashboard';
    });
}

async function loadLeaderboard() {
    try {
        const response = await fetch('/admin/badges', {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        const tbody = document.getElementById('leaderboard-body');
        data.forEach((item) => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);

            const badgeCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = `/badges/${item.image_url.replace(/-min\.png$/, '.png').replace('.png', '-min.png')}`;
            badgeCell.appendChild(img);
            row.appendChild(badgeCell);

            const minBitpointsCell = document.createElement('td');
            minBitpointsCell.textContent = item['bitpoints_min'];
            row.appendChild(minBitpointsCell);

            const maxBitpointsCell = document.createElement('td');
            maxBitpointsCell.textContent = item['bitpoints_max'];
            row.appendChild(maxBitpointsCell);

            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions-cell';
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', () => {
                window.location.href = `/admin/badges/edit/${encodeURIComponent(item.name)}`;
            });
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', async () => {
                try {
                    const response = await fetch(`/admin/badges/delete/${encodeURIComponent(item.name)}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        row.remove();
                    } else {
                        console.error('Failed to delete badge');
                    }
                } catch (error) {
                    console.error('Error deleting badge:', error);
                }
            });
            actionsCell.appendChild(deleteButton);

            row.appendChild(actionsCell);

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar la información del leaderboard:', error);
    }
}

window.onload = function() {
    loadLeaderboard();
    handleBackButton();
}