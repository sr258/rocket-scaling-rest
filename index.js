#!/usr/bin/env node
var program = require('commander');
var RocketChatApi = require('rocketchat').RocketChatApi;

function login(url, username, password, port) {
  console.log('logging in to ' + url + ' as username: ' + program.username);
  var api = new RocketChatApi('http', url, port, username, password, function(err, body) {
		api.version(function(err,body) { console.log(body); });
	});
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
	.option('-s, --server <server>', 'server URL')
	.option('-p, --port <port>', 'port number')
  .command('addusers <nr>')
  .action(function (nr, cmd) {
  	console.log('adding ' + nr + ' users');
		login(program.server, program.username, program.password, parseInt(program.port));
  });

program.parse(process.argv);
