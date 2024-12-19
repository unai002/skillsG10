// Función para cargar el hexágono de la skill que habíamos guardado en localstorage
function loadSkillHexagon() {
    const skillHexagon = localStorage.getItem('skillHexagon');
    if (skillHexagon) {
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');
        svgContainer.innerHTML = skillHexagon;
        document.querySelector('.hexagon-container').appendChild(svgContainer);
    }
}

// Función para cargar la información de la skill dada en la página
function loadSkillInformation(skillId) {
    fetch('/electronics/skills.json')
        .then(response => response.json())
        .then(skills => {
            const skillFind = skills.find(item => (item.id).toString() === skillId);
            if (skillFind) {
                let text = (skillFind.text).replace(/\n/g, " ");
                document.getElementById('title').innerText = 'Skill: ' + text;
            } else {
                console.log("ERROR: no se ha encontrado la información de la competencia a cargar.");
            }
        });
}

// Para llamar cada vez que se marque o desmarque una tarea (checkbox)
function checkBoxVerify() {
    const checkboxes = document.querySelectorAll('.checkbox');
    const allCheck = Array.from(checkboxes).every(checkbox => checkbox.checked);
    const textBoxTittle = document.getElementById('textBoxTitle');
    const textBox = document.getElementById('textBox');
    const buttonSubmit = document.getElementById('buttonSubmit');

    // Si todas están marcadas mostramos el formulario + confetti
    if (allCheck) {
        textBoxTittle.style.display = 'block';
        textBox.style.display = 'block';
        buttonSubmit.style.display = 'block';
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        // Si hay alguna sin marcar lo ocultamos
        textBoxTittle.style.display = 'none';
        textBox.style.display = 'none';
        buttonSubmit.style.display = 'none';
    }

    // Actualizamos el estado de las tareas de el usuario actual en localstorage
    const skillId = localStorage.getItem('skillId');
    const taskStates = Array.from(checkboxes).map(checkbox => checkbox.checked);
    let localTasksCompleted = JSON.parse(localStorage.getItem('localTasksCompleted')) || {};
    const currentUser = localStorage.getItem('currentUser');

    if (!localTasksCompleted[skillId]) {
        localTasksCompleted[skillId] = {};
    }

    localTasksCompleted[skillId][currentUser] = taskStates;
    localStorage.setItem('localTasksCompleted', JSON.stringify(localTasksCompleted));
}

// Para cargar la información de las tareas que el usuario actual tiene marcadas
function loadUserTasks(skillId) {
    const checkboxes = document.querySelectorAll('.checkbox');
    const localTasksCompleted = JSON.parse(localStorage.getItem('localTasksCompleted')) || {};
    const currentUser = localStorage.getItem('currentUser');
    // Por cada skill, se guarda un array de booleans que indica las tareas que cada usuario ha completado
    const savedTaskStates = localTasksCompleted[skillId] ? localTasksCompleted[skillId][currentUser] : null;

    if (savedTaskStates) {
        // Si ya existe, se checkean las tareas dependiendo de sus valores
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = savedTaskStates[index];
        });
        checkBoxVerify();
    } else {
        // Si no existe, ningún usuario ha checkeado ninguna de las tareas, se inicializan sin marcar
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        checkBoxVerify();
    }

    // En todas las checkboxes de la página añadimos el listener para llamar a checkBoxVerify cada vez
    // que alguna checkbox cambie de estado
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkBoxVerify);
    });
}

// Para cargar la evidencia que el usuario puede haber enviado ya
function loadEvidence(skillId) {
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    const currentUser = localStorage.getItem('currentUser');
    if (evidencias[skillId]) {
        const userEvidence = evidencias[skillId].find(evidence => evidence.username === currentUser);
        // Si el usuario ya había enviado una evidencia para la skill, la cargamos en la caja de texto
        if (userEvidence) {
            document.getElementById('textBox').value = userEvidence.evidence;
        }
    }
}

// Para controlar el envío de evidencias
function handleEvidenceSubmission() {
    const buttonSubmit = document.getElementById('buttonSubmit');

    // Listener cuando el usuario quiera enviar una evidencia
    buttonSubmit.addEventListener('click', (e) => {

        // Comprobación de que la evidencia no esté vacía
        let evidenceText = document.getElementById('textBox').value.trim();
        if (evidenceText === '') {
            alert('No puedes enviar una evidencia vacía.');
            return;
        }

        let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
        const skillId = localStorage.getItem('skillId');
        const currentUser = localStorage.getItem('currentUser');

        if (!evidencias[skillId]) {
            // Si no existen evidencias para la skill, creamos el array vacío
            evidencias[skillId] = [];
        }

        // Entre las evidencias para la skill, buscamos la que el usuario haya enviado (si existe)
        const userEvidenceIndex = evidencias[skillId].findIndex(evidence => evidence.username === currentUser);

        if (userEvidenceIndex !== -1) {
            // Si no existe, creamos un objeto nuevo
            evidencias[skillId][userEvidenceIndex].evidence = evidenceText;
            evidencias[skillId][userEvidenceIndex].approved = false;
            evidencias[skillId][userEvidenceIndex].approvals = [];
        } else {
            // Si ya existía, la reemplazamos con la nueva y reseteamos las aprobaciones
            evidencias[skillId].push({
                username: currentUser,
                evidence: evidenceText,
                approved: false,
                approvals: []
            });
        }

        localStorage.setItem('evidencias', JSON.stringify(evidencias));
    });
}

// Para controlar el botón de volver
function handleBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = '/skills/electronics';
    });
}

// Para cargar las evidencias enviadas en la tabla de evidencias
function loadAndDisplayEvidences(skillId) {
    const evidenceTableContainer = document.getElementById('evidenceTableContainer');
    const evidenceTableBody = document.querySelector('#evidenceTable tbody');
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');

    // Si hay alguna evidencia para la skill actual
    if (evidencias[skillId] && evidencias[skillId].length > 0) {
        evidencias[skillId].forEach((evidence, index) => {
            const row = document.createElement('tr');
            const approvalCount = evidence.approvals ? evidence.approvals.length : 0;
            // Creamos una fila (row, tr) y dentro las columnas necesarias (td)
            // Construimos el código HTML para las columnas, incluyendo el usuario y la evidencia (el texto)
            // En la última columna añadimos un botón para aprobar la evidencia si el usuario NO es admin
            // Si el usuario ES admin, en la última columna añadimos botones para aprobar o rechazar
            row.innerHTML = `
                <td>${evidence.username}</td>
                <td>${evidence.evidence}</td>
                <td>
                    ${evidence.approved ? `
                        <span class="approved-label">Approved</span>
                    ` : `
                        ${currentUserRole === 'admin' ? `
                            <button class="approve-btn" data-index="${index}">Approve</button>
                            <button class="reject-btn" data-index="${index}">Reject</button>
                        ` : `
                            <button class="approve-btn" data-index="${index}">Approve</button>
                        `}
                        <span class="approval-count">(${approvalCount} approvals)</span>
                    `}
                </td>
            `;
            evidenceTableBody.appendChild(row);
        });
        evidenceTableContainer.style.display = 'block';
    } else {
        // Si no hay evidencias no mostramos la tabla
        evidenceTableContainer.style.display = 'none';
    }

    // Añadimos event listeners a los botones creados para llamar a las funciones correspondientes
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', handleApprove);
    });

    if (currentUserRole === 'admin') {
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', handleReject);
        });
    }
}

// Para manejar cuando una evidencia es aprobada
function handleApprove(event) {
    const skillId = localStorage.getItem('skillId');
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');
    const index = event.target.getAttribute('data-index');

    if (evidencias[skillId][index].username === currentUser) {
        alert("No puedes aprobar tu propia evidencia.");
        return;
    }

    if (currentUserRole === 'admin') {
        // Si es admin directamente aprueba la evidencia
        evidencias[skillId][index].approved = true;
    } else {
        // Si no es admin sumamos un aprobado, y solo cuando sean 3 se aprobará la evidencia
        if (!evidencias[skillId][index].approvals) {
            evidencias[skillId][index].approvals = [];
        }

        if (!evidencias[skillId][index].approvals.includes(currentUser)) {
            evidencias[skillId][index].approvals.push(currentUser);
        }

        if (evidencias[skillId][index].approvals.length >= 3) {
            evidencias[skillId][index].approved = true;
        }
    }

    localStorage.setItem('evidencias', JSON.stringify(evidencias));
    location.reload();
}

// Para controlar cuando una evidencia es rechazada
function handleReject(event) {
    const skillId = localStorage.getItem('skillId');
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    const index = event.target.getAttribute('data-index');

    // La eliminamos directamente
    evidencias[skillId].splice(index, 1);

    localStorage.setItem('evidencias', JSON.stringify(evidencias));
    location.reload();
}

// Función principal, carga la información llamando a las funciones anteriores
function loadInformation() {
    const skillId = localStorage.getItem('skillId');
    loadSkillHexagon();
    loadSkillInformation(skillId);
    loadUserTasks(skillId);
    loadEvidence(skillId);
    handleEvidenceSubmission();
    handleBackButton();
    loadAndDisplayEvidences(skillId);
}

window.onload = () => {
    loadInformation();
};

