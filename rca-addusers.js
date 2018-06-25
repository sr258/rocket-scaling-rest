var program = require('commander');
var common = require('./common');

async function addUsers(url, username, password, port, nr) {
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);
  for (let counter = 0; counter < nr; counter++) {
    let ret = await common.createUser(client, "username" + counter);
    console.log("Created user " + "username" + counter);
  }
  process.exit();
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
  .option('-s, --server <server>', 'server URL')
  .option('-o, --port <port>', 'port number')
  .action(function (nr, cmd) {
    console.log('adding ' + nr + ' users');
    addUsers(program.server, program.username, program.password, parseInt(program.port), nr);
  })
  .parse(process.argv);

