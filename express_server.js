const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//=============== DATABASE ================//

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  s9m5xK: "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

//=============== FUNCTIONS ================//

const generateRandomString = function() {
  return Math.random()
    .toString(30)
    .substring(2, 8);
};
//const randomID = function() {};

//=============== GET ================//

app.get("/urls.json", (req, res) => {
  res.json(
    (urlDatabase = {
      shortURL: longURL
    })
  );
});

// RENDERS THE HOME PAGE WITH SHORT-LONG URLS
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// RENDERS REGISTRATION PAGE FOR USER
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

// RENDERS LOGIN PAGE FOR USER
app.get("/login", (req, res) => {
  res.render("urls_login");
});

// RENDERS NEW_URL PAGE FOR USER TO CONVERT FROM LONG URL TO SHORT
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// TAKES TO THE ACTUAL PAGE IN THE LINK AND DISPLAYS THE SHORTURL INSTEAD OF THE ORIGINAL URL(longURL)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.get("/urls/:shortURL", (req, res) => {
//   const tempVars = {
//     shortURL: req.params.shortURL,
//     longURL: urlDatabase[req.params.shortURL],
//     username: req.cookies["name"]
//   };
//   res.render("urls_show", tempVars);
// });

//=============== POST =================//

// CONVERTS LONG URL TO SHORT and redirects to /URLS
app.post("/urls", (req, res) => {
  longURL = req.body.longURL;
  shortURL = generateRandomString(longURL);
  urlDatabase[shortURL] = longURL;
  res.cookie("user_id");
  res.redirect("/urls", templateVars);
});

// DELETES THE CONVERTED URLS FROM THE LIST/DATABASE
app.post("/urls/:shortURL/delete", function(req, res) {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// REGISTER'S NEW USER -- ADD COOKIES -- REDIRECTS TO URL PAGE (upon submit -- checks if user already exist -- if user has input the both the fields -- else throw error)
app.post("/register", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  for (let userID in users) {
    if (email === users[userID]["email"]) {
      res.status(400).send("Email-id already exist");
    }
  }
  const userRandomID = generateRandomString();
  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: password
  };
  res.cookie("user_id", userRandomID);
  res.redirect("/urls");
});

// LOGIN PAGE FOR USER (upon submit -- checks if user already exist else throws error)
app.post("/login", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  let userRandomID = "";
  let validUser = false;
  for (let userID in users) {
    if (
      email === users[userID]["email"] &&
      password === users[userID]["password"]
    ) {
      userRandomID = userID;
      validUser = true;
    }
  }
  if (validUser) {
    res.cookie("user_id", userRandomID);
    res.redirect("/urls");
  } else {
    res.status(403).send("Try again. Email or password does not match");
  }
});

// LOGOUT PAGE FOR USER -- CLEARS COOKIES (displays logout message -- displays login & register option)
app.post("/logout", function(req, res) {
  let templateVars = {
    user: null
  };
  res.clearCookie("user_id");
  res.render("urls_logout", templateVars);
});

// LISTENING TO PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//=============== WASTE CODE =================//

/*
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



*/
