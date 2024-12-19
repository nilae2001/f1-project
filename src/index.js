const express = require('express');
const axios = require('axios');
const path = require('path');
const ejs = require('ejs');
const { driversFormatting, coverPageArticle, teamsInfo, getRaces, getDriverStandings } = require("./controller.js")

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    
    const coverPageInfo = await coverPageArticle();
    const drivers = await driversFormatting();
    const teams = await teamsInfo();
    const races = await getRaces();
    
        ejs.renderFile(
            path.join(__dirname, "./views/home.ejs"),
            { coverPageInfo, drivers, teams, races },
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
    
    const drivers = await driversFormatting();

        ejs.renderFile(
            path.join(__dirname, "./views/drivers.ejs"),
            { drivers },
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

        const enrichedStandings = driverStandings.map((standing) => {
            const matchingDriver = drivers.find(
              (driver) =>
                driver.driverName === standing.Driver.givenName &&
                driver.driverFamilyName === standing.Driver.familyName
            );
          
            return {
              ...standing,
              image: matchingDriver ? matchingDriver.image : null, 
            };
          });

        console.log(enrichedStandings)
    
            ejs.renderFile(
                path.join(__dirname, "./views/driverStandings.ejs"),
                { driverStandings, drivers, teams, races, enrichedStandings },
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
