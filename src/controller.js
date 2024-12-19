const axios = require('axios');

const getDrivers = async () => {

    const options = {
        method: 'GET',
        url: 'https://api.jolpi.ca/ergast/f1/2024/drivers/?format=json',
    };

    try {
        const response = await axios.request(options);

        const drivers = response.data.MRData.DriverTable.Drivers

        return drivers;

    } catch (error) {
        console.error('Error fetching current scoreboard:', error.message);
        return null;
    }
};

const getRaces = async () => {
    
    const options = {
        method: 'GET',
        url: 'https://api.jolpi.ca/ergast/f1/2024/races/?format=json',
    };

    try {

        let raceNames = [];

        const response = await axios.request(options);

        const races = response.data.MRData.RaceTable.Races;

        races.forEach(object => {
            raceNames.push(object)
        })

        return raceNames;

    } catch (error) {
        console.error('Error fetching current scoreboard:', error.message);
        return null;
    }
}

const getTeams = async () => {
    
    const options = {
        method: 'GET',
        url: 'https://api.jolpi.ca/ergast/f1/2024/constructors/?format=json',
    };

    try {
        const response = await axios.request(options);

        const races = response.data.MRData.ConstructorTable.Constructors;

        return races;

    } catch (error) {
        console.error('Error fetching current scoreboard:', error.message);
        return null;
    }
}

const teamsInfo = async () => {
    try {
        const teams = await getTeams();

        teams.forEach(team => {
            if (team.constructorId === "sauber") {
                team.image = `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/kick-sauber.png`;
            } else if (team.constructorId === "red_bull") {
                team.image = `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/red-bull-racing.png`
            } else if (team.constructorId === "aston_martin") {
                team.image = `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/aston-martin.png`
            } else {
                team.image = `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/${team.constructorId}.png`
            }
        })

        return teams; 
    } catch (error) {
        console.error('Error fetching current scoreboard:', error.message);
        return null;
    }
}


const coverPageArticle = async () => {
    try {
    const races = await getRaces();

    const finalRace = races[races.length - 1];

    return finalRace;

    } catch (error) {
        console.error('Error fetching races:', error.message);
        return null;
    }
}

const getDriverStandings = async () => {
    try {
        const options = {
            method: 'GET',
            url: 'https://api.jolpi.ca/ergast/f1/2024/driverstandings/?format=json',
        };
    
        try {
            const response = await axios.request(options);

            let driverStandings;
    
            const standingsList = response.data.MRData.StandingsTable.StandingsLists;
    
            standingsList.forEach(driver => {
                driverStandings = driver.DriverStandings
            })

            return driverStandings
    
        } catch (error) {
            console.error('Error fetching current scoreboard:', error.message);
            return null;
        }
    } catch (error) {

    }
}

// const driverScoreboard = async () => {

//     const driverStandings = await getDriverStandings();

//     console.log(driverStandings)

//     let driverInfo;

//     driverStandings.forEach(person => {
//         driverInfo += person;
//     })

    
//     return driverInfo;
// }

getDriverStandings()

async function driversFormatting() {
    try {
        const driversList = await getDrivers();

        if (!driversList) {
            return res.status(500).send('Could not retrieve driver standings.');
        }

        const drivers = [];
        for (let driver of driversList) {

                let imageUrl = `https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_1320/content/dam/fom-website/drivers/2024Drivers/${driver.familyName.toLowerCase()}.jpg`;

                
                const fallbackImageUrl = `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/fom-website/drivers/2024Drivers/${driver.familyName.toLowerCase()}.jpg`;

                
                try {
                    await axios.head(imageUrl);
                } catch (error) {
                    imageUrl = fallbackImageUrl;
                }

                drivers.push({
                    driverName: driver.givenName,
                    driverFamilyName: driver.familyName,
                    nationality: driver.nationality || 'N/A',
                    number: driver.permanentNumber || "N/A",
                    birthdate: driver.dateOfBirth || "N/A",
                    image: imageUrl || 'default.jpg'
                    
                });
        
    }

    return drivers;
} catch (err) {
    console.error("Error processing profiles:", err);
    res.end("Failed to load profiles.");
  }
}

module.exports = { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings }