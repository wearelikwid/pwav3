document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadWorkouts(user.uid);
        } else {
            window.location.href = 'auth.html';
        }
    });
});

function loadWorkouts(userId) {
    // Reference to Firestore collection
    const workoutsRef = firebase.firestore().collection('workouts');
    
    // Query workouts for current user
    workoutsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            const workouts = [];
            querySnapshot.forEach((doc) => {
                workouts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayWorkouts(workouts);
        })
        .catch((error) => {
            console.error('Error loading workouts:', error);
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
    card.className = 'workout-card';

    // Add completed class if workout is completed
    if (workout.completed) {
        card.classList.add('completed');
    }

    // Use Firestore document ID as workout ID
    card.setAttribute('data-workout-id', workout.id);

    card.innerHTML = `
        <h3>${workout.name}</h3>
        <div class='workout-meta'>
            <span>${workout.type}</span>
        </div>
        <div class='workout-actions'>
            <button class='button primary' onclick='startWorkout("${workout.id}")'>
                ${workout.completed ? 'Repeat Workout' : 'Start Workout'}
            </button>
        </div>
    `;

    return card;
}

function startWorkout(workoutId) {
    // Get the workout from Firestore
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
                // Store current workout in localStorage for the workout session
                localStorage.setItem('currentWorkout', JSON.stringify(workout));
                window.location.href = 'start-workout.html';
            } else {
                console.error('Workout not found');
            }
        })
        .catch((error) => {
            console.error('Error starting workout:', error);
        });
}
