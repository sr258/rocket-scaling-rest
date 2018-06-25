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
    return common.createUser(globalClient, currentNr);
  }
  else {
    return null;
  }
}

async function addUsers(url, username, password, port, start, nr, concurrencyLevel) {
  let startTime = performance.now();
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);

  globalClient = client;
  currentNr = start - 1;
  stopNr = start + nr;

  var pool = new PromisePool(promiseProducer, concurrencyLevel)
  pool.addEventListener('fulfilled', function (event) {
    console.log(event.data.result.nr + ";" + Math.round(event.data.result.start) + ";" + Math.round(event.data.result.end) + ";" + Math.round(event.data.result.end - event.data.result.start));
  });
  var poolPromise = pool.start();
  poolPromise.then(function () {
    console.log("all done!");
    let endTime = performance.now();
    console.log("adding " + nr + " users took " + (endTime - startTime) + " ms. That's " + (endTime - startTime) / nr + " ms/user.");
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
  .action(function (from, nr, cmd) {
    console.log('adding ' + nr + ' users. ' + program.concurrency + ' requests at once');
    addUsers(program.server, program.username, program.password, parseInt(program.port), parseInt(from), parseInt(nr), parseInt(program.concurrency));
  })
  .parse(process.argv);

