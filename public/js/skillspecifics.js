function loadInformation() {
    const skillHexagon = localStorage.getItem('skillHexagon');
    if (skillHexagon) {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');
        svgContainer.innerHTML = skillHexagon;
        document.querySelector('.hexagon-container').appendChild(svgContainer);
    }

    const infoColumn = document.querySelector('.info-column');
    const title = document.getElementById('title');
    const descriptionText = document.getElementById('descriptionText');
    const skillPoints = document.getElementById('skillPoints');

    fetch('electronics/skills.json')
        .then(response => response.json())
        .then(skills => {
            const skillFind = skills.find(item => (item.id).toString() === localStorage.getItem('skillId'));

            if (skillFind) {
                text = (skillFind.text).replace(/\n/g, " ");
                title.innerText = 'Skill: ' + text;
            } else {
                console.log("No se encontró el objeto con el ID especificado");
            }
        });

    const checkboxes = document.querySelectorAll('.checkbox');
    const textBoxTittle = document.getElementById('textBoxTitle');
    const textBox = document.getElementById('textBox');
    const buttonSubmit = document.getElementById('buttonSubmit');

    function ckeckBoxVerify() {
        const allCheck = Array.from(checkboxes).every(checkbox => checkbox.checked);

        if (allCheck) {
            textBoxTittle.style.display = 'block';
            textBox.style.display = 'block';
            buttonSubmit.style.display = 'block';
        } else {
            textBoxTittle.style.display = 'none';
            textBox.style.display = 'none';
            buttonSubmit.style.display = 'none';
        }
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', ckeckBoxVerify);
    });

    buttonSubmit.addEventListener('click', (e) => {
        let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
        let skillId = localStorage.getItem('skillId');

        if (evidencias[skillId]) {
            evidencias[skillId]++;
        } else {
            evidencias[skillId] = 1;
        }

        localStorage.setItem('evidencias', JSON.stringify(evidencias));
    });

}

window.onload = loadInformation;