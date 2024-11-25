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
    const sectionsContainer = document.getElementById('workout-sections');
    const sectionTemplate = document.getElementById('section-template');
    const sectionElement = document.importNode(sectionTemplate.content, true);

    // Add event listeners
    const removeButton = sectionElement.querySelector('.remove-section');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            const section = e.target.closest('.workout-section');
            if (sectionsContainer.children.length > 1) {
                section.remove();
            } else {
                alert('You must have at least one section');
            }
        });
    }

    const addExerciseButton = sectionElement.querySelector('.add-exercise');
    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', function(e) {
            const exercisesList = e.target.previousElementSibling;
            addExerciseToSection(exercisesList);
        });
    }

    // Populate section data if editing
    if (sectionData) {
        const sectionType = sectionElement.querySelector('.section-type');
        if (sectionType && sectionData.type) {
            sectionType.value = sectionData.type;
        }

        const exercisesList = sectionElement.querySelector('.exercises-list');
        if (exercisesList && sectionData.exercises) {
            sectionData.exercises.forEach(exercise => {
                addExerciseToSection(exercisesList, exercise);
            });
        }
    }

    sectionsContainer.appendChild(sectionElement);
}

function addExerciseToSection(exercisesList, exerciseData = null) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);

    const removeButton = exerciseElement.querySelector('.remove-exercise');
    if (removeButton) {
        removeButton.addEventListener('click', function(e) {
            e.target.closest('.exercise-item').remove();
        });
    }

    // Populate exercise data if editing
    if (exerciseData) {
        const fields = {
            'exercise-name': exerciseData.name,
            'exercise-notes': exerciseData.notes,
            'exercise-reps': exerciseData.reps,
            'exercise-rounds': exerciseData.rounds
        };

        Object.entries(fields).forEach(([className, value]) => {
            const element = exerciseElement.querySelector(`.${className}`);
            if (element && value) {
                element.value = value;
            }
        });
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

        const workoutId = event.target.getAttribute('data-workout-id');

        if (workoutId) {
            await updateWorkout(workoutId, workoutData);
        } else {
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
                name: exerciseItem.querySelector('.exercise-name')?.value || '',
                notes: exerciseItem.querySelector('.exercise-notes')?.value || '',
                reps: exerciseItem.querySelector('.exercise-reps')?.value || '',
                rounds: exerciseItem.querySelector('.exercise-rounds')?.value || ''
            });
        });

        sections.push({
            type: sectionElement.querySelector('.section-type')?.value || '',
            exercises: exercises.filter(e => e.name || e.notes || e.reps || e.rounds)
        });
    });

    return sections;
}
