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

function createDayElement(weekNumber, dayNumber) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-container';
    dayDiv.innerHTML = `
        <div class='day-header'>
            <h3>Day ${dayNumber}</h3>
            <button type='button' class='button secondary' onclick='addExercise(this)'>
                Add Exercise
            </button>
        </div>
        <div class='exercises-list'></div>
    `;
    return dayDiv;
}

function addExercise(button) {
    const dayContainer = button.closest('.day-container');
    const exercisesList = dayContainer.querySelector('.exercises-list');
    const exerciseElement = createExerciseElement();
    exercisesList.appendChild(exerciseElement);
}

function collectWeeksData() {
    const weeks = [];
    const weekElements = document.querySelectorAll('.program-week');
    
    weekElements.forEach((weekElement, weekIndex) => {
        const days = [];
        const dayElements = weekElement.querySelectorAll('.day-container');
        
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
    
    // Check if user is logged in
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please sign in to create a program');
        window.location.href = 'auth.html';
        return;
    }

    const programData = {
        name: document.getElementById('program-name').value,
        duration: parseInt(document.getElementById('program-duration').value),
        weeks: collectWeeksData(),
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Save to Firestore
        await firebase.firestore()
            .collection('programs')
            .add(programData);

        // Redirect to programs list
        window.location.href = 'program.html';
    } catch (error) {
        alert('Error creating program: ' + error.message);
    }
}
