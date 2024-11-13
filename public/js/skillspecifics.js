function loadInformation() {
    const skillHexagon = localStorage.getItem('skillHexagon');
    if (skillHexagon) {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');
        svgContainer.innerHTML = skillHexagon;
        document.querySelector('.hexagon-container').appendChild(svgContainer);
    }

    const title = document.getElementById('title');
    const description = document.getElementById('skill-description');
    const infoColumn = document.querySelector('.info-column');

    infoColumn.appendChild(title);
    infoColumn.appendChild(description);
}

window.onload = loadInformation;