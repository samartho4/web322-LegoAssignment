/********************************************************************************
 *  WEB322 – Assignment 03
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: _Samarth Sharma_ Student ID: _139563225_ Date: 18-06-2024
 *
 * Published URL: web322-lego-assign-git-7abbcd-samarth-sharmas-projects-bd9b00fb.vercel.app

 ********************************************************************************/
const legoData = require("./modules/legoSets");
const express = require("express");
const path = require('path');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

legoData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: ${HTTP_PORT}`)
    );
  })
  .catch((err) => {
    console.log("Error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => res.json(sets))
      .catch((error) => res.status(404).send(error.message));
  } else {
    legoData.getAllSets()
      .then((sets) => res.json(sets))
      .catch((error) => res.status(404).send(error.message));
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  const setNum = req.params.set_num;
  legoData.getSetByNum(setNum)
    .then((set) => res.json(set))
    .catch((error) => res.status(404).send(error.message));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

module.exports = app;
