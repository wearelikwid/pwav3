document.addEventListener('DOMContentLoaded', function() {
    displayPrograms();
});

async function displayPrograms() {
    const programsList = document.getElementById('programs-list');
    const user = firebase.auth().currentUser;

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    try {
        // Get programs from Firestore
        const snapshot = await firebase.firestore()
            .collection('programs')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            programsList.innerHTML = '<p class="no-programs">No programs created yet.</p>';
            return;
        }

        programsList.innerHTML = snapshot.docs.map(doc => {
            const program = doc.data();
            return `
                <div class="program-card" data-program-id="${doc.id}">
                    <div class="program-info">
                        <h2>${program.name}</h2>
                        <p>${program.duration} weeks</p>
                    </div>
                    <div class="program-actions">
                        <button onclick="editProgram('${doc.id}')" class="button secondary">Edit</button>
                        <button onclick="deleteProgram('${doc.id}')" class="button secondary">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching programs:', error);
        programsList.innerHTML = '<p class="error">Error loading programs</p>';
    }
}

async function deleteProgram(programId) {
    if (confirm('Are you sure you want to delete this program?')) {
        try {
            await firebase.firestore()
                .collection('programs')
                .doc(programId)
                .delete();
            
            displayPrograms(); // Refresh the display
        } catch (error) {
            alert('Error deleting program: ' + error.message);
        }
    }
}

function editProgram(programId) {
    localStorage.setItem('editProgramId', programId);
    window.location.href = 'edit-program.html';
}
