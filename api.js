let characters = [
  { name: 'Pititpeluche', realm: 'Ysondre' },
  { name: 'Staxlock', realm: 'Ysondre' },
  { name: 'Dàmshunt', realm: 'Ysondre' },
  { name: 'Sizko', realm: 'Ysondre' },
  { name: 'Shikoroh', realm: 'Ysondre' },
  { name: 'Dustylish', realm: 'Ysondre' },
  { name: 'Misakura', realm: 'Ysondre' },
  { name: 'Endormir', realm: 'Ysondre' },
  { name: 'Billiejean', realm: 'Ysondre' },
  { name: 'Arkydragon', realm: 'Ysondre' },
  { name: 'Åurore', realm: 'Ysondre' },
  { name: 'Naäy', realm: 'Ysondre' },
  { name: 'Eryavole', realm: 'Ysondre' },
  { name: 'Arkanael', realm: 'Archimonde' },
  { name: 'Velawar', realm: 'Ysondre' },
  { name: 'Fulldruide', realm: 'Hyjal' },
  { name: 'Fullevok', realm: 'Ysondre' },
  { name: 'Ysabrew', realm: 'Ysondre' },
  { name: 'Maesdk', realm: 'Ysondre' },
  { name: 'Vizmyar', realm: 'Dalaran' },
  { name: 'Pampløø', realm: 'Ysondre' },
  { name: 'Daarkhër', realm: 'Ysondre' },
  { name: 'Crakuus', realm: 'Ysondre' },
  { name: 'Nonosouspeed', realm: 'Ysondre' },
  { name: 'Dkrix', realm: 'Ysondre' },
  { name: 'Batsidormu', realm: 'Ysondre' },
  { name: 'Subk', realm: 'Ysondre' }
];

let altCharacters = [
  { name: 'Shikoro', realm: 'Ysondre' },
];

let region = 'eu';
let fields = 'mythic_plus_weekly_highest_level_runs';

let classColors = {
  'Warrior': '#C79C6E', 'Paladin': '#F58CBA', 'Hunter': '#ABD473', 'Rogue': '#FFF569', 'Priest': '#FFFFFF',
  'Death Knight': '#C41F3B', 'Shaman': '#0070DE', 'Mage': '#40C7EB', 'Warlock': '#9482c9', 'Monk': '#00FF96',
  'Druid': '#FF7D0A', 'Demon Hunter': '#A330C9', 'Evoker': '#5DB7A2'
};

let allCharacters = [];
let characterRuns = [];
let altCharacterRuns = [];

// Function to calculate the time until next Wednesday 5:30 AM CEST
const calculateTimeUntilNextReset = () => {
  const now = new Date();
  const nextReset = new Date(now);
  
  // Set nextReset to the next Wednesday 5:30 AM CEST
  nextReset.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7)); // 3 is Wednesday
  nextReset.setHours(5, 30, 0, 0); // 5:30 AM
  
  const timeUntilReset = nextReset - now;
  return timeUntilReset > 0 ? timeUntilReset : timeUntilReset + 7 * 24 * 60 * 60 * 1000;
};

// Function to display messages on the webpage instead of the console
const displayMessageOnWebpage = (message) => {
  const messageElement = document.getElementById('next_reset_message');
  messageElement.innerText = message;
};

// Fetching data for characters
const fetchData = (charactersArray, targetArray) => {
  return Promise.all(charactersArray.map(character => {
    const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${character.realm}&name=${character.name}&fields=${fields},class`;

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        const runs = data.mythic_plus_weekly_highest_level_runs;
        const topRuns = runs.sort((a, b) => b.mythic_level - a.mythic_level).slice(0, 8);
        const highestRun = topRuns[0]?.mythic_level || 0; // Get the highest Mythic Plus run
        const numRuns = topRuns.length;
        const charClass = data.class;

        // Push the character data into the target array
        targetArray.push({
          name: character.name,
          realm: character.realm,
          runs: topRuns,
          numRuns,
          highestRun, // Include the highest run
          class: charClass
        });
      })
      .catch(error => {
        console.error(`Error getting data for ${character.name}: ${error}`);
        return null;
      });
  })).then(() => {
    // Sort by number of runs first, and then by highest run
    targetArray.sort((a, b) => {
      if (b.numRuns !== a.numRuns) {
        return b.numRuns - a.numRuns; // First sort by number of runs
      }
      return b.highestRun - a.highestRun; // Then sort by highest run
    });

    allCharacters = [...characterRuns, ...altCharacterRuns];
    allCharacters.sort((a, b) => {
      if (b.numRuns !== a.numRuns) {
        return b.numRuns - a.numRuns;
      }
      return b.highestRun - a.highestRun;
    });
  });
};

const updateTable = (tableId, dataArray) => {
  const table = document.getElementById(tableId);
  table.innerHTML = '';

  dataArray.forEach(character => {
    const row = table.insertRow();
    row.classList.add('table-row');

    const nameCell = row.insertCell();
    const dungeonCell = row.insertCell();
    const numRunsCell = row.insertCell();

    nameCell.innerHTML = character.name;
    
    // Create the dungeon cell content, making the 1st, 4th, and 8th runs bold
    dungeonCell.innerHTML = character.runs
      .map((run, index) => {
        let runLevel = '' + run.mythic_level; // Convert mythic level to string
        if (index === 0 || index === 3 || index === 7) {
          // Bold the 1st (index 0), 4th (index 3), and 8th (index 7) run
          runLevel = `<strong>${runLevel}</strong>`;
        }
        return runLevel;
      })
      .join(', '); // Join runs with ' || ' separator

    numRunsCell.innerHTML = character.numRuns > 0
      ? character.numRuns
      : `<img src='starege.png' class='numRunsImage'>`;

    // Color the cells based on class
    const color = classColors[character.class] || 'white';
    nameCell.style.color = color;
    dungeonCell.style.color = color;
    numRunsCell.style.color = color;
  });
};


// Search function to dynamically filter table rows
const searchTable = () => {
  const input = document.getElementById('searchBar').value.toLowerCase();
  const tableIds = ['current_results', 'past_results']; // Use tbody IDs directly

  tableIds.forEach(tableId => {
    const tableBody = document.getElementById(tableId);
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
      const nameCell = rows[i].getElementsByTagName('td')[0]; // Get the character name from the first cell
      if (nameCell) {
        const characterName = nameCell.textContent || nameCell.innerText;
        if (characterName.toLowerCase().indexOf(input) > -1) {
          rows[i].style.display = ""; // Show row if it matches the search
        } else {
          rows[i].style.display = "none"; // Hide row if it doesn't match
        }
      }
    }
  });
};

// Saving the current week's data and archiving the past week
const saveDataToLocalStorage = () => {
  const currentData = JSON.stringify(characterRuns);

  // Get current week's data before overwriting
  const pastData = localStorage.getItem('characterRuns');
  
  if (pastData) {
    // Save past week's data before overwriting current week's data
    localStorage.setItem('pastCharacterRuns', pastData);
  }

  // Save current week's data to localStorage
  localStorage.setItem('characterRuns', currentData);
};

// Load past week's data and display it in the "past week" table
const loadPastWeekData = () => {
  const pastData = localStorage.getItem('pastCharacterRuns');
  if (pastData) {
    const pastCharacterRuns = JSON.parse(pastData);
    updateTable('past_results', pastCharacterRuns); // Update the past week's table
  }
};


const fetchDataAndUpdate = () => {
  fetchData(characters, characterRuns)
    .then(() => {
      updateTable('current_results', characterRuns);
      saveDataToLocalStorage();
    })
    .catch(error => {
      console.error(`Error retrieving main character data: ${error}`);
    });
};

const fetchDataAndUpdateAlt = () => {
  fetchData(altCharacters, altCharacterRuns)
    .then(() => {
      updateTable('alt_results', altCharacterRuns);
      saveDataToLocalStorage();
    })
    .catch(error => {
      console.error(`Error retrieving alt character data: ${error}`);
    });
};

const convertTimeToDHMS = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  return `${days} days, ${remainingHours} hours, ${remainingMinutes} minutes`;
};

const scheduleWeeklyDataSave = () => {
  const timeUntilNextReset = calculateTimeUntilNextReset();
  
  setTimeout(() => {
    saveDataToLocalStorage();
    displayMessageOnWebpage('Data has been saved for this week.');
    scheduleWeeklyDataSave(); // Reschedule for next week after saving
  }, timeUntilNextReset);

  // Convert time into days, hours, and minutes and display it on the webpage
  const timeRemainingMessage = convertTimeToDHMS(timeUntilNextReset);
  displayMessageOnWebpage(`Next data save scheduled in: ${timeRemainingMessage}`);
};


const scheduleNextUpdate = () => {
  console.log('Scheduling next update...');
  const timeUntilNextWednesday = calculateTimeUntilNextReset();
  setTimeout(fetchDataAndUpdate, timeUntilNextWednesday);
  setTimeout(fetchDataAndUpdateAlt, timeUntilNextWednesday);
};

// Initial function calls
fetchDataAndUpdate();
fetchDataAndUpdateAlt();
loadPastWeekData();
scheduleWeeklyDataSave(); // Start weekly save schedule
