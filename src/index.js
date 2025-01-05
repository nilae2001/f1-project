const express = require('express');
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings, getConstructors, getConstructorStandings, getQualifying } = require("./controller.js")
const { conStandings, drivStandings, profileInfo, racesMain, teamInfo, teamsPlural, racesMod } = require("./app.js")

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', async (req, res) => {

    const [coverPageInfo, drivers, teams, races, constructors] = await Promise.all([
      coverPageArticle(),
      driversFormatting(),
      teamsInfo(),
      getRaces(),
      getConstructors()
    ]);
    
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

    const [coverPageInfo, drivers, teams, races, constructors] = await Promise.all([
      coverPageArticle(),
      driversFormatting(),
      teamsInfo(),
      getRaces(),
      getConstructors()
    ]);

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

      const [coverPageInfo, drivers, teams, races, constructors, enrichedConsStandings] = await Promise.all([
        coverPageArticle(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        conStandings()
      ]);


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

      const [driverStandings, drivers, teams, races, constructors, enrichedStandings] = await Promise.all([
        getDriverStandings(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        drivStandings()
      ]);
    
    
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

      const [coverPageInfo, drivers, teams, races, constructors, consStandings, enrichedConsStandings] = await Promise.all([
        coverPageArticle(),
        driversFormatting(),
        teamsInfo(),
        getRaces(),
        getConstructors(),
        getConstructorStandings(),
        teamsPlural()
      ]);

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

    const [drivers, teams, races, constructors] = await Promise.all([
      driversFormatting(),
      teamsInfo(),
      racesMod(),
      getConstructors(),
    ]);

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


app.listen(7865);