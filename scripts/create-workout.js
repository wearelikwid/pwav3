document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        initializeForm();
        
        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');
        
        if (workoutId) {
            // Load workout data for editing
            loadWorkoutData(workoutId);
        } else {
            // Add initial section for new workout
            addSection();
        }
    });
});

function initializeForm() {
    const form = document.getElementById('create-workout-form');
    form.addEventListener('submit', handleFormSubmit);
}

async function loadWorkoutData(workoutId) {
    try {
        const doc = await firebase.firestore()
            .collection('workouts')
            .doc(workoutId)
            .get();

        if (doc.exists) {
            const workout = doc.data();
            
            // Set form fields
            document.getElementById('workout-name').value = workout.name;
            document.getElementById('workout-type').value = workout.type;
            
            // Clear existing sections
            const sectionsContainer = document.getElementById('workout-sections');
            sectionsContainer.innerHTML = '';
            
            // Add sections with exercises
            workout.sections.forEach(section => {
                addSection(section);
            });
            
            // Update form submit button text
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Update Workout';
            
            // Store workout ID for update
            form.setAttribute('data-workout-id', workoutId);
        }
    } catch (error) {
        console.error('Error loading workout:', error);
        alert('Error loading workout data. Please try again.');
    }
}

function addSection(sectionData = null) {
    const sectionsContainer = document.getElementById('workout-sections');
    const sectionTemplate = document.getElementById('section-template');
    const sectionElement = document.importNode(sectionTemplate.content, true);

    // Add event listeners
    const removeButton = sectionElement.querySelector('.remove-section');
    removeButton.addEventListener('click', function(e) {
        const section = e.target.closest('.workout-section');
        if (sectionsContainer.children.length > 1) {
            section.remove();
        } else {
            alert('You must have at least one section');
        }
    });

    const addExerciseButton = sectionElement.querySelector('.add-exercise');
    addExerciseButton.addEventListener('click', function(e) {
        const exercisesList = e.target.previousElementSibling;
        addExerciseToSection(exercisesList);
    });

    // If editing, populate section data
    if (sectionData) {
        const sectionType = sectionElement.querySelector('.section-type');
        sectionType.value = sectionData.type;

        const exercisesList = sectionElement.querySelector('.exercises-list');
        sectionData.exercises.forEach(exercise => {
            addExerciseToSection(exercisesList, exercise);
        });
    }

    sectionsContainer.appendChild(sectionElement);
}

function addExerciseToSection(exercisesList, exerciseData = null) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);

    const removeButton = exerciseElement.querySelector('.remove-exercise');
    removeButton.addEventListener('click', function(e) {
        e.target.closest('.exercise-item').remove();
    });

    // If editing, populate exercise data
    if (exerciseData) {
        exerciseElement.querySelector('.exercise-name').value = exerciseData.name;
        exerciseElement.querySelector('.exercise-notes').value = exerciseData.notes;
        exerciseElement.querySelector('.exercise-reps').value = exerciseData.reps;
        exerciseElement.querySelector('.exercise-rounds').value = exerciseData.rounds;
    }

    exercisesList.appendChild(exerciseElement);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    try {
        const workoutData = {
            name: document.getElementById('workout-name').value,
            type: document.getElementById('workout-type').value,
            sections: getSectionsData(),
            userId: firebase.auth().currentUser.uid,
            completed: false
        };

        if (!workoutData.name || !workoutData.type) {
            alert('Please fill in workout name and type');
            return;
        }

        const workoutId = this.getAttribute('data-workout-id');
        
        if (workoutId) {
            // Update existing workout
            await updateWorkout(workoutId, workoutData);
        } else {
            // Create new workout
            workoutData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await saveWorkout(workoutData);
        }

        window.location.href = 'workouts.html';
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout. Please try again.');
    }
}

async function updateWorkout(workoutId, workoutData) {
    return firebase.firestore()
        .collection('workouts')
        .doc(workoutId)
        .update({
            ...workoutData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
}

async function saveWorkout(workoutData) {
    return firebase.firestore()
        .collection('workouts')
        .add(workoutData);
}

function getSectionsData() {
    const sections = [];
    const sectionElements = document.querySelectorAll('.workout-section');

    sectionElements.forEach(sectionElement => {
        const exercises = [];
        const exerciseItems = sectionElement.querySelectorAll('.exercise-item');

        exerciseItems.forEach(exerciseItem => {
            exercises.push({
                name: exerciseItem.querySelector('.exercise-name').value,
                notes: exerciseItem.querySelector('.exercise-notes').value,
                reps: exerciseItem.querySelector('.exercise-reps').value,
                rounds: exerciseItem.querySelector('.exercise-rounds').value
            });
        });

        sections.push({
            type: sectionElement.querySelector('.section-type').value,
            exercises: exercises
        });
    });

    return sections;
}
