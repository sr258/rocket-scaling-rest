var program = require('commander');
var common = require('./common');
var PromisePool = require('es6-promise-pool')

var currentNr = 0;
var globalClient;
var stopNr;

var promiseProducer = function () {
  if (currentNr < stopNr) {
    currentNr++;
    console.log("Creating promise for " + "username" + currentNr + " stopping @ " + stopNr);
    return common.createUser(globalClient, "username" + currentNr);    
  }
  else {
    return null;
  }
}

async function addUsers(url, username, password, port, nr) {
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);

  globalClient = client;
  currentNr = 0;
  stopNr = nr;

  var pool = new PromisePool(promiseProducer, 5)
  var poolPromise = pool.start();
  poolPromise.then(function () {
    console.log("all done!");
    process.exit();
  }, function (error) {
    console.log("there was an error: " + error.message);
    process.exit();
  })

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

