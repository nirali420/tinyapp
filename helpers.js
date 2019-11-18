// FIND USER BY EMAIL ID
const getUserByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return "";
};

// GENERATE RANDOM STRING
const generateRandomString = function() {
  return Math.random()
    .toString(30)
    .substring(2, 8);
};

// FINDS URL LIST OF THE LOGGED IN USER
const urlsForUser = function(id, database) {
  let userURL = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userURL[url] = database[url];
    }
  }
  return userURL;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
