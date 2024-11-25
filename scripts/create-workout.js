document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        initializeForm();

        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('id');

        if (workoutId) {
            loadWorkoutData(workoutId);
        } else {
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
            const form = document.getElementById('create-workout-form');

            // Set basic fields
            document.getElementById('workout-name').value = workout.name || '';
            document.getElementById('workout-type').value = workout.type || '';

            // Clear existing sections
            const sectionsContainer = document.getElementById('workout-sections');
            sectionsContainer.innerHTML = '';

            // Add sections with exercises
            if (workout.sections && workout.sections.length > 0) {
                workout.sections.forEach(section => {
                    addSection(section);
                });
            } else {
                addSection(); // Add at least one empty section
            }

            // Update form for edit mode
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

function addSection(sectionData = null) {
    const template = document.getElementById('section-template');
    const section = document.importNode(template.content, true);
    
    if (sectionData) {
        section.querySelector('.section-type').value = sectionData.type || 'circuit';
        if (sectionData.exercises) {
            const exercisesList = section.querySelector('.exercises-list');
            sectionData.exercises.forEach(exercise => {
                addExerciseToSection(exercisesList, exercise);
            });
        }
    }

    const removeButton = section.querySelector('.remove-section');
    removeButton.addEventListener('click', function(e) {
        e.target.closest('.workout-section').remove();
    });

    const addExerciseButton = section.querySelector('.add-exercise');
    addExerciseButton.addEventListener('click', function(e) {
        const exercisesList = e.target.previousElementSibling;
        addExerciseToSection(exercisesList);
    });

    document.getElementById('workout-sections').appendChild(section);
}

function addExerciseToSection(exercisesList, exerciseData = null) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);

    if (exerciseData) {
        const nameInput = exerciseElement.querySelector('.exercise-name');
        const notesInput = exerciseElement.querySelector('.exercise-notes');
        const setsInput = exerciseElement.querySelector('.exercise-sets');
        const repsInput = exerciseElement.querySelector('.exercise-reps');

        if (nameInput) nameInput.value = exerciseData.name || '';
        if (notesInput) notesInput.value = exerciseData.notes || '';
        if (setsInput) setsInput.value = exerciseData.sets || '';
        if (repsInput) repsInput.value = exerciseData.reps || '';
    }

    const removeButton = exerciseElement.querySelector('.remove-exercise');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            e.target.closest('.exercise-item').remove();
        });
    }

    exercisesList.appendChild(exerciseElement);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please sign in to save the workout');
            return;
        }

        const workoutData = {
            name: document.getElementById('workout-name').value.trim(),
            type: document.getElementById('workout-type').value.trim(),
            sections: getSectionsData(),
            userId: user.uid,
            completed: false
        };

        if (!workoutData.name || !workoutData.type) {
            alert('Please fill in workout name and type');
            return;
        }

        const workoutId = event.target.getAttribute('data-workout-id');
        
        if (workoutId) {
            await updateWorkout(workoutId, workoutData);
        } else {
            await saveWorkout(workoutData);
        }

        window.location.href = 'workouts.html';
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Error saving workout. Please try again.');
    }
}

function getSectionsData() {
    const sections = [];
    const sectionElements = document.querySelectorAll('.workout-section');

    sectionElements.forEach(sectionElement => {
        const exercises = [];
        const exerciseItems = sectionElement.querySelectorAll('.exercise-item');

        exerciseItems.forEach(exerciseItem => {
            exercises.push({
                name: exerciseItem.querySelector('.exercise-name')?.value || '',
                notes: exerciseItem.querySelector('.exercise-notes')?.value || '',
                sets: exerciseItem.querySelector('.exercise-sets')?.value || '',
                reps: exerciseItem.querySelector('.exercise-reps')?.value || ''
            });
        });

        sections.push({
            type: sectionElement.querySelector('.section-type')?.value || '',
            exercises: exercises.filter(e => e.name || e.notes || e.sets || e.reps)
        });
    });

    return sections;
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
        .add({
            ...workoutData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
}
