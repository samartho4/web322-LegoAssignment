/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Samarth Sharma   Student ID: 139563225     Date: 2024-08-15
*
* Published Website: 
*
********************************************************************************/
const legoData = require("./modules/legoSets");
const authData = require('./modules/auth-service.js'); // A-6
const path = require("path");

const clientSessions = require('client-sessions');

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'jkdfhakdghdlka34342423', // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (req.session.user) {
      next();
  } else {
      res.redirect('/login');
  }
}

app.get('/', (req, res) => res.render('home'));

app.get('/about', (req, res) => res.render('about'));

app.get("/lego/sets", async (req,res)=>{
  try{
    if(req.query.theme){
      let sets = await legoData.getSetsByTheme(req.query.theme);
      res.render("sets", { sets: sets });
  
    }else{
      let sets = await legoData.getAllSets();
      res.render("sets", { sets: sets });
    }
  }catch(err){
    res.status(404).render("404", { message: "Unable to find requested set." });
  }

});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set: set});
  }catch(err){
    res.status(404).render("404", { message: "Unable to find requested sets." });
  }
});

// DATABSE - ROUTES
app.get('/lego/addSet', ensureLogin, (req, res) => {
  legoData.getAllThemes()
      .then(themes => {
          res.render('addSet', { themes: themes });
      })
      .catch(err => {
          res.render('500', { message: `Failed to fetch themes: ${err}` });
      });
});

app.post('/lego/addSet', ensureLogin, (req, res) => {
  const setData = req.body;

  legoData.addSet(setData)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch(err => {
          res.render('500', { message: `Failed to add set: ${err}` });
      });
});

app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  Promise.all([legoData.getSetByNum(setNum), legoData.getAllThemes()])
      .then(([setData, themeData]) => {
          res.render('editSet', { themes: themeData, set: setData });
      })
      .catch(err => {
          res.status(404).render('404', { message: err });
      });
});

app.post('/lego/editSet', ensureLogin, (req, res) => {
  const setNum = req.body.set_num;
  const setData = req.body;

  legoData.editSet(setNum, setData)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch(err => {
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      });
});

app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;

  legoData.deleteSet(setNum)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch(err => {
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      });
});

// Login and Register Routes

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData.checkUser(req.body)
      .then(user => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory
          };
          res.redirect('/lego/sets');
      })
      .catch(err => {
          res.render('login', { errorMessage: err, userName: req.body.userName });
      });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
      .then(() => {
          res.render('register', { successMessage: "User created" });
      })
      .catch(err => {
          res.render('register', { errorMessage: err, userName: req.body.userName });
      });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

app.use((req, res, next) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
});

legoData.initialize().then(authData.initialize).then(function(){
    app.listen(HTTP_PORT, function(){
        console.log(`app listening on: ${HTTP_PORT}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`);
});

module.exports = app;
