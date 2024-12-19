// CONSTRUCCIÓN DE LOS HEXÁGONOS

// Obtenemos la información de los skills
fetch('/electronics/skills.json')
    .then(response => response.json())
    .then(skills => {
        const svgContainer = document.querySelector('.svg-container');
        skills.forEach(skill => {

            // Contenedor
            const svgWrapper = document.createElement('div');
            svgWrapper.classList.add('svg-wrapper');
            svgWrapper.setAttribute('data-id', skill.id);
            svgWrapper.setAttribute('data-custom', 'false');

            // SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            svg.setAttribute('viewBox', '0 0 100 100');

            // Hexágono
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5');
            polygon.classList.add('hexagon');
            svg.appendChild(polygon); // Lo metemos dentro del SVG

            // Objeto texto
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '50%');
            text.setAttribute('y', '20%');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'black');
            text.setAttribute('font-size', '9.5');

            // Extraemos las líneas del texto y creamos objetos tspan
            const lines = skill.text.split('\n');
            let dy = 1.2;
            lines.forEach((line, index) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', '50%');
                tspan.setAttribute('dy', `${dy}em`);
                tspan.setAttribute('font-weight', 'bold');
                tspan.textContent = line;
                text.appendChild(tspan); // Metemos los tspan dentro del texto
            });

            svg.appendChild(text); // Metemos el texto dentro del SVG

            // Icono
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('x', '35%');
            image.setAttribute('y', '60%');
            image.setAttribute('width', '30');
            image.setAttribute('height', '30');
            image.setAttribute('href', `/electronics/icons/${skill.icon}`);
            svg.appendChild(image); // Metemos el icono en el SVG

            svgWrapper.appendChild(svg); // Metemos el SVG en el contenedor
            svgContainer.appendChild(svgWrapper);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// FUNCIONES

function eventManager() {

    // Para que aparezca la descripción al pasar el ratón por los skills
    document.querySelectorAll('.svg-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mouseover', () => {
            let banner = document.querySelector('.description-banner');
            banner.style.display = 'block';
            banner.innerHTML = `Descripción de la tarea: ${wrapper.getAttribute('data-id')}`;
        });
        wrapper.addEventListener('mouseout', () => {
            document.querySelector('.description-banner').style.display = 'none';
        });
    });

    // Manejar el click en el icono del cuaderno de cada skill
    document.querySelectorAll('.svg-wrapper').forEach(wrapper => {
        const cuaderno = wrapper.querySelector('.emojiCuaderno');
        if (cuaderno) {
            cuaderno.addEventListener('click', (event) => {
                const skillId = wrapper.getAttribute('data-id');
                localStorage.setItem('skillId', skillId);
                storeSkillHexagon(wrapper);
                window.location.href = `/skills/electronics/view/${skillId}`;
            });
        }
    });
}

// Para guardar el hexágono en localstorage y poder pasarlo entre páginas
function storeSkillHexagon(wrapper) {
    const svgElement = wrapper.querySelector('svg');
    if (svgElement) {
        localStorage.setItem('skillHexagon', svgElement.outerHTML);
    }
}

// Para colorear en verde una skill y cambiar el punto rojo por otro verde (cuando esté aprobada)
function approveEvidence(skillId) {
    const svgWrapper = document.querySelector(`.svg-wrapper[data-id="${skillId}"]`);
    const hex = svgWrapper.getElementsByClassName('hexagon')[0];
    if (hex) {
        hex.style.fill = '#2afa2a';
    }
    const redDot = svgWrapper.getElementsByClassName('redNotification')[0];
    const greenDot = svgWrapper.getElementsByClassName('greenNotification')[0];

    // Utilizamos la propiedad de estilo "display" para hacer los elementos aparecer y desaparecer
    if (redDot) {
        redDot.style.display = 'none'; // No aparece
    }

    if (greenDot) {
        greenDot.style.display = 'flex'; // Se posiciona en la pantalla
    }
}

// Para crear los puntos de notificaciones en los hexágonos de skills
function loadNotificationDots() {
    // Obtenemos el array donde se guarda la información de las evidencias y el usuario
    let evidencias = localStorage.getItem('evidencias');
    const currentUser = localStorage.getItem('currentUser');

    try {
        evidencias = JSON.parse(evidencias) || {};
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        return;
    }

    for (let skillId in evidencias) {
        // Por cada skill contamos las evidencias
        const evidenceList = evidencias[skillId];
        const evidenceCount = evidenceList.length;

        // Si hay alguna evidencia, se crean los círculos de notificación
        if (evidenceCount > 0) {
            const svgWrapper = document.querySelector(`.svg-wrapper[data-id="${skillId}"]`);
            if (svgWrapper) {
                const redDot = document.createElement('div');
                const greenDot = document.createElement('div');
                redDot.classList.add('redNotification');
                greenDot.classList.add('greenNotification');
                redDot.innerText = evidenceCount;
                greenDot.innerText = evidenceCount;
                svgWrapper.appendChild(redDot);
                svgWrapper.appendChild(greenDot);

                // Si hay alguna evidencia que el usuario actual ha publicado y está aprobada,
                // llamamos a la función approveEvidence que coloreará el hexágono en verde
                const userEvidence = evidenceList.find(evidence => evidence.username === currentUser);
                if (userEvidence && userEvidence.approved) {
                    approveEvidence(skillId);
                }
            }
        }
    }
}

// Para crear la barra donde se visualiza la descripción de la skill
function createLowerBanner() {
    const descriptionBanner = document.createElement('div');
    descriptionBanner.id = 'description-banner';
    descriptionBanner.classList.add('description-banner');
    document.body.appendChild(descriptionBanner);
}

// Para insertar un emoji dentro de todos los hexágonos
function appendEmoji(svgContent, className) {
    const containers = document.querySelectorAll('.svg-wrapper');
    containers.forEach((cont) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        const svgElement = tempDiv.firstChild;
        svgElement.classList.add('emojiContainer');
        svgElement.classList.add(className);
        cont.appendChild(svgElement);
    });
}

// INICIALIZACIÓN DE LA PÁGINA

window.onload = async function () {
    // Retrieve user info from localStorage
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // If userInfo is not in localStorage, fetch it from the server
    userInfo = await getUserInfo();
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    const currentUserRole = userInfo ? userInfo.admin ? 'admin' : 'user' : null;
    const currentUserName = userInfo ? userInfo.username : 'Guest';
    console.log("currentUserName", currentUserName);
    // Display welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.innerHTML = `Welcome, <strong>${currentUserName}</strong>!`;

    // Handle logout button
    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();
        if (result.status === 'success') {
            localStorage.removeItem('userInfo'); // Clear user info from localStorage
            window.location.href = '/'; // Redirect to the homepage
        } else {
            console.error('Error al cerrar la sesión:', result.message);
        }
    });

    // Fetch and append emojis
    const fetchNotebook = fetch('https://www.reshot.com/preview-assets/icons/UVG3NADPR2/note-book-UVG3NADPR2.svg')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        });

    let fetchPencil = Promise.resolve(null);
    if (currentUserRole === 'admin') {
        fetchPencil = fetch('https://www.reshot.com/preview-assets/icons/U3A6CNXBDH/pencil-U3A6CNXBDH.svg')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            });
    }

    Promise.all([fetchPencil, fetchNotebook])
        .then(([pencilSvg, notebookSvg]) => {
            if (pencilSvg) {
                appendEmoji(pencilSvg, 'emojiLapiz');
            }
            appendEmoji(notebookSvg, 'emojiCuaderno');
            eventManager();
        })
        .catch(error => {
            console.error('Error loading icons:', error);
        });

    createLowerBanner();
    loadNotificationDots();
};

async function getUserInfo() {
    try {
        const response = await fetch('/users/info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await response.json();
        return userInfo;
    } catch (error) {
        console.error('Error fetching user information:', error);
        return null;
    }
}