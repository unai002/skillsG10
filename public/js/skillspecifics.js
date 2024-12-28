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
    fetch('/skills/electronics/info')
        .then(response => response.json())
        .then(skills => {
            const skillFind = skills.find(item => (item.id).toString() === skillId);
            if (skillFind) {
                let text = (skillFind.text).replace(/\n/g, " ");
                document.getElementById('title').innerText = 'Skill: ' + text;
                document.getElementById('skillScore').innerText = `Skill score: ${skillFind.score} points`;
                document.getElementById('descriptionText').innerText = skillFind.description;

                const taskList = document.querySelector('.checkbox-list');
                taskList.innerHTML = '';
                skillFind.tasks.forEach((task, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<input type="checkbox" class="checkbox" id="task${index + 1}"><label for="task${index + 1}">${task}</label>`;
                    taskList.appendChild(listItem);
                });

                const resourceList = document.querySelector('.list');
                resourceList.innerHTML = '';
                skillFind.resources.forEach(resource => {
                    const listItem = document.createElement('li');
                    listItem.textContent = resource;
                    resourceList.appendChild(listItem);
                });

                loadUserTasks(skillId); // Para asegurar que los checkboxes están cargados
            } else {
                console.log("ERROR: no se ha encontrado la información de la competencia a cargar.");
            }
        })
        .catch(error => {
            console.error('Error fetching skills:', error);
        });
}

// Para cargar la información de las tareas que el usuario actual tiene marcadas
async function loadUserTasks(skillId) {
    const checkboxes = document.querySelectorAll('.checkbox');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;

    if (!currentUser) {
        console.error('User info is missing or invalid');
        return;
    }

    try {
        const response = await fetch(`/skills/electronics/userTasks?skillId=${skillId}&username=${currentUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error fetching user tasks');
        }

        const data = await response.json();
        const savedTaskStates = data.taskStates;

        if (savedTaskStates) {
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = savedTaskStates[index];
            });
        } else {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }

        checkBoxVerify();

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', checkBoxVerify);
        });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
    }
}

// Para llamar cada vez que se marque o desmarque una tarea (checkbox)
function checkBoxVerify() {
    const checkboxes = document.querySelectorAll('.checkbox');
    const allCheck = Array.from(checkboxes).every(checkbox => checkbox.checked);
    const textBoxTittle = document.getElementById('textBoxTitle');
    const textBox = document.getElementById('textBox');
    const buttonSubmit = document.getElementById('buttonSubmit');

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
        textBoxTittle.style.display = 'none';
        textBox.style.display = 'none';
        buttonSubmit.style.display = 'none';
    }

    const skillId = localStorage.getItem('skillId');
    const taskStates = Array.from(checkboxes).map(checkbox => checkbox.checked);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;
    const skillTreeName = 'electronics';

    if (!currentUser) {
        console.error('User info is missing or invalid');
        return;
    }

    fetch(`/skills/${skillTreeName}/updateTasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            skillId: skillId,
            username: currentUser,
            taskStates: taskStates
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating user tasks');
            }
            return response.json();
        })
        .then(data => {
            console.log('User tasks updated successfully:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Para cargar la evidencia que el usuario puede haber enviado ya
async function loadEvidence(skillId) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;

    if (!currentUser) {
        console.error('User info is missing or invalid');
        return;
    }

    try {
        const response = await fetch(`/skills/electronics/getEvidence?skillId=${skillId}&username=${currentUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error fetching user evidence');
        }

        const data = await response.json();
        const userEvidence = data.evidence;

        if (userEvidence) {
            document.getElementById('textBox').value = userEvidence;
        }
    } catch (error) {
        console.error('Error fetching user evidence:', error);
    }
}

// Para controlar el envío de evidencias
function handleEvidenceSubmission() {
    const buttonSubmit = document.getElementById('buttonSubmit');

    buttonSubmit.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission

        let evidenceText = document.getElementById('textBox').value.trim();
        if (evidenceText === '') {
            alert('No puedes enviar una evidencia vacía.');
            return;
        }

        const skillId = localStorage.getItem('skillId');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const currentUser = userInfo ? userInfo.username : null;
        const skillTreeName = 'electronics';

        if (!currentUser) {
            console.error('User info is missing or invalid');
            return;
        }

        try {
            const response = await fetch(`/skills/${skillTreeName}/submit-evidence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    skillId: skillId,
                    evidence: evidenceText,
                    username: currentUser
                })
            });

            if (!response.ok) {
                throw new Error('Error updating user evidence');
            }

            const data = await response.json();
            console.log('User evidence updated successfully:', data);

            location.reload();
        } catch (error) {
            console.error('Error:', error);
        }
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
async function loadAndDisplayEvidences(skillId) {
    const evidenceTableContainer = document.getElementById('evidenceTableContainer');
    const evidenceTableBody = document.querySelector('#evidenceTable tbody');
    const currentUserRole = localStorage.getItem('currentUserRole');

    try {
        const response = await fetch(`/skills/electronics/getAllEvidences?skillId=${skillId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error fetching evidences');
        }

        const data = await response.json();
        const evidences = data.evidences;

        evidenceTableBody.innerHTML = ''; // Clear existing rows

        if (evidences.length > 0) {
            evidences.forEach((evidence, index) => {
                const row = document.createElement('tr');
                const approvalCount = evidence.approvals ? evidence.approvals.length : 0;

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
            evidenceTableContainer.style.display = 'none';
        }

        // Add event listeners to the buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApprove);
        });

        if (currentUserRole === 'admin') {
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', handleReject);
            });
        }
    } catch (error) {
        console.error('Error fetching evidences:', error);
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
    //loadUserTasks(skillId); la llamamos dentro de loadSkillInformation
    loadEvidence(skillId);
    handleEvidenceSubmission();
    handleBackButton();
    loadAndDisplayEvidences(skillId);
}

window.onload = () => {
    loadInformation();
};

