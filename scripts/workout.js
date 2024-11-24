document.addEventListener('DOMContentLoaded', function() {
    // Add back button functionality
    document.querySelector('.back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    const urlParams = new URLSearchParams(window.location.search);
    const week = urlParams.get('week');
    const type = urlParams.get('type');

    document.getElementById('workout-title').textContent = `Week ${week} - ${formatWorkoutType(type)}`;

    const completeButton = document.getElementById('complete-workout-button');

    // Check if workout is already completed
    const savedProgress = localStorage.getItem('workoutProgress');
    if (savedProgress) {
        const completedWorkouts = JSON.parse(savedProgress);
        const isCompleted = completedWorkouts.some(workout => 
            workout.week === week && workout.type === type);
        if (isCompleted) {
            completeButton.classList.add('active');
            completeButton.innerHTML = 'Completed';
        }
    }

    completeButton.addEventListener('click', function() {
        toggleWorkoutCompletion(week, type, this);
    });

    // Load workout data
    fetch(`workouts/week${week}.json`)
        .then(response => response.json())
        .then(data => {
            const workoutData = data[type];
            if (workoutData) {
                displayWorkout(workoutData);
            } else {
                displayError(`No ${formatWorkoutType(type)} workout found for Week ${week}`);
            }
        })
        .catch(error => {
            console.error('Error loading workout:', error);
            displayError(`Error loading workout for Week ${week}`);
        });
});

function formatWorkoutType(type) {
    const words = type.split(/(?=[A-Z])/);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function displayWorkout(workout) {
    const workoutContainer = document.getElementById('workout-container');
    let html = '';

    // Display warmup if it exists
    if (workout.warmup && workout.warmup.exercises) {
        html += '<div class="section">';
        html += '<h2>Warm-up</h2>';
        html += '<ul class="exercise-list">';
        workout.warmup.exercises.forEach(exercise => {
            html += createExerciseListItem(exercise);
        });
        html += '</ul></div>';
    }

    // Display multiple circuits if they exist
    if (workout.circuits && Array.isArray(workout.circuits)) {
        workout.circuits.forEach((circuit, index) => {
            html += `<div class="section">`;
            html += `<h2>${circuit.name || `Circuit ${index + 1}`}</h2>`;
            html += '<ul class="exercise-list">';
            circuit.exercises.forEach(exercise => {
                html += createExerciseListItem(exercise);
            });
            html += '</ul></div>';
        });
    }
    
    // Display single circuit if it exists
    if (workout.circuit && workout.circuit.exercises) {
        html += '<div class="section">';
        html += `<h2>Circuit</h2>`;
        html += '<ul class="exercise-list">';
        workout.circuit.exercises.forEach(exercise => {
            html += createExerciseListItem(exercise);
        });
        html += '</ul></div>';
    }

    workoutContainer.innerHTML = html;
}

function createExerciseListItem(exercise) {
    // Format reps/duration text
    let repsText = '';
    if (exercise.reps) {
        // Check if it contains time-related words
        if (exercise.reps.toLowerCase().includes('sec') || 
            exercise.reps.toLowerCase().includes('min') ||
            exercise.reps.toLowerCase().includes('minute')) {
            repsText = exercise.reps;
        } else {
            // Add 'reps' only for numerical values
            repsText = isNaN(exercise.reps) ? exercise.reps : `${exercise.reps} reps`;
        }
    }

    return `
        <li class="exercise-item">
            <div class="exercise-name">
                ${exercise.exercise}
                ${exercise.notes ? `<div class="exercise-notes">${exercise.notes}</div>` : ''}
            </div>
            <div class="exercise-details">
                <div class="reps-duration">${repsText}</div>
                ${exercise.weight ? `<div class="weight">${exercise.weight}</div>` : ''}
                ${exercise.rounds ? `<div class="rounds">${exercise.rounds} rounds</div>` : ''}
            </div>
        </li>
    `;
}

function displayError(message) {
    const workoutContainer = document.getElementById('workout-container');
    workoutContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

function toggleWorkoutCompletion(week, type, button) {
    let completedWorkouts = [];
    const savedProgress = localStorage.getItem('workoutProgress');

    if (savedProgress) {
        completedWorkouts = JSON.parse(savedProgress);
    }

    const workoutIndex = completedWorkouts.findIndex(workout => 
        workout.week === week && workout.type === type);

    if (workoutIndex === -1) {
        // Add to completed workouts
        completedWorkouts.push({ week, type });
        button.classList.add('active');
        button.innerHTML = 'Completed';
    } else {
        // Remove from completed workouts
        completedWorkouts.splice(workoutIndex, 1);
        button.classList.remove('active');
        button.innerHTML = 'Mark as Complete';
    }

    localStorage.setItem('workoutProgress', JSON.stringify(completedWorkouts));
}
