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
    const evidenceTable = document.getElementById('evidenceTable');
    const evidenceTableBody = document.querySelector('#evidenceTable tbody');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;
    const admin = userInfo ? userInfo.admin : null;

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
        const userskills = data.evidences;

        evidenceTableBody.innerHTML = '';

        // Check if there is any evidence text in the userskill objects
        const hasEvidenceText = userskills.some(userskill => userskill.evidence && userskill.evidence.trim() !== "");

        if (hasEvidenceText) {
            userskills.forEach((userskill, index) => {
                if (userskill.evidence && userskill.evidence.trim() !== "") {
                    const row = document.createElement('tr');
                    const approvalCount = userskill.approvals;
                    const userHasApproved = Array.isArray(userskill.verifications) && userskill.verifications.some(verification => {
                        return verification.username === currentUser;
                    });
                    row.innerHTML = `
                    <td>${userskill.username}</td>
                    <td>${userskill.evidence}</td>
                    <td>
                        ${userskill.approved ? `
                            <span class="approved-label">Approved</span>
                        ` : `
                            ${admin ? `
                                <button class="approve-btn" data-index="${index}" ${userHasApproved ? 'disabled' : ''}>Approve</button>
                                <button class="reject-btn" data-index="${index}">Reject</button>
                            ` : `
                                <button class="approve-btn" data-index="${index}" ${userHasApproved ? 'disabled' : ''}>Approve</button>
                            `}
                            <span class="approval-count">(${approvalCount} approvals)</span>
                        `}
                    </td>
                `;
                    evidenceTableBody.appendChild(row);
                }
            });
            evidenceTableContainer.style.display = 'block';
            evidenceTable.style.display = 'table';
        } else {
            evidenceTableContainer.style.display = 'none';
            evidenceTable.style.display = 'none';
        }

        // Add event listeners to the buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApprove);
        });

        if (admin) {
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', handleReject);
            });
        }
    } catch (error) {
        console.error('Error fetching evidences:', error);
    }
}

// Para manejar cuando una evidencia es aprobada
async function handleApprove(event) {
    const skillTreeName = 'electronics'; // Replace with the actual skill tree name if different
    const skillID = localStorage.getItem('skillId');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;
    const isAdmin = userInfo ? userInfo.admin : null;
    const approved = true // estamos aprobando la evidencia con este método
    const evidenceUser = event.target.parentElement.parentElement.children[0].innerText;

    if (!currentUser) {
        console.error('User info is missing or invalid');
        return;
    }

    if (currentUser === evidenceUser) {
        alert("No puedes aprobar tu propia evidencia.")
        return;
    }

    try {
        const response = await fetch(`/skills/${skillTreeName}/${skillID}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser,
                evidenceUsername: evidenceUser,
                approved: approved,
                isAdmin: isAdmin
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error approving evidence');
        }
        console.log('Evidence approved successfully:', data);

        location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message)
    }
}

// Para controlar cuando una evidencia es rechazada
async function handleReject(event) {
    const skillTreeName = 'electronics'; // Replace with the actual skill tree name if different
    const skillID = localStorage.getItem('skillId');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const currentUser = userInfo ? userInfo.username : null;
    const isAdmin = userInfo ? userInfo.admin : null;
    const approved = false // estamos rechazando la evidencia con este método
    const evidenceUser = event.target.parentElement.parentElement.children[0].innerText;

    if (!currentUser) {
        console.error('User info is missing or invalid');
        return;
    }

    try {
        const response = await fetch(`/skills/${skillTreeName}/${skillID}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser,
                evidenceUsername: evidenceUser,
                approved: approved,
                isAdmin: isAdmin
            })
        });

        if (!response.ok) {
            throw new Error('Error approving evidence');
        }

        const data = await response.json();
        console.log('Evidence rejected successfully:', data);

        location.reload();
    } catch (error) {
        console.error('Error:', error);
    }
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

