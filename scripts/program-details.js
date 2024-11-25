document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        loadProgramDetails(user.uid);
    });
});

async function loadProgramDetails(userId) {
    // Get program ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('id');

    if (!programId) {
        window.location.href = 'program.html';
        return;
    }

    try {
        const doc = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('programs')
            .doc(programId)
            .get();

        if (!doc.exists) {
            window.location.href = 'program.html';
            return;
        }

        const program = doc.data();
        displayProgramDetails(program);
    } catch (error) {
        console.error("Error loading program:", error);
    }
}

function displayProgramDetails(program) {
    // Update program name
    document.getElementById('program-name').textContent = program.name;

    // Update duration
    document.getElementById('program-duration').textContent = `${program.duration} weeks`;

    // Update status
    document.getElementById('program-status').textContent = program.status || 'Not Started';

    // Display weeks and workouts
    const weeksContainer = document.getElementById('program-weeks');
    weeksContainer.innerHTML = ''; // Clear existing content

    program.weeks.forEach((week, index) => {
        const weekCard = createWeekCard(index + 1, week);
        weeksContainer.appendChild(weekCard);
    });

    // Update start button based on program status
    updateStartButton(program.status);
}

function createWeekCard(weekNumber, week) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'week-card';

    weekDiv.innerHTML = `
        <h3 class="week-header">Week ${weekNumber}</h3>
        <div class="week-days">
            ${createDaysHTML(week.days)}
        </div>
    `;

    return weekDiv;
}

function createDaysHTML(days) {
    return days.map((day, index) => `
        <div class="day-item">
            <div class="day-info">
                <span class="day-name">Day ${index + 1}</span>
                <span class="workout-name">${day.workout ? day.workout.name : 'Rest Day'}</span>
            </div>
        </div>
    `).join('');
}

function updateStartButton(status) {
    const startButton = document.getElementById('start-program');
    if (status === 'In Progress') {
        startButton.textContent = 'Program In Progress';
        startButton.disabled = true;
    } else if (status === 'Completed') {
        startButton.textContent = 'Program Completed';
        startButton.disabled = true;
    } else {
        startButton.addEventListener('click', startProgram);
    }
}

async function startProgram() {
    const userId = firebase.auth().currentUser.uid;
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('id');

    try {
        await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('programs')
            .doc(programId)
            .update({
                status: 'In Progress',
                startDate: new Date()
            });

        // Update UI
        document.getElementById('program-status').textContent = 'In Progress';
        updateStartButton('In Progress');
    } catch (error) {
        console.error("Error starting program:", error);
        alert('Error starting program. Please try again.');
    }
}
