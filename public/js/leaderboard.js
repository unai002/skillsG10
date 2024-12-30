async function loadLeaderboard() {
    try {
        const badgesResponse = await fetch('/users/badges');
        const badges = await badgesResponse.json();

        const usersResponse = await fetch('/users/allUsers');
        const users = await usersResponse.json();

        const nonAdminUsers = users.filter(user => !user.admin);

        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        badges.forEach((item, index) => {
            const row = document.createElement('tr');

            const rangoCell = document.createElement('td');
            rangoCell.textContent = item.name;
            row.appendChild(rangoCell);

            const badgeCell = document.createElement('td');
            const img = document.createElement('img');
            img.src = `/badges/${item.image_url.replace('.png', '-min.png')}`;
            badgeCell.appendChild(img);
            row.appendChild(badgeCell);

            const bitpointsCell = document.createElement('td');
            if (index === badges.length - 1) {
                bitpointsCell.textContent = `${item.bitpoints_min} <`;
            } else {
                bitpointsCell.textContent = `${item.bitpoints_min} - ${item.bitpoints_max}`;
            }
            row.appendChild(bitpointsCell);

            tbody.appendChild(row);
        });

        const leaderboardTables = document.getElementById('leaderboard-tables');
        leaderboardTables.innerHTML = ''; // Clear any existing content
        for (const badge of badges) {
            const badgeSection = document.createElement('div');
            badgeSection.classList.add('badge-section');

            const badgeTitle = document.createElement('h2');
            badgeTitle.textContent = badge.name;
            badgeSection.appendChild(badgeTitle);

            const filteredUsers = nonAdminUsers.filter(user => user.score >= badge.bitpoints_min && user.score <= badge.bitpoints_max);

            if (filteredUsers.length === 0) {
                const noUsersText = document.createElement('p');
                noUsersText.textContent = 'No users have achieved this badge.';
                badgeSection.appendChild(noUsersText);
            } else {
                const table = document.createElement('table');
                table.classList.add('leaderboard-table');

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                const usernameHeader = document.createElement('th');
                usernameHeader.textContent = 'Username';
                headerRow.appendChild(usernameHeader);

                const scoreHeader = document.createElement('th');
                scoreHeader.textContent = 'Score';
                headerRow.appendChild(scoreHeader);

                const badgeHeader = document.createElement('th');
                badgeHeader.textContent = 'Badge';
                headerRow.appendChild(badgeHeader);

                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                filteredUsers.forEach(user => {
                    const row = document.createElement('tr');

                    const usernameCell = document.createElement('td');
                    usernameCell.textContent = user.username;
                    row.appendChild(usernameCell);

                    const scoreCell = document.createElement('td');
                    scoreCell.textContent = user.score;
                    row.appendChild(scoreCell);

                    const badgeCell = document.createElement('td');
                    const img = document.createElement('img');
                    img.src = `/badges/${badge.image_url.replace('.png', '-min.png')}`;
                    badgeCell.appendChild(img);
                    row.appendChild(badgeCell);

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                badgeSection.appendChild(table);
            }

            leaderboardTables.appendChild(badgeSection);
        }
    } catch (error) {
        console.error('Error al cargar la información del leaderboard:', error);
    }
}

window.onload = loadLeaderboard;