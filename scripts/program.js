document.addEventListener('DOMContentLoaded', function() {
    displayPrograms();
});

function displayPrograms() {
    // Get the current user
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadUserPrograms(user.uid);
        } else {
            window.location.href = 'auth.html';
        }
    });
}

async function loadUserPrograms(userId) {
    const programsList = document.getElementById('programs-list');
    
    try {
        const snapshot = await firebase.firestore()
            .collection('programs')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            programsList.innerHTML = '<p class="no-programs">No programs created yet.</p>';
            return;
        }

        programsList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const program = doc.data();
            const programCard = `
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
            programsList.innerHTML += programCard;
        });
    } catch (error) {
        console.error("Error loading programs:", error);
        programsList.innerHTML = '<p class="no-programs">Error loading programs. Please try again.</p>';
    }
}

function editProgram(programId) {
    // Store the program ID for editing
    localStorage.setItem('editProgramId', programId);
    window.location.href = 'edit-program.html';
}

async function deleteProgram(programId) {
    if (confirm('Are you sure you want to delete this program?')) {
        try {
            await firebase.firestore()
                .collection('programs')
                .doc(programId)
                .delete();
            
            // Refresh the programs list
            const user = firebase.auth().currentUser;
            if (user) {
                loadUserPrograms(user.uid);
            }
        } catch (error) {
            console.error("Error deleting program:", error);
            alert('Error deleting program. Please try again.');
        }
    }
}
