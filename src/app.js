const express = require('express');
const axios = require('axios');
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings, getConstructors, getConstructorStandings, getQualifying } = require("./controller.js")


const conStandings = async () => {
    const [consStandings, teams] = await Promise.all ([
        getConstructorStandings(),
        teamsInfo()
    ]);

    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const enrichedConsStandings = consStandings.map((standing) => {
        const matchingTeam = teams.find((team) =>
          normalizeString(team.name) === normalizeString(standing.Constructor.name)
        );
  
        return {
          ...standing,
          image: matchingTeam ? matchingTeam.image : null, 
        };
      });

      return enrichedConsStandings;
}

const drivStandings = async () => {

    const driverStandings = await getDriverStandings();

    const drivers = await driversFormatting();

    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
      const enrichedStandings = driverStandings.map((standing) => {
        const matchingDriver = drivers.find(
          (driver) =>
            normalizeString(driver.driverName) === normalizeString(standing.Driver.givenName) &&
            normalizeString(driver.driverFamilyName) === normalizeString(standing.Driver.familyName)
        );
    
        return {
          ...standing,
          image: matchingDriver ? matchingDriver.image : null, 
        };
      });

      return enrichedStandings
}

const profileInfo = async (url) => {

    const driverStandings = await getDriverStandings();
    const drivers = await driversFormatting();
    const driversId = await getQualifying();

        if (!url.includes("=")) {
          res.status(400).send("Invalid request");
          return;
        }
    
        const driverName = decodeURIComponent(url.split("=")[1]).replace(/\+/g, " ");
        const [driverGivenName, driverSurname] = driverName.split(" ");

    
        const foundStanding = driverStandings.find((d) => {
          const familyName = d.Driver.familyName?.toLowerCase();
          const givenName = d.Driver.givenName?.toLowerCase();
          return familyName === driverSurname.toLowerCase() && givenName === driverGivenName.toLowerCase();
        });
    
        const foundDriver = drivers.find((d) => {
          const driverFamilyName = d.driverFamilyName?.toLowerCase();
          const driverGivenName = d.driverName?.toLowerCase();
          return driverFamilyName === driverSurname.toLowerCase() && driverGivenName === driverGivenName.toLowerCase();
        });
    
        if (!foundDriver) {
          console.warn("Driver not found:", driverGivenName, driverSurname);
          res.status(404).send("Driver not found");
          return;
        }
    
        foundDriver.helmetImg = `https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_1024/content/dam/fom-website/manual/Helmets2024/${foundDriver.driverFamilyName.toLowerCase()}`;
    
        const wikiPage = driversId.find(
          (d) => d.Driver.familyName.toLowerCase() === foundDriver.driverFamilyName.toLowerCase()
        );
    
        foundDriver.wiki = `https://en.wikipedia.org/wiki/${foundDriver.driverName}_${foundDriver.driverFamilyName}`;

        if (foundDriver.driverFamilyName === "Albon") {
          foundDriver.wiki = `https://en.wikipedia.org/wiki/Alex_Albon`;
        } else if (foundDriver.driverFamilyName === "Sainz") {
          foundDriver.wiki = `https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.`
        } else if (foundDriver.driverFamilyName === "Russell") {
          foundDriver.wiki = `https://en.wikipedia.org/wiki/George_Russell_(racing_driver)`
        } else if (foundDriver.driverFamilyName === "Zhou") {
          foundDriver.wiki = `https://en.wikipedia.org/wiki/Zhou_Guanyu`
        }
    
        const decodedTitle = decodeURIComponent(new URL(foundDriver.wiki).pathname.split("/wiki/")[1]);

        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&explaintext=false&origin=*&titles=${encodeURIComponent(decodedTitle)}`
        );

        if (!response.ok) throw new Error("Failed to fetch Wikipedia content");
    
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];

        return { foundStanding, page, foundDriver }
}

const racesMain = async (url) => {

    const races = await getRaces();

    const raceNameEncoded = url.split("=")[1]; 

    const raceNameDecoded = decodeURIComponent(raceNameEncoded.replace(/\+/g, " ")); 

    const finalRace = races.find(race => race.raceName === raceNameDecoded);

    if (!finalRace) {
        res.status(404).send("Race not found");
        return;
    }

    const underscoredRaceName = finalRace.raceName.split(" ").join("_"); 

    finalRace.img = `https://media.formula1.com/content/dam/fom-website/races/2024/${underscoredRaceName}.png`;

    const underscored = finalRace.raceName.replace(/\s/g, "_")
    

    const urlP = `https://en.wikipedia.org/wiki/2024_${underscored}`;

    const decodedTitle = decodeURIComponent(new URL(urlP).pathname.split("/wiki/")[1]);

    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&explaintext=false&origin=*&titles=${encodeURIComponent(decodedTitle)}`
    );

    if (!response.ok) throw new Error("Failed to fetch Wikipedia content");

    const data = await response.json();
    const page = Object.values(data.query.pages)[0];

    return { finalRace, page }
}

const teamInfo = async (url) => {

    const constructors = await getConstructors();
    const teams = await teamsInfo();
    const drivers = await driversFormatting();
    const driversId = await getQualifying();

    let twoDrivers = [];

    const teamNameEncoded = url.split("=")[1]; 

    const teamNameDecoded = decodeURIComponent(teamNameEncoded.replace(/\+/g, " "));

    const teamMatch = constructors.find(team => team.name === teamNameDecoded);

    const teamImageMatch = teams.find(team => team.name === teamNameDecoded)

    teamMatch.plus = teamMatch.name.replace(" ", "+");

    
    const matchingDrivers = driversId.filter(d => d.Constructor.name === teamMatch.name);

    matchingDrivers.forEach(driver => {
        twoDrivers.push(driver.Driver);
    });
    
    teamMatch.drivers = twoDrivers


    teamMatch.drivers.forEach(driver => {
        const img = drivers.find(d => d.number === driver.permanentNumber);

        driver.img = img.image
    })

    let urlP = teamMatch.url;

    if(teamMatch.name === "Williams") {
        urlP = "https://en.wikipedia.org/wiki/Williams_Racing"
    }

        const newUrl = new URL(urlP);
        const title = newUrl.pathname.split("/wiki/")[1];

        const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&explaintext=false&origin=*&titles=${encodeURIComponent(
            title
        )}`
        );
        if (!response.ok) throw new Error("Failed to fetch Wikipedia content");

        const data = await response.json();
        const page = Object.values(data.query.pages)[0];

        return { teamMatch, teamImageMatch, page }
}

const teamsPlural = async () => {
    const consStandings = await getConstructorStandings();
    const teams = await teamsInfo()


    const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const enrichedConsStandings = consStandings.map((standing) => {
        const matchingTeam = teams.find((team) =>
          normalizeString(team.name) === normalizeString(standing.Constructor.name)
        );
  
        return {
          ...standing,
          image: matchingTeam ? matchingTeam.image : null, 
        };
      });

      enrichedConsStandings.forEach(team => {
        team.plus = team.Constructor.name.replace(/ /g, "+");
      })

      return enrichedConsStandings;
}

const racesMod = async () => {
    const races = await getRaces();

    races.forEach(team => {
        const underscoredRaceName = team.raceName.split(" ").join("_"); 
  
        team.img = `https://media.formula1.com/content/dam/fom-website/races/2024/${underscoredRaceName}.png`;
  
        team.plus = team.raceName.replace(/ /g, "+");
      })

      return races;
}

module.exports = { conStandings, drivStandings, profileInfo, racesMain, teamInfo, teamsPlural, racesMod }