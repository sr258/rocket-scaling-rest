var RocketChatClient = require('rocketchat').RocketChatClient;
const { performance } = require('perf_hooks');

async function createUser(client, nr) {
  let startTime = performance.now();
  var userName = "user" + nr;
  var userToAdd = {
    "name": userName,
    "email": userName + "@example.com",
    "password": "anypassyouwant",
    "username": userName,
    "sendWelcomeEmail": false,
    "joinDefaultChannels": false,
    "verified": true,
    "requirePasswordChange": false,
    "roles": ["user"]
  };
  return new Promise(function (resolve, reject) {
    client.users.create(userToAdd, function (err, body) {
      if (err)
        reject();
      else {
        let endTime = performance.now();
        resolve({ nr: nr, start: startTime, end: endTime });
      }
    });
  });
}

async function deleteUser(client, id) {
  return new Promise(function (resolve, reject) {
    client.users.delete(id, function (err, body) {
      if (err)
        reject();
      else
        resolve(body);
    });
  });
}

async function getUserId(client, username) {
  return new Promise(function (resolve, reject) {
    client.users.info({ username: username }, function (err, body) {
      if (err)
        reject();
      else
        resolve(body.user._id);
    });
  });
}

async function login(url, username, password, port) {
  return new Promise(function (resolve, reject) {
    let client = new RocketChatClient('http', url, port, username, password, async function (err, body) {
      if (err)
        reject();
      else
        resolve(client);
    });
  });
}

exports.createUser = createUser;
exports.deleteUser = deleteUser;
exports.login = login;
exports.getUserId = getUserId;