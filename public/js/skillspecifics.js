// Obtener los datos almacenados
const skillId = localStorage.getItem('skillId');
const skillsData = JSON.parse(localStorage.getItem('skillsData')); // Si guardas toda la lista de habilidades

if (skillsData && skillId) {
    const skill = skillsData.find(item => item.id === skillId);

    if (skill) {
        // Crear el contenedor SVG y el hexágono
        const svgContainer = document.querySelector('.svg-container');

        const svgWrapper = document.createElement('div');
        svgWrapper.classList.add('svg-wrapper');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100');
        svg.setAttribute('height', '100');
        svg.setAttribute('viewBox', '0 0 100 100');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5');
        polygon.classList.add('hexagon');
        svg.appendChild(polygon);

        // Texto en el hexágono
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '20%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'black');
        text.setAttribute('font-size', '9.5');

        const lines = skill.text.split('\n');
        let dy = 1.2;
        lines.forEach((line) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', '50%');
            tspan.setAttribute('dy', `${dy}em`);
            tspan.setAttribute('font-weight', 'bold');
            tspan.textContent = line;
            text.appendChild(tspan);
        });

        svg.appendChild(text);

        // Icono
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('x', '35%');
        image.setAttribute('y', '60%');
        image.setAttribute('width', '30');
        image.setAttribute('height', '30');
        image.setAttribute('href', `../electronics/icons/${skill.icon}`);
        svg.appendChild(image);

        svgWrapper.appendChild(svg);
        svgContainer.appendChild(svgWrapper);

        // Mostrar la descripción en el banner
        const banner = document.querySelector('.description-banner');
        banner.textContent = `Descripción de la tarea: ${skill.description}`;
    }
} else {
    console.error("Datos de la habilidad no encontrados.");
}
function loadHexagon() {
    const skillHexagon = localStorage.getItem('skillHexagon');
    if (skillHexagon) {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');
        svgContainer.innerHTML = skillHexagon;
        document.querySelector('.skill-details').appendChild(svgContainer);
    }
}

window.onload = loadHexagon;