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

// Function to calculate the time until next Wednesday 6 AM CEST
const calculateTimeUntilNextReset = () => {
  const now = new Date();
  const nextReset = new Date(now);
  
  // Set nextReset to the next Wednesday 6 AM CEST
  nextReset.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7)); // 3 is Wednesday
  nextReset.setHours(6, 0, 0, 0); // 6:00 AM
  
  const timeUntilReset = nextReset - now;
  return timeUntilReset > 0 ? timeUntilReset : timeUntilReset + 7 * 24 * 60 * 60 * 1000;
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
    dungeonCell.innerHTML = character.runs
      .map(run => ('' + run.mythic_level).slice(-2))
      .reduce((acc, level, index) => {
        if (index === 1) {
          acc.push([level + ',']);
        } else if (index === 3 || index === 7) {
          acc[acc.length - 1].push(level + (index === 3 ? ',' : ''));
          acc.push([]);
        } else {
          acc[acc.length - 1].push(level + ',');
        }
        return acc;
      }, [[]])
      .map(group => group.join('').replace(/,$/, ' '))
      .join('|| ');

    numRunsCell.innerHTML = character.numRuns > 0 ?
      character.numRuns :
      `<img src='starege.png' class='numRunsImage'>`;

    const color = classColors[character.class] || 'white';
    nameCell.style.color = color;
    dungeonCell.style.color = color;
    numRunsCell.style.color = color;
  });
};

// Saving the current week's data and archiving the past week
const saveDataToLocalStorage = () => {
  const currentData = JSON.stringify(characterRuns);
  localStorage.setItem('characterRuns', currentData);

  // Move current week's data to pastCharacterRuns
  const pastData = localStorage.getItem('characterRuns');
  if (pastData) {
    localStorage.setItem('pastCharacterRuns', pastData);
  }

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

// Schedule weekly data save before reset
const scheduleWeeklyDataSave = () => {
  const timeUntilNextReset = calculateTimeUntilNextReset();
  console.log(`Next data save scheduled in: ${timeUntilNextReset / 1000 / 60} minutes`);

  setTimeout(() => {
    saveDataToLocalStorage();  // Save current week data to past week data
    scheduleWeeklyDataSave();  // Reschedule for the next week
  }, timeUntilNextReset);
};

window.onload = () => {
  fetchDataAndUpdate(); // Load current week data
  loadPastWeekData();   // Load past week data and display
  fetchDataAndUpdateAlt();
  scheduleWeeklyDataSave(); // Start weekly save schedule
};