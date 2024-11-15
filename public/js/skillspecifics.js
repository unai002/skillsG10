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
    const skillId = localStorage.getItem('skillId'); // Define skillId here

    fetch('electronics/skills.json')
        .then(response => response.json())
        .then(skills => {
            const skillFind = skills.find(item => (item.id).toString() === skillId);

            if (skillFind) {
                let text = (skillFind.text).replace(/\n/g, " ");
                title.innerText = 'Skill: ' + text;
            } else {
                console.log("No se encontró el objeto con el ID especificado");
            }
        });

    const checkboxes = document.querySelectorAll('.checkbox');
    const textBoxTittle = document.getElementById('textBoxTitle');
    const textBox = document.getElementById('textBox');
    const buttonSubmit = document.getElementById('buttonSubmit');
    const backButton = document.getElementById('backButton');

    function checkBoxVerify() {
        const allCheck = Array.from(checkboxes).every(checkbox => checkbox.checked);

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

        // Save the state of checkboxes for the current user
        const taskStates = Array.from(checkboxes).map(checkbox => checkbox.checked);
        let localTasksCompleted = JSON.parse(localStorage.getItem('localTasksCompleted')) || {};
        const currentUser = localStorage.getItem('currentUser');

        if (!localTasksCompleted[skillId]) {
            localTasksCompleted[skillId] = {};
        }

        localTasksCompleted[skillId][currentUser] = taskStates;
        localStorage.setItem('localTasksCompleted', JSON.stringify(localTasksCompleted));
    }

    // Load the state of checkboxes for the current user
    function loadUserTasks() {
        const localTasksCompleted = JSON.parse(localStorage.getItem('localTasksCompleted')) || {};
        const currentUser = localStorage.getItem('currentUser');
        const savedTaskStates = localTasksCompleted[skillId] ? localTasksCompleted[skillId][currentUser] : null;

        if (savedTaskStates) {
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = savedTaskStates[index];
            });
            checkBoxVerify(); // Update the UI based on loaded state
        } else {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            checkBoxVerify(); // Update the UI based on default state
        }
    }

    loadUserTasks();

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkBoxVerify);
    });

    // Load the evidence into the input field
    let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    if (evidencias[skillId]) {
        const currentUser = localStorage.getItem('currentUser');
        const userEvidence = evidencias[skillId].find(evidence => evidence.username === currentUser);
        if (userEvidence) {
            textBox.value = userEvidence.evidence;
        }
    }

    buttonSubmit.addEventListener('click', (e) => {
        let evidenceText = document.getElementById('textBox').value.trim(); // Get the input text and trim whitespace
        if (evidenceText === '') {
            alert('Evidence text cannot be empty.');
            return; // Do not submit if the evidence text is empty
        }

        let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
        const skillId = localStorage.getItem('skillId');
        const currentUser = localStorage.getItem('currentUser');

        if (!evidencias[skillId]) {
            evidencias[skillId] = [];
        }

        // Check if the user has already submitted evidence
        const userEvidenceIndex = evidencias[skillId].findIndex(evidence => evidence.username === currentUser);

        if (userEvidenceIndex !== -1) {
            // Update the existing evidence and reset approval status
            evidencias[skillId][userEvidenceIndex].evidence = evidenceText;
            evidencias[skillId][userEvidenceIndex].approved = false;
            evidencias[skillId][userEvidenceIndex].approvals = [];
        } else {
            // Add new evidence
            evidencias[skillId].push({
                username: currentUser,
                evidence: evidenceText, // Save the actual input text
                approved: false,
                approvals: []
            });
        }

        localStorage.setItem('evidencias', JSON.stringify(evidencias));
    });

    backButton.addEventListener('click', () => {
        window.location.href = '/';
    });

    // Load and display evidences
    const evidenceTableContainer = document.getElementById('evidenceTableContainer');
    const evidenceTableBody = document.querySelector('#evidenceTable tbody');
    evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');

    if (evidencias[skillId] && evidencias[skillId].length > 0) {
        evidencias[skillId].forEach((evidence, index) => {
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
        evidenceTableContainer.style.display = 'block'; // Show the table if there are evidences
    } else {
        evidenceTableContainer.style.display = 'none'; // Hide the table if there are no evidences
    }

    function handleApprove(event) {
        const skillId = localStorage.getItem('skillId');
        let evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
        const currentUser = localStorage.getItem('currentUser');
        const currentUserRole = localStorage.getItem('currentUserRole');
        const index = event.target.getAttribute('data-index');

        // Prevent user from approving their own evidence
        if (evidencias[skillId][index].username === currentUser) {
            alert("You cannot approve your own evidence.");
            return;
        }

        if (currentUserRole === 'admin') {
            // Directly approve the evidence if the user is an admin
            evidencias[skillId][index].approved = true;
        } else {
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

    function handleReject(event) {
        const skillId = localStorage.getItem('skillId');
        evidencias = JSON.parse(localStorage.getItem('evidencias')) || {};
        const index = event.target.getAttribute('data-index');

        // Remove the evidence from the array
        evidencias[skillId].splice(index, 1);

        localStorage.setItem('evidencias', JSON.stringify(evidencias));
        location.reload();
    }

    // Add event listeners for approve and reject buttons
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', handleApprove);
    });

    if (currentUserRole === 'admin') {
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', handleReject);
        });
    }
}

window.onload = () => {
    loadInformation();
};

const applyUserButton = document.getElementById('applyUser');
if (applyUserButton) {
    applyUserButton.addEventListener('click', () => {
        const selectedUser = document.getElementById('userSelect').value;
        const userRole = document.getElementById('userSelect').selectedOptions[0].getAttribute('data-role');

        localStorage.setItem('currentUser', selectedUser);
        localStorage.setItem('currentUserRole', userRole);

        alert(`User changed to ${selectedUser} with role ${userRole}`);
        loadInformation(); // Reload information for the new user
    });
}