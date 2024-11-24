document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        displayPrograms();
    });
});

async function displayPrograms() {
    const programsList = document.getElementById('programs-list');
    const user = firebase.auth().currentUser;

    try {
        const snapshot = await firebase.firestore()
            .collection('programs')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            programsList.innerHTML = '<p class="no-programs">No programs created yet.</p>';
            return;
        }

        programsList.innerHTML = '';
        snapshot.forEach(doc => {
            const program = doc.data();
            const programCard = document.createElement('div');
            programCard.className = 'program-card';
            programCard.innerHTML = `
                <div class="program-info">
                    <h2>${program.name}</h2>
                    <p>${program.duration} weeks</p>
                </div>
                <div class="program-actions">
                    <button onclick="viewProgram('${doc.id}')" class="button secondary">View</button>
                    <button onclick="editProgram('${doc.id}')" class="button secondary">Edit</button>
                    <button onclick="deleteProgram('${doc.id}')" class="button secondary">Delete</button>
                </div>
            `;
            programsList.appendChild(programCard);
        });
    } catch (error) {
        console.error("Error getting programs: ", error);
        programsList.innerHTML = '<p class="error">Error loading programs. Please try again.</p>';
    }
}

function viewProgram(programId) {
    // Store the program ID to view in localStorage
    localStorage.setItem('viewProgramId', programId);
    // Redirect to the view page
    window.location.href = 'view-program.html';
}

function editProgram(programId) {
    // Store the program ID to edit in localStorage
    localStorage.setItem('editProgramId', programId);
    // Redirect to the edit page
    window.location.href = 'edit-program.html';
}

async function deleteProgram(programId) {
    if (confirm('Are you sure you want to delete this program?')) {
        try {
            await firebase.firestore()
                .collection('programs')
                .doc(programId)
                .delete();
            
            alert('Program deleted successfully');
            displayPrograms(); // Refresh the display
        } catch (error) {
            console.error("Error deleting program: ", error);
            alert('Error deleting program. Please try again.');
        }
    }
}
