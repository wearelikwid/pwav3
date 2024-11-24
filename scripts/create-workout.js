document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    addSection(); // Add initial section
});

function initializeForm() {
    const form = document.getElementById('create-workout-form');
    form.addEventListener('submit', handleFormSubmit);
}

function addSection() {
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

    sectionsContainer.appendChild(sectionElement);
}

function addExerciseToSection(exercisesList) {
    const exerciseTemplate = document.getElementById('exercise-template');
    const exerciseElement = document.importNode(exerciseTemplate.content, true);
    
    const removeButton = exerciseElement.querySelector('.remove-exercise');
    removeButton.addEventListener('click', function(e) {
        e.target.closest('.exercise-item').remove();
    });

    exercisesList.appendChild(exerciseElement);
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const workoutData = {
            name: document.getElementById('workout-name').value,
            type: document.getElementById('workout-type').value,
            sections: getSectionsData(),
            createdAt: new Date().toISOString()
        };

        if (!workoutData.name || !workoutData.type) {
            alert('Please fill in workout name and type');
            return;
        }

        saveWorkout(workoutData);
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
        const exercises = getExercisesDataForSection(sectionElement);
        if (exercises.length > 0) { // Only add sections with exercises
            sections.push({
                type: sectionElement.querySelector('.section-type').value,
                exercises: exercises
            });
        }
    });

    return sections;
}

function getExercisesDataForSection(sectionElement) {
    const exercises = [];
    const exerciseItems = sectionElement.querySelectorAll('.exercise-item');

    exerciseItems.forEach(item => {
        const exerciseData = {
            name: item.querySelector('.exercise-name').value,
            rounds: item.querySelector('.exercise-rounds').value,
            reps: item.querySelector('.exercise-reps').value,
            notes: item.querySelector('.exercise-notes').value
        };

        // Only add exercises that have at least a name
        if (exerciseData.name) {
            if (exerciseData.rounds) exerciseData.rounds = parseInt(exerciseData.rounds);
            if (exerciseData.reps) exerciseData.reps = parseInt(exerciseData.reps);
            exercises.push(exerciseData);
        }
    });

    return exercises;
}

function saveWorkout(workoutData) {
    try {
        let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        workouts.push(workoutData);
        localStorage.setItem('workouts', JSON.stringify(workouts));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw new Error('Failed to save workout');
    }
}
