const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);
//=============== DATABASE ================//

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  s9m5xK: { longURL: "http://www.google.com", userID: "anotherID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  anotherID: {
    id: "anotherID",
    email: "another@example.com",
    password: "monkey-dinosaur"
  }
};

//=============== FUNCTIONS ================//

// GENERATE RANDOM STRING
const generateRandomString = function() {
  return Math.random()
    .toString(30)
    .substring(2, 8);
};

// FIND USER BY EMAIL ID
function findUserEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return "";
}

// FINDS URL LIST OF THE LOGGED IN USER
function urlsForUser(id) {
  let userURL = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURL[url] = urlDatabase[url];
    }
  }
  return userURL;
}

//=============== GET ================//

// RENDERS HOME PAGE WITH SHORT-LONG URLS
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  let templateVars = {
    urls: urlsForUser(userID),
    user_id: userID,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

// RENDERS REGISTRATION PAGE FOR USER
app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("urls_registration", templateVars);
});

// RENDERS LOGIN PAGE FOR USER
app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("urls_login", templateVars);
});

// RENDERS NEW_URL PAGE FOR USER TO CONVERT FROM LONG URL TO SHORT
app.get("/urls/new", (req, res) => {
  const loggedInUser = users[req.session.userID];
  if (!loggedInUser) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: loggedInUser
    };
    res.render("urls_new", templateVars);
  }
});

// RENDERS EDIT URL PAGE (urls_show) FOR USER TO EDIT
app.get("/urls/:shortURL", (req, res) => {
  const tempVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.userID]
  };
  console.log(tempVars);
  res.render("urls_show", tempVars);
});

// REDIRECTS TO THE ACTUAL PAGE IN THE LINK AND DISPLAYS THE SHORTURL (instead of longURL)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//=============== POST =================//

// CONVERTS LONG URL TO SHORT for logged-in user else redirects to login
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    res.redirect("/login");
  } else {
    longURL = req.body.longURL;
    shortURL = generateRandomString(longURL);
    urlDatabase[shortURL] = { longURL: longURL, userID: userID };
    res.redirect("/urls");
  }
});

// DELETES THE CONVERTED URLS FROM THE USER'S URL LIST
app.post("/urls/:shortURL/delete", (req, res) => {
  let userLoggedIn = req.session.userID;
  let usersURL = urlDatabase[req.params.shortURL].userID;
  if (userLoggedIn === usersURL) {
    let deletingURL = req.params.shortURL;
    delete urlDatabase[deletingURL];
    res.redirect("/urls");
  } else {
    res.send("Sorry, you are not a user.");
  }
});

// EDITS THE CONVERTED URLS FROM THE USER'S URL LIST
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let userLoggedIn = req.session.userID;
  let usersURL = urlDatabase[req.params.shortURL].userID;
  if (userLoggedIn === usersURL) {
    let newURL = req.body.newlongURL;
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = newURL;
    res.redirect("/urls");
  } else {
    res.send("Sorry, you are not a user");
  }
});

// REGISTER'S NEW USER -- ADD COOKIES -- REDIRECTS TO URL PAGE (upon submit -- checks if user already exist -- if user has input the both the fields -- else throw error)
app.post("/register", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  for (let userID in users) {
    if (email === users[userID]["email"]) {
      res.status(400).send("Email-id already exist");
    }
  }
  const userRandomID = generateRandomString();
  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: hashedPassword
  };
  req.session.userID = userRandomID;
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
      bcrypt.compareSync(password, users[userID]["password"])
    ) {
      userRandomID = userID;
      validUser = true;
    }
  }
  if (validUser) {
    req.session.userID = userRandomID;
    res.redirect("/urls");
  } else {
    res.redirect("/login", 403);
  }
});

// LOGOUT PAGE FOR USER -- CLEARS COOKIES (displays logout message -- displays login & register option)
app.post("/logout", function(req, res) {
  let templateVars = {
    user: null
  };
  req.session.userID = null;
  res.render("urls_logout", templateVars);
});

//===========================================//

// LISTENING TO PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//=============== WASTE CODE =================//
/*
Cookie Options
maxAge: 24 * 60 * 60 * 1000 // 24 hours


app.get("/urls.json", (req, res) => {
  res.json(
    (urlDatabase = {
      shortURL: longURL
    })
  );
});
		
*/
