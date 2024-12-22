const express = require('express');
const axios = require('axios');
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings, getResults, getConstructors, getConstructorStandings, getQualifying } = require("./controller.js")

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    
    const coverPageInfo = await coverPageArticle();
    const drivers = await driversFormatting();
    const teams = await teamsInfo();
    const races = await getRaces();
    const constructors = await getConstructors();
    
        ejs.renderFile(
            path.join(__dirname, "./views/home.ejs"),
            { coverPageInfo, drivers, teams, races, constructors },
            (err, html) => {
              if (err) {
                console.error("Error rendering EJS:", err);
                res.end("Failed to load profiles.");
              } else {
                res.end(html);
              }
            }
          );
        
    });

app.get('/drivers', async (req, res) => {
    
        const coverPageInfo = await coverPageArticle();
        const drivers = await driversFormatting();
        const teams = await teamsInfo();
        const races = await getRaces();
        const constructors = await getConstructors();

        ejs.renderFile(
            path.join(__dirname, "./views/drivers.ejs"),
            { coverPageInfo, drivers, teams, races, constructors },
            (err, html) => {
              if (err) {
                console.error("Error rendering EJS:", err);
                res.end("Failed to load profiles.");
              } else {
                res.end(html);
              }
            }
          );
        
    });

    app.get('/constructor-standings', async (req, res) => {
    
      const coverPageInfo = await coverPageArticle();
      const drivers = await driversFormatting();
      const teams = await teamsInfo();
      const races = await getRaces();
      const constructors = await getConstructors();
      const consStandings = await getConstructorStandings();

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

      ejs.renderFile(
          path.join(__dirname, "./views/consStandings.ejs"),
          { coverPageInfo, drivers, teams, races, constructors, enrichedConsStandings },
          (err, html) => {
            if (err) {
              console.error("Error rendering EJS:", err);
              res.end("Failed to load profiles.");
            } else {
              res.end(html);
            }
          }
        );
      
  });

    app.get('/driver-standings', async (req, res) => {
      const driverStandings = await getDriverStandings();
      const drivers = await driversFormatting();
      const teams = await teamsInfo();
      const races = await getRaces();
      const constructors = await getConstructors();
    
      
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
    
      ejs.renderFile(
        path.join(__dirname, "./views/driverStandings.ejs"),
        { driverStandings, drivers, teams, races, enrichedStandings, constructors },
        (err, html) => {
          if (err) {
            console.error("Error rendering EJS:", err);
            res.end("Failed to load profiles.");
          } else {
            res.end(html);
          }
        }
      );
    });

    app.get('/profile', async (req, res) => {
      const driverStandings = await getDriverStandings();
      const drivers = await driversFormatting();
      const teams = await teamsInfo();
      const races = await getRaces();
      const constructors = await getConstructors();
      const driversId = await getQualifying();

      const url = req.url;
    
      const driverName = decodeURIComponent(url.split("=")[1]);
      const [driverGivenName, driverSurname] = driverName.split("+").map((name) =>
        name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
    
      
      const foundStanding = driverStandings.find(
        (d) => 
          d.Driver.familyName.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === driverSurname
      );
    
      const foundDriver = drivers.find(
        (d) => 
          d.driverFamilyName.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === driverSurname
      );
    
      
      if (foundDriver) {
        foundDriver.helmetImg = `https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_1024/content/dam/fom-website/manual/Helmets2024/${foundDriver.driverFamilyName.toLowerCase()}`;
      }

      

      const wikiPage = driversId.find(d => d.Driver.familyName === foundDriver.driverFamilyName)

      foundDriver.wiki = wikiPage ? wikiPage.Driver.url : null;

      if (foundDriver.wiki === null) {
        foundDriver.wiki = `https://en.wikipedia.org/wiki/${foundDriver.driverName}_${foundDriver.driverFamilyName}`
      }

      const urlP = foundDriver.wiki;

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
    
      if (!foundDriver) {
        res.status(404).send("Driver not found");
        return;
      }
    
      ejs.renderFile(
        path.join(__dirname, "./views/info.ejs"),
        { foundDriver, foundStanding, drivers, teams, races, constructors, page },
        (err, html) => {
          if (err) {
            console.error("Error rendering EJS:", err);
            res.status(500).send("Failed to load driver details.");
          } else {
            res.send(html);
          }
        }
      );
    });

        app.get('/races', async (req, res) => {
          try {
              const drivers = await driversFormatting();
              const teams = await teamsInfo();
              const races = await getRaces();
              const constructors = await getConstructors();
      
              const url = req.url;

              const raceNameEncoded = url.split("=")[1]; 
      
              const raceNameDecoded = decodeURIComponent(raceNameEncoded.replace(/\+/g, " ")); 

              const finalRace = races.find(race => race.raceName === raceNameDecoded);
      
              if (!finalRace) {
                  res.status(404).send("Race not found");
                  return;
              }

              const underscoredRaceName = finalRace.raceName.split(" ").join("_"); 

              finalRace.img = `https://media.formula1.com/content/dam/fom-website/races/2024/${underscoredRaceName}.png`;

              const urlP = finalRace.url;

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

              ejs.renderFile(
                  path.join(__dirname, "./views/race.ejs"),
                  { drivers, teams, races, finalRace, constructors, page},
                  (err, html) => {
                      if (err) {
                          console.error("Error rendering EJS:", err);
                          res.status(500).send("Failed to load race details.");
                      } else {
                          res.send(html);
                      }
                  }
              );
          } catch (error) {
              console.error("Error handling /races request:", error);
              res.status(500).send("Internal Server Error");
          }
      });

      app.get('/team', async (req, res) => {
        try {
            const drivers = await driversFormatting();
            const teams = await teamsInfo();
            const races = await getRaces();
            const constructors = await getConstructors();
            const driversId = await getQualifying();

            let twoDrivers = [];

            const url = req.url;

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

           

            const urlP = teamMatch.url;

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

            ejs.renderFile(
                path.join(__dirname, "./views/teams.ejs"),
                { drivers, teams, races, teamMatch, teamImageMatch, constructors, page },
                (err, html) => {
                    if (err) {
                        console.error("Error rendering EJS:", err);
                        res.status(500).send("Failed to load race details.");
                    } else {
                        res.send(html);
                    }
                }
            );
        } catch (error) {
            console.error("Error handling /races request:", error);
            res.status(500).send("Internal Server Error");
        }
    });



    app.get('/teams', async (req, res) => {
    
      const coverPageInfo = await coverPageArticle();
      const drivers = await driversFormatting();
      const teams = await teamsInfo();
      const races = await getRaces();
      const constructors = await getConstructors();
      const consStandings = await getConstructorStandings();
      

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
      
      

      ejs.renderFile(
          path.join(__dirname, "./views/teamsOverview.ejs"),
          { coverPageInfo, drivers, teams, races, constructors, enrichedConsStandings },
          (err, html) => {
            if (err) {
              console.error("Error rendering EJS:", err);
              res.end("Failed to load profiles.");
            } else {
              res.end(html);
            }
          }
        );
      
  });

  app.get('/schedule', async (req, res) => {
    
    const drivers = await driversFormatting();
    const teams = await teamsInfo();
    const races = await getRaces();
    const constructors = await getConstructors();

    const url = req.url;

    races.forEach(team => {
      const underscoredRaceName = team.raceName.split(" ").join("_"); 

      team.img = `https://media.formula1.com/content/dam/fom-website/races/2024/${underscoredRaceName}.png`;

      team.plus = team.raceName.replace(/ /g, "+");

    })

    

    

    ejs.renderFile(
        path.join(__dirname, "./views/schedule.ejs"),
        { drivers, teams, races, constructors, },
        (err, html) => {
          if (err) {
            console.error("Error rendering EJS:", err);
            res.end("Failed to load profiles.");
          } else {
            res.end(html);
          }
        }
      );
    
});


    app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
