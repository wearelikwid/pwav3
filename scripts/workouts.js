// Utility function for error handling
function showError(message) {
    console.error(message);
    alert(message);
}

// Initialize Firebase listeners when document loads
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const editMode = urlParams.get('edit');
            const workoutId = urlParams.get('id');

            if (editMode && workoutId) {
                loadWorkoutForEdit(workoutId);
            } else {
                loadWorkouts(user.uid);
            }
        } else {
            window.location.href = 'auth.html';
        }
    });
});

// Load workout data for editing
function loadWorkoutForEdit(workoutId) {
    firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                window.location.href = `create-workout.html?id=${workoutId}`;
            } else {
                showError('Workout not found');
                window.location.href = 'workouts.html';
            }
        })
        .catch((error) => {
            showError('Error loading workout: ' + error.message);
            window.location.href = 'workouts.html';
        });
}

// Load all workouts for the user
function loadWorkouts(userId) {
    const workoutsRef = firebase.firestore().collection('workouts');

    workoutsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const workouts = [];
            snapshot.forEach((doc) => {
                workouts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayWorkouts(workouts);
        }, (error) => {
            showError('Error loading workouts: ' + error.message);
            displayWorkouts([]);
        });
}

// Display workouts in the UI
function displayWorkouts(workouts) {
    const workoutsList = document.getElementById('workouts-list');
    workoutsList.innerHTML = '';

    if (workouts.length === 0) {
        workoutsList.innerHTML = `
            <div class="empty-state">
                <p>No workouts created yet.</p>
                <a href="create-workout.html" class="button primary">Create Your First Workout</a>
            </div>
        `;
        return;
    }

    workouts.forEach(workout => {
        const workoutCard = createWorkoutCard(workout);
        workoutsList.appendChild(workoutCard);
    });
}

// Create a workout card element
function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = `workout-card${workout.completed ? ' completed' : ''}`;

    const completionStatus = workout.completed ? 
        `<span class="completion-status">✓ Completed</span>` : '';

    const lastUpdated = workout.updatedAt ? 
        new Date(workout.updatedAt.toDate()).toLocaleDateString() : 'Never';

    card.innerHTML = `
        <h3>${workout.name || 'Unnamed Workout'}</h3>
        <div class="workout-meta">
            <span>${workout.type || 'No Type'}</span>
            ${completionStatus}
            <span class="last-updated">Updated: ${lastUpdated}</span>
        </div>
        <div class="workout-actions">
            ${!workout.completed ? 
                `<button onclick="startWorkout('${workout.id}')" class="button primary">Start Workout</button>` :
                `<button onclick="markWorkoutIncomplete('${workout.id}')" class="button secondary">Mark Incomplete</button>`
            }
            <button onclick="editWorkout('${workout.id}')" class="button secondary">Edit</button>
            <button onclick="deleteWorkout('${workout.id}')" class="button delete-btn">Delete</button>
        </div>
    `;

    return card;
}

// Start a workout session
async function startWorkout(workoutId) {
    try {
        window.location.href = `start-workout.html?id=${workoutId}`;
    } catch (error) {
        showError('Error starting workout: ' + error.message);
    }
}

// Mark workout as complete
async function markWorkoutComplete(workoutId) {
    try {
        await firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .update({
                completed: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        showError('Error marking workout complete: ' + error.message);
    }
}

// Mark workout as incomplete
async function markWorkoutIncomplete(workoutId) {
    try {
        await firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .update({
                completed: false,
                completedAt: null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        showError('Error marking workout incomplete: ' + error.message);
    }
}

// Delete a workout
async function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
        try {
            await firebase.firestore()
                .collection('workouts')
                .doc(workoutId)
                .delete();
        } catch (error) {
            showError('Error deleting workout: ' + error.message);
        }
    }
}

// Navigate to edit workout page
function editWorkout(workoutId) {
    window.location.href = `create-workout.html?edit=true&id=${workoutId}`;
}
