// main.js

fetch('electronics/skills.json')
    .then(response => response.json())
    .then(skills => {
        // Seleccionar el contenedor donde se van a agregar los SVGs
        const svgContainer = document.querySelector('.svg-container');

        // Recorrer cada skill y crear el panel dinámicamente
        skills.forEach(skill => {
            // Crear un div para envolver el SVG y el contenido
            const svgWrapper = document.createElement('div');
            svgWrapper.classList.add('svg-wrapper');
            svgWrapper.setAttribute('data-id', skill.id);
            svgWrapper.setAttribute('data-custom', 'false');

            // Crear el SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            svg.setAttribute('viewBox', '0 0 100 100');

            // Crear el hexágono
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5');
            polygon.classList.add('hexagon');
            svg.appendChild(polygon);

            // Crear el texto dentro del SVG
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '50%');
            text.setAttribute('y', '20%');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'black');
            text.setAttribute('font-size', '9.5');

            // Dividir el texto en líneas
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


            // Añadir la imagen (icono) al SVG
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('x', '35%');
            image.setAttribute('y', '60%');
            image.setAttribute('width', '30');
            image.setAttribute('height', '30');
            image.setAttribute('href', `../electronics/icons/${skill.icon}`);  // Ruta correcta para los iconos
            svg.appendChild(image);

            // Añadir el SVG a la envoltura
            svgWrapper.appendChild(svg);

            // Añadir la envoltura al contenedor
            svgContainer.appendChild(svgWrapper);

        });
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

window.onload = function() {
    fetch('https://www.reshot.com/preview-assets/icons/U3A6CNXBDH/pencil-U3A6CNXBDH.svg')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text(); // Lee el contenido como texto
        })
        .then(svgContent => {
            const containers = document.querySelectorAll('.svg-wrapper');
            containers.forEach((cont) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgContent;
                const svgElement = tempDiv.firstChild;
                svgElement.classList.add('emojiContainer')
                // Agregar el elemento SVG al contenedor
                cont.appendChild(svgElement);
            })
        })
        .catch(error => {
            console.error('Error al cargar el SVG:', error);
        });
};