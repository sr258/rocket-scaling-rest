var program = require('commander');
var common = require('./common');

async function deleteUsers(url, username, password, port, from, to) {
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);
  if(!client)  
    process.exit();
  for (let counter = from; counter <= to; counter++) {
    let un = "username" + counter;
    let userId = await common.getUserId(client, un)
    let ret = await common.deleteUser(client, userId);
    console.log("deleted user " + un);
  }
  process.exit();
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
  .option('-s, --server <server>', 'server URL')
  .option('-o, --port <port>', 'port number')
  .action(function (from, to, cmd) {
    console.log('deleting from ' + from + ' to ' + to);
    deleteUsers(program.server, program.username, program.password, parseInt(program.port), parseInt(from), parseInt(to));
  })
  .parse(process.argv);

