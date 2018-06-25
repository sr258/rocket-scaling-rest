#!/usr/bin/env node
var program = require('commander');

// direct access to new api
var RocketChatClient = require('rocketchat').RocketChatClient;

function login(url, username, password, port) {
  console.log('logging in to ' + url + ' as username: ' + program.username);
  var client = new RocketChatClient('http', url, port, username, password, function (err, body) {
    client.authentication.me(function (err, body) {
      console.log(body);
      process.exit();
    });
  });
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
  .option('-s, --server <server>', 'server URL')
  .option('-o, --port <port>', 'port number')
  .command('addusers <nr>')
  .action(function (nr, cmd) {
    console.log('adding ' + nr + ' users');
    login(program.server, program.username, program.password, parseInt(program.port));
  });

program.parse(process.argv);
