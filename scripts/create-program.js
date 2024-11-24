// First ensure Firebase is initialized when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase Auth listener
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'auth.html';
        }
    });

    // Add event listeners
    document.getElementById('program-duration').addEventListener('change', generateWeeks);
    document.getElementById('create-program-form').addEventListener('submit', handleFormSubmit);
});

function generateWeeks(event) {
    const duration = parseInt(event.target.value);
    const weeksContainer = document.getElementById('program-weeks');
    weeksContainer.innerHTML = ''; // Clear existing weeks

    for (let i = 1; i <= duration; i++) {
        const weekElement = createWeekElement(i);
        weeksContainer.appendChild(weekElement);
    }
}

function createWeekElement(weekNumber) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'program-week';
    weekDiv.innerHTML = `
        <div class='week-header'>
            <h2 class='week-title'>Week ${weekNumber}</h2>
            <button type='button' class='button secondary add-day-btn'>
                Add Day
            </button>
        </div>
        <div class='week-days' data-week="${weekNumber}"></div>
    `;
    
    // Add event listener to the Add Day button
    weekDiv.querySelector('.add-day-btn').addEventListener('click', function() {
        addDay(weekNumber);
    });
    
    return weekDiv;
}

function addDay(weekNumber) {
    const weekElement = document.querySelector(`.program-week:nth-child(${weekNumber})`);
    const daysContainer = weekElement.querySelector('.week-days');
    const dayNumber = daysContainer.children.length + 1;

    const dayElement = createDayElement(weekNumber, dayNumber);
    daysContainer.appendChild(dayElement);
}

function createDayElement(weekNumber, dayNumber) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'program-day';
    dayDiv.innerHTML = `
        <div class='day-header'>
            <h3>Day ${dayNumber}</h3>
            <input type='text' class='workout-name' placeholder='Workout Name' required>
            <button type='button' class='button remove-day'>×</button>
        </div>
        <div class='exercises-list'>
            <button type='button' class='button secondary add-exercise-btn'>
                Add Exercise
            </button>
        </div>
    `;

    // Add event listeners
    dayDiv.querySelector('.remove-day').addEventListener('click', function() {
        dayDiv.remove();
    });

    dayDiv.querySelector('.add-exercise-btn').addEventListener('click', function() {
        addExercise(this);
    });

    return dayDiv;
}

function createExerciseElement() {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.innerHTML = `
        <div class='exercise-inputs'>
            <input type='text' class='exercise-name' placeholder='Exercise name' required>
            <input type='number' class='exercise-sets' placeholder='Sets' min='1' required>
            <input type='number' class='exercise-reps' placeholder='Reps' min='1' required>
            <input type='text' class='exercise-notes' placeholder='Notes'>
            <button type='button' class='button remove-exercise'>×</button>
        </div>
    `;

    // Add event listener to remove button
    exerciseDiv.querySelector('.remove-exercise').addEventListener('click', function() {
        exerciseDiv.remove();
    });

    return exerciseDiv;
}

function addExercise(button) {
    const exercisesList = button.closest('.exercises-list');
    const exerciseElement = createExerciseElement();
    exercisesList.insertBefore(exerciseElement, button);
}

function collectWeeksData() {
    const weeks = [];
    const weekElements = document.querySelectorAll('.program-week');

    weekElements.forEach((weekElement, weekIndex) => {
        const days = [];
        const dayElements = weekElement.querySelectorAll('.program-day');

        dayElements.forEach((dayElement, dayIndex) => {
            const exercises = [];
            const exerciseElements = dayElement.querySelectorAll('.exercise-item');

            exerciseElements.forEach(exerciseElement => {
                exercises.push({
                    name: exerciseElement.querySelector('.exercise-name').value,
                    sets: parseInt(exerciseElement.querySelector('.exercise-sets').value) || 0,
                    reps: parseInt(exerciseElement.querySelector('.exercise-reps').value) || 0,
                    notes: exerciseElement.querySelector('.exercise-notes').value
                });
            });

            days.push({
                dayNumber: dayIndex + 1,
                workout: {
                    name: dayElement.querySelector('.workout-name').value
                },
                exercises: exercises
            });
        });

        weeks.push({
            weekNumber: weekIndex + 1,
            days: days
        });
    });

    return weeks;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please sign in to create a program');
            window.location.href = 'auth.html';
            return;
        }

        const programName = document.getElementById('program-name').value;
        const duration = parseInt(document.getElementById('program-duration').value);
        const weeks = collectWeeksData();

        if (!programName || !duration) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate that each week has at least one day
        if (weeks.some(week => week.days.length === 0)) {
            alert('Each week must have at least one day');
            return;
        }

        // Validate that each day has at least one exercise
        if (weeks.some(week => week.days.some(day => day.exercises.length === 0))) {
            alert('Each day must have at least one exercise');
            return;
        }

        const programData = {
            name: programName,
            duration: duration,
            weeks: weeks,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore
        await firebase.firestore()
            .collection('programs')
            .add(programData);

        alert('Program created successfully!');
        window.location.href = 'program.html';
    } catch (error) {
        console.error('Error creating program:', error);
        alert('Error creating program: ' + error.message);
    }
}
