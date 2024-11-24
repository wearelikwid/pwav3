document.addEventListener('DOMContentLoaded', function() {
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
            <button type='button' class='button secondary' onclick='addDay(${weekNumber})'>
                Add Day
            </button>
        </div>
        <div class='week-days'></div>
    `;
    return weekDiv;
}

function addDay(weekNumber) {
    const weekElement = document.querySelector(`.program-week:nth-child(${weekNumber})`);
    const daysContainer = weekElement.querySelector('.week-days');
    const dayNumber = daysContainer.children.length + 1;
    
    const dayElement = createDayElement(weekNumber, dayNumber);
    daysContainer.appendChild(dayElement);
}

function createExerciseElement() {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.innerHTML = `
        <div class='exercise-header'>
            <input type='text' class='exercise-name' placeholder='Exercise name'>
            <button type='button' class='button secondary remove-exercise' onclick='removeExercise(this)'>×</button>
        </div>
        <div class='exercise-details'>
            <input type='number' class='exercise-sets' placeholder='Sets' min='1'>
            <input type='number' class='exercise-reps' placeholder='Reps' min='1'>
            <input type='text' class='exercise-notes' placeholder='Notes'>
        </div>
    `;
    return exerciseDiv;
}

function removeExercise(button) {
    const exerciseElement = button.closest('.exercise-item');
    exerciseElement.remove();
}

function collectWeeksData() {
    const weeks = [];
    const weekElements = document.querySelectorAll('.program-week');

    weekElements.forEach((weekElement, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const dayElements = weekElement.querySelectorAll('.program-day');
        const days = [];

        dayElements.forEach((dayElement, dayIndex) => {
            const dayNumber = dayIndex + 1;
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
                dayNumber,
                exercises
            });
        });

        weeks.push({
            weekNumber,
            days
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

        if (!programName || !duration) {
            alert('Please fill in all required fields');
            return;
        }

        const programData = {
            name: programName,
            duration: duration,
            weeks: collectWeeksData(),
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save to Firestore
        await firebase.firestore()
            .collection('programs')
            .add(programData);

        alert('Program saved successfully!');
        window.location.href = 'program.html';
    } catch (error) {
        console.error('Error creating program:', error);
        alert('Error creating program: ' + error.message);
    }
}

function createDayElement(weekNumber, dayNumber) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'program-day';
    dayDiv.innerHTML = `
        <div class='day-header'>
            <h3>Day ${dayNumber}</h3>
            <div class='day-actions'>
                <button type='button' class='button secondary' onclick='addExercise(this)'>
                    Add Exercise
                </button>
            </div>
        </div>
        <div class='exercises-list'></div>
    `;
    return dayDiv;
}

function addExercise(button) {
    const dayElement = button.closest('.program-day');
    const exercisesList = dayElement.querySelector('.exercises-list');
    const exerciseElement = createExerciseElement();
    exercisesList.appendChild(exerciseElement);
}
