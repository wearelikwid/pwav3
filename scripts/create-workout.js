// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        
        // Check if we're editing an existing workout
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');
        if (workoutId) {
            loadWorkoutForEditing(workoutId);
        }
    });

    // Set up form submission handler
    const form = document.getElementById('create-workout-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        // Get basic workout data
        const workoutData = {
            name: document.getElementById('workout-name').value.trim(),
            type: document.getElementById('workout-type').value.trim(),
            userId: user.uid,
            completed: false
        };

        // Validate required fields
        if (!workoutData.name || !workoutData.type) {
            alert('Please fill in workout name and type');
            return;
        }

        const form = event.target;
        const workoutId = form.getAttribute('data-workout-id');

        if (workoutId) {
            await updateWorkout(workoutId, workoutData);
        } else {
            await saveWorkout(workoutData);
        }

        // Redirect back to workouts page
        window.location.href = 'workouts.html';
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout. Please try again.');
    }
}

// Save new workout
async function saveWorkout(workoutData) {
    return firebase.firestore()
        .collection('workouts')
        .add({
            ...workoutData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
}

// Update existing workout
async function updateWorkout(workoutId, workoutData) {
    return firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .update({
            ...workoutData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
}

// Load workout data for editing
async function loadWorkoutForEditing(workoutId) {
    try {
        const doc = await firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .get();

        if (doc.exists) {
            const workout = doc.data();
            
            // Fill form with workout data
            document.getElementById('workout-name').value = workout.name || '';
            document.getElementById('workout-type').value = workout.type || '';
            
            // Update form for edit mode
            const form = document.getElementById('create-workout-form');
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Update Workout';
            }
            form.setAttribute('data-workout-id', workoutId);
        } else {
            throw new Error('Workout not found');
        }
    } catch (error) {
        console.error('Error loading workout:', error);
        alert('Error loading workout data. Please try again.');
    }
}
