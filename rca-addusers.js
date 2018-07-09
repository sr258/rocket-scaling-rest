var program = require('commander');
var common = require('./common');
var ConcurrentRequester = require('./concurrent-requester');

const { performance } = require('perf_hooks');

async function addUsers(url, username, password, port, start, nr, concurrencyLevel, readcount, readevery) {
  let startTime = performance.now();

  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);

  let concurrentRequester = new ConcurrentRequester(client, start, start + nr, concurrencyLevel,
    function (cl, currentNr) { return common.createUser(cl, currentNr); },
    function (event) { console.log(event.data.result.nr + ";" + Math.round(event.data.result.start) + ";" + Math.round(event.data.result.end) + ";" + Math.round(event.data.result.end - event.data.result.start)); }
  )

  try {
    await concurrentRequester.start();
    let endTime = performance.now();
    console.log("all done!");    
    console.log("adding " + nr + " users took " + (endTime - startTime) + " ms. That's " + (endTime - startTime) / nr + " ms/user.");
    process.exit();
  } catch (error) {
    console.log("there was an error: " + error.message);
    process.exit();
  }
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
  .option('-s, --server <server>', 'server URL')
  .option('-o, --port <port>', 'port number')
  .option('-r, --readevery <readevery>', 'after how many created users search operations should take place')
  .option('-n, --readcount <readcount>', 'how many users should be searched for')
  .option('-c, --concurrency <concurrency>', 'how many requests should be sent at once')
  .action(function (from, nr, cmd) {
    console.log('adding ' + nr + ' users. ' + program.concurrency + ' requests at once');

    if (program.readevery && program.readcount) {
      console.log('in search measurement mode: searching ' + program.readcount + ' users after every ' + program.readevery + ' created users.');
    }

    addUsers(program.server, program.username, program.password, parseInt(program.port), parseInt(from), parseInt(nr), parseInt(program.concurrency), parseInt(program.readcount), parseInt(program.readevery));
  })
  .parse(process.argv);

