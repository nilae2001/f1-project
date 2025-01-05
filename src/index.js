const express = require('express');
<<<<<<< HEAD
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings, getConstructors, getConstructorStandings, getQualifying } = require("./controller.js")
const { conStandings, drivStandings, profileInfo, racesMain, teamInfo, teamsPlural, racesMod } = require("./app.js")
=======
const axios = require('axios');
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings, getResults, getConstructors, getConstructorStandings, getQualifying } = require("./controller.js")
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', async (req, res) => {
<<<<<<< HEAD

    const [coverPageInfo, drivers, teams, races, constructors] = await Promise.all([
      coverPageArticle(),
      driversFormatting(),
      teamsInfo(),
      getRaces(),
      getConstructors()
    ]);
=======
    
    const coverPageInfo = await coverPageArticle();
    const drivers = await driversFormatting();
    const teams = await teamsInfo();
    const races = await getRaces();
    const constructors = await getConstructors();
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125
    
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
        
<<<<<<< HEAD
});

app.get('/drivers', async (req, res) => {

    const [coverPageInfo, drivers, teams, races, constructors] = await Promise.all([
      coverPageArticle(),
      driversFormatting(),
      teamsInfo(),
      getRaces(),
      getConstructors()
    ]);
=======
    });

app.get('/drivers', async (req, res) => {
    
        const coverPageInfo = await coverPageArticle();
        const drivers = await driversFormatting();
        const teams = await teamsInfo();
        const races = await getRaces();
        const constructors = await getConstructors();
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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
        
<<<<<<< HEAD
});

app.get('/constructor-standings', async (req, res) => {

      const [coverPageInfo, drivers, teams, races, constructors, enrichedConsStandings] = await Promise.all([
        coverPageArticle(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        conStandings()
      ]);

=======
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
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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
      
<<<<<<< HEAD
});

app.get('/driver-standings', async (req, res) => {

      const [driverStandings, drivers, teams, races, constructors, enrichedStandings] = await Promise.all([
        getDriverStandings(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        drivStandings()
      ]);
    
=======
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
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125
    
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
<<<<<<< HEAD
});

app.get('/profile', async (req, res) => {
      try {

        const url = req.url;

        const getProfileInfo = await profileInfo(url);
        const { foundStanding, page, foundDriver } = getProfileInfo;


        const [ drivers, teams, races, constructors ] = await Promise.all([
          driversFormatting(),
          teamsInfo(),
          getRaces(),
          getConstructors()
        ]);
    
    
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
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
      }
});
    
app.get('/races', async (req, res) => {
          try {

            const url = req.url

            const racesHome = await racesMain(url); 
            const { finalRace, page } = racesHome;

            const [drivers, teams, races, constructors] = await Promise.all([
              driversFormatting(),
              teamsInfo(),
              getRaces(),
              getConstructors()
            ]);
      
=======
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
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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
<<<<<<< HEAD
});

app.get('/team', async (req, res) => {
        try {

          const url = req.url;

          const teamInfoResult = await teamInfo(url); 
          const { teamMatch, teamImageMatch, page } = teamInfoResult;

          const [drivers, teams, races, constructors, driversId] = await Promise.all([
            driversFormatting(),
            teamsInfo(),
            getRaces(),
            getConstructors(),
            getQualifying()
          ]);
=======
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
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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
<<<<<<< HEAD
});

app.get('/teams', async (req, res) => {

      const [coverPageInfo, drivers, teams, races, constructors, consStandings, enrichedConsStandings] = await Promise.all([
        coverPageArticle(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        getConstructorStandings(),
        teamsPlural()
      ]);
=======
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
      
      
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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
      
<<<<<<< HEAD
});

app.get('/schedule', async (req, res) => {

    const [drivers, teams, races, constructors] = await Promise.all([
      driversFormatting(),
      teamsInfo(),
      racesMod(),
      getConstructors(),
    ]);
=======
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

    

    
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125

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


<<<<<<< HEAD
app.listen(7865);
=======
    app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
>>>>>>> 9e6e12f017189a8b24ff8a5d3f83f1d57aa4e125
