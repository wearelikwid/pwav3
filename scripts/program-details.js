document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        loadProgramDetails();
    });
});

async function loadProgramDetails() {
    // Get program ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('id');
    
    if (!programId) {
        window.location.href = 'program.html';
        return;
    }

    try {
        const doc = await firebase.firestore()
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

    for (let week = 1; week <= program.duration; week++) {
        const weekCard = createWeekCard(week, program.workouts);
        weeksContainer.appendChild(weekCard);
    }

    // Update start button based on program status
    const startButton = document.getElementById('start-program');
    if (program.status === 'active') {
        startButton.textContent = 'Program In Progress';
        startButton.disabled = true;
    } else if (program.status === 'completed') {
        startButton.textContent = 'Program Completed';
        startButton.disabled = true;
    }
}

function createWeekCard(weekNumber, workouts) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'week-card';

    weekDiv.innerHTML = `
        <h3 class="week-header">Week ${weekNumber}</h3>
        <div class="week-days">
            ${createDaysHTML(weekNumber, workouts)}
        </div>
    `;

    return weekDiv;
}

function createDaysHTML(weekNumber, workouts) {
    let daysHTML = '';
    for (let day = 1; day <= 7; day++) {
        const workout = workouts?.find(w => w.week === weekNumber && w.day === day);
        daysHTML += `
            <div class="day-item">
                <div class="day-info">
                    <span class="day-name">Day ${day}</span>
                    <span class="workout-name">${workout ? workout.name : 'Rest Day'}</span>
                </div>
            </div>
        `;
    }
    return daysHTML;
}
