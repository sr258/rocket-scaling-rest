var program = require('commander');
var common = require('./common');
var PromisePool = require('es6-promise-pool')
const { performance } = require('perf_hooks');

var currentNr = 0;
var globalClient;
var stopNr;

var promiseProducer = function () {
  if (currentNr < stopNr) {
    currentNr++;
    console.log("Creating promise for " + "username" + currentNr + " stopping @ " + stopNr);
    return new Promise(async (resolve, reject) => {
      try {
        let un = "user" + currentNr;
        let userId = await common.getUserId(globalClient, un)
        var ret = await common.deleteUser(globalClient, userId);
        resolve(ret);
      }
      catch (error) {
        reject(error);
      }
    });
  }
  else {
    return null;
  }
}


async function deleteUsers(url, username, password, port, from, to, concurrencyLevel) {
  let startTime = performance.now();
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);
  if (!client)
    process.exit();

  globalClient = client;
  currentNr = from - 1;
  stopNr = to;

  var pool = new PromisePool(promiseProducer, concurrencyLevel)
  var poolPromise = pool.start();
  poolPromise.then(function () {
    console.log("all done!");
    let endTime = performance.now();
    console.log("removing " + (to - from) + " users took " + (endTime - startTime) + " ms. That's " + (endTime - startTime) / (to - from) + " ms/user.");
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
  .option('-c, --concurrency <concurrency>', 'how many requests should be sent at once')
  .action(function (from, to, cmd) {
    console.log('deleting from ' + from + ' to ' + to);
    deleteUsers(program.server, program.username, program.password, parseInt(program.port), parseInt(from), parseInt(to), parseInt(program.concurrency));
  })
  .parse(process.argv);

