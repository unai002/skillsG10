// Para cargar el leaderboard con la información ya guardada
async function loadLeaderboard() {
    try {
        const response = await fetch('badges/badges.json');
        const data = await response.json();

        const tbody = document.getElementById('leaderboard-body');
        data.forEach((item, index) => {
            const row = document.createElement('tr');

            const rangoCell = document.createElement('td');
            rangoCell.textContent = item.rango;
            row.appendChild(rangoCell);

            const badgeCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = `badges/${item.png.replace('.png', '-min.png')}`;
            badgeCell.appendChild(img);
            row.appendChild(badgeCell);

            const bitpointsCell = document.createElement('td');
            if (index === data.length - 1) {
                bitpointsCell.textContent = `${item['bitpoints-min']} <`;
            } else {
                bitpointsCell.textContent = `${item['bitpoints-min']} - ${item['bitpoints-max']}`;
            }
            row.appendChild(bitpointsCell);

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar la información del leaderboard.:', error);
    }
}

window.onload = loadLeaderboard;