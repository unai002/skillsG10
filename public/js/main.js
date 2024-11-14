// CONSTRUCCIÓN DE LOS HEXÁGONOS
fetch('electronics/skills.json')
    .then(response => response.json())
    .then(skills => {
        const svgContainer = document.querySelector('.svg-container');
        skills.forEach(skill => {
            const svgWrapper = document.createElement('div');
            svgWrapper.classList.add('svg-wrapper');
            svgWrapper.setAttribute('data-id', skill.id);
            svgWrapper.setAttribute('data-custom', 'false');

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            svg.setAttribute('viewBox', '0 0 100 100');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5');
            polygon.classList.add('hexagon');
            svg.appendChild(polygon);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '50%');
            text.setAttribute('y', '20%');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'black');
            text.setAttribute('font-size', '9.5');

            const lines = skill.text.split('\n');
            let dy = 1.2;
            lines.forEach((line, index) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', '50%');
                tspan.setAttribute('dy', `${dy}em`);
                tspan.setAttribute('font-weight', 'bold');
                tspan.textContent = line;
                text.appendChild(tspan);
            });

            svg.appendChild(text);

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('x', '35%');
            image.setAttribute('y', '60%');
            image.setAttribute('width', '30');
            image.setAttribute('height', '30');
            image.setAttribute('href', `../electronics/icons/${skill.icon}`);
            svg.appendChild(image);

            svgWrapper.appendChild(svg);
            svgContainer.appendChild(svgWrapper);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });

// FUNCIONES

function eventManager() {
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

    document.querySelectorAll('.svg-wrapper').forEach(wrapper => {
        const cuaderno = wrapper.querySelector('.emojiCuaderno');
        if (cuaderno) {
            cuaderno.addEventListener('click', (event) => {
                const skillId = wrapper.getAttribute('data-id');
                localStorage.setItem('skillId', skillId);
                storeSkillHexagon(wrapper);
                window.location.href = 'skillspecifics.html';
            });
        }
    });
}

function storeSkillHexagon(wrapper) {
    const svgElement = wrapper.querySelector('svg');
    if (svgElement) {
        localStorage.setItem('skillHexagon', svgElement.outerHTML);
    }
}

function loadRedDots() {
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};

    for (let skillId in evidencias) {
        const svgWrapper = document.querySelector(`.svg-wrapper[data-id="${skillId}"]`);
        if (svgWrapper) {
            const redDot = document.createElement('div');
            redDot.classList.add('redNotification');
            redDot.innerText = evidencias[skillId]; // Update the number inside the red dot
            svgWrapper.appendChild(redDot);
        }
    }
}

function createLowerBanner() {
    const descriptionBanner = document.createElement('div');
    descriptionBanner.id = 'description-banner';
    descriptionBanner.classList.add('description-banner');
    document.body.appendChild(descriptionBanner);
}

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

window.onload = function() {
    const fetchPencil = fetch('https://www.reshot.com/preview-assets/icons/U3A6CNXBDH/pencil-U3A6CNXBDH.svg')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        });

    const fetchNotebook = fetch('https://www.reshot.com/preview-assets/icons/UVG3NADPR2/note-book-UVG3NADPR2.svg')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        });

    Promise.all([fetchPencil, fetchNotebook])
        .then(([pencilSvg, notebookSvg]) => {
            appendEmoji(pencilSvg, 'emojiLapiz');
            appendEmoji(notebookSvg, 'emojiCuaderno');
            eventManager();
        })
        .catch(error => {
            console.error('Error loading the SVGs:', error);
        });

    createLowerBanner();
    loadRedDots();
};
