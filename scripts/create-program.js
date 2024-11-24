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

function createDayElement(weekNumber, dayNumber) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'program-day';
    dayDiv.innerHTML = `
        <div class='day-header'>
            <h3>Day ${dayNumber}</h3>
            <button type='button' class='button secondary remove-day' onclick='removeDay(this)'>×</button>
        </div>
        <div class='workout-form'>
            <div class='form-group'>
                <label>Workout Name</label>
                <input type='text' class='workout-name' placeholder='e.g., Upper Body Strength'>
            </div>
            <div class='form-group'>
                <label>Type</label>
                <select class='workout-type'>
                    <option value='strength'>Strength</option>
                    <option value='cardio'>Cardio</option>
                    <option value='hiit'>HIIT</option>
                    <option value='flexibility'>Flexibility</option>
                </select>
            </div>
            <div class='workout-sections' id='workout-sections-w${weekNumber}d${dayNumber}'></div>
            <button type='button' class='button secondary' onclick='addSection(${weekNumber}, ${dayNumber})'>
                Add Exercise Section
            </button>
        </div>
    `;
    return dayDiv;
}

function removeDay(button) {
    const dayElement = button.closest('.program-day');
    dayElement.remove();
}

function addSection(weekNumber, dayNumber) {
    const sectionsContainer = document.getElementById(`workout-sections-w${weekNumber}d${dayNumber}`);
    const sectionElement = createSectionElement();
    sectionsContainer.appendChild(sectionElement);
}

function createSectionElement() {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'workout-section';
    sectionDiv.innerHTML = `
        <div class='section-header'>
            <select class='section-type'>
                <option value='warmup'>Warm-up</option>
                <option value='main'>Main Workout</option>
                <option value='cooldown'>Cool-down</option>
            </select>
            <button type='button' class='button secondary remove-section' onclick='removeSection(this)'>×</button>
        </div>
        <div class='exercises'></div>
        <button type='button' class='button secondary' onclick='addExercise(this)'>
            Add Exercise
        </button>
    `;
    return sectionDiv;
}

function removeSection(button) {
    const sectionElement = button.closest('.workout-section');
    sectionElement.remove();
}

function addExercise(button) {
    const exercisesContainer = button.previousElementSibling;
    const exerciseElement = createExerciseElement();
    exercisesContainer.appendChild(exerciseElement);
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

function handleFormSubmit(event) {
    event.preventDefault();
    
    const programData = {
        id: Date.now(),
        name: document.getElementById('program-name').value,
        duration: parseInt(document.getElementById('program-duration').value),
        weeks: collectWeeksData(),
        createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    programs.push(programData);
    localStorage.setItem('programs', JSON.stringify(programs));

    // Redirect to programs list
    window.location.href = 'program.html';
}

function collectWeeksData() {
    const weeks = [];
    const weekElements = document.querySelectorAll('.program-week');
    
    weekElements.forEach((weekElement, weekIndex) => {
        const days = [];
        const dayElements = weekElement.querySelectorAll('.program-day');
        
        dayElements.forEach((dayElement, dayIndex) => {
            days.push({
                dayNumber: dayIndex + 1,
                workoutName: dayElement.querySelector('.workout-name').value,
                workoutType: dayElement.querySelector('.workout-type').value,
                sections: collectSectionsData(dayElement)
            });
        });

        weeks.push({
            weekNumber: weekIndex + 1,
            days: days
        });
    });

    return weeks;
}

function collectSectionsData(dayElement) {
    const sections = [];
    const sectionElements = dayElement.querySelectorAll('.workout-section');
    
    sectionElements.forEach(sectionElement => {
        sections.push({
            type: sectionElement.querySelector('.section-type').value,
            exercises: collectExercisesData(sectionElement)
        });
    });

    return sections;
}

function collectExercisesData(sectionElement) {
    const exercises = [];
    const exerciseElements = sectionElement.querySelectorAll('.exercise-item');
    
    exerciseElements.forEach(exerciseElement => {
        exercises.push({
            name: exerciseElement.querySelector('.exercise-name').value,
            sets: parseInt(exerciseElement.querySelector('.exercise-sets').value) || 0,
            reps: parseInt(exerciseElement.querySelector('.exercise-reps').value) || 0,
            notes: exerciseElement.querySelector('.exercise-notes').value
        });
    });

    return exercises;
}
