function loadInformation() {
    const skillHexagon = localStorage.getItem('skillHexagon');
    if (skillHexagon) {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');
        svgContainer.innerHTML = skillHexagon;
        document.querySelector('.hexagon-container').appendChild(svgContainer);
    }

    //const description = document.getElementById('skill-description');
    const infoColumn = document.querySelector('.info-column');
    const title = document.getElementById('title');
    const descriptionText = document.getElementById('descriptionText');
    const skillPoints = document.getElementById('skillPoints');

    fetch('electronics/skills.json')
        .then(response => response.json())
        .then(skills => {
            const skillFind = skills.find(item => (item.id).toString() === localStorage.getItem('skillId'));

            if (skillFind) {
                //console.log(skillFind.text); // Muestra el texto del objeto
                text = (skillFind.text).replace(/\n/g, " ");
                title.innerText = 'Skill: ' + text;
            } else {
                console.log("No se encontró el objeto con el ID especificado");
            }
        })

    const checkboxes = document.querySelectorAll('.checkbox');
    const textBoxTittle = document.getElementById('textBoxTittle')
    const textBox = document.getElementById('textBox');
    const buttonSubmit = document.getElementById('buttonSubmit');

    // Función para verificar si todas las checkboxes están seleccionadas
    function ckeckBoxVerify() {
        const allCheck = Array.from(checkboxes).every(checkbox => checkbox.checked);

        // Muestra u oculta el cuadro de texto
        if (allCheck) {
            textBoxTittle.style.display = 'block';
            textBox.style.display = 'block';
            buttonSubmit.style.display = 'block';
        } else {
            textBoxTittle.style.display = 'none'
            textBox.style.display = 'none';
            buttonSubmit.style.display = 'none';
        }
    }

    // Agrega un listener a cada checkbox para verificar cambios
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', ckeckBoxVerify);
    });
}

window.onload = loadInformation;