document.addEventListener('DOMContentLoaded', function() {
    displayPrograms();
});

function displayPrograms() {
    const programsList = document.getElementById('programs-list');
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');

    if (programs.length === 0) {
        programsList.innerHTML = '<p class="no-programs">No programs created yet.</p>';
        return;
    }

    programsList.innerHTML = programs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(program => `
            <div class="program-card" data-program-id="${program.id}">
                <div class="program-info">
                    <h2>${program.name}</h2>
                    <p>${program.duration} weeks</p>
                </div>
                <div class="program-actions">
                    <button onclick="editProgram(${program.id})" class="button secondary">Edit</button>
                    <button onclick="deleteProgram(${program.id})" class="button secondary">Delete</button>
                </div>
            </div>
        `)
        .join('');
}

function deleteProgram(programId) {
    if (confirm('Are you sure you want to delete this program?')) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const updatedPrograms = programs.filter(program => program.id !== programId);
        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        displayPrograms();
    }
}

function editProgram(programId) {
    // Store the program ID to edit in localStorage
    localStorage.setItem('editProgramId', programId);
    // Redirect to the edit page
    window.location.href = 'edit-program.html';
}
