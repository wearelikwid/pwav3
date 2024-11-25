// Utility function for error handling
function showError(message) {
    console.error(message);
    alert(message);
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Check if we're in edit mode
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

function loadWorkoutForEdit(workoutId) {
    firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const workout = {
                    id: doc.id,
                    ...doc.data()
                };
                localStorage.setItem('editWorkout', JSON.stringify(workout));
            } else {
                showError('Workout not found');
                window.location.href = 'workouts.html';
            }
        })
        .catch((error) => {
            showError('Error loading workout data: ' + error.message);
            window.location.href = 'workouts.html';
        });
}

function loadWorkouts(userId) {
    const workoutsRef = firebase.firestore().collection('workouts');

    workoutsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot((querySnapshot) => {
            const workouts = [];
            querySnapshot.forEach((doc) => {
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

function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = `workout-card${workout.completed ? ' completed' : ''}`;

    const completionStatus = workout.completed ? 
        `<span class="completion-status">✓ Completed</span>` : '';

    card.innerHTML = `
        <h3>${workout.name}</h3>
        <div class="workout-meta">
            <span>${workout.type}</span>
            ${completionStatus}
        </div>
        <div class="workout-actions">
            ${!workout.completed ? 
                `<button onclick="startWorkout('${workout.id}')" class="button primary">Start Workout</button>` :
                `<button onclick="markWorkoutIncomplete('${workout.id}')" class="button secondary">Mark Incomplete</button>`
            }
            <button onclick="editWorkout('${workout.id}')" class="button secondary">Edit</button>
            <button onclick="deleteWorkout('${workout.id}')" class="button secondary">Delete</button>
        </div>
    `;

    return card;
}

function startWorkout(workoutId) {
    // Get the workout data from Firestore
    firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const workout = {
                    id: doc.id,
                    ...doc.data()
                };
                localStorage.setItem('currentWorkout', JSON.stringify(workout));
                window.location.href = 'start-workout.html';
            } else {
                showError('Workout not found');
            }
        })
        .catch((error) => {
            showError('Error starting workout: ' + error.message);
        });
}

function markWorkoutComplete(workoutId) {
    firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .update({
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch((error) => {
            showError('Error marking workout complete: ' + error.message);
        });
}

function markWorkoutIncomplete(workoutId) {
    firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .update({
            completed: false,
            completedAt: null
        })
        .catch((error) => {
            showError('Error marking workout incomplete: ' + error.message);
        });
}

function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .delete()
            .catch((error) => {
                showError('Error deleting workout: ' + error.message);
            });
    }
}

function editWorkout(workoutId) {
    window.location.href = `create-workout.html?edit=true&id=${workoutId}`;
}
