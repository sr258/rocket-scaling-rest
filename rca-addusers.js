var program = require('commander');
var common = require('./common');
var ConcurrentRequester = require('./concurrent-requester');

const { performance } = require('perf_hooks');

async function addUsers(url, username, password, port, start, nr, concurrencyLevel, readcount, readevery) {
  let readMode = false;
  if (readcount && readevery) {
    readMode = true;
  }

  let startTime = performance.now();

  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);

  let stopAt = start + nr;
  if (readMode)
    stopAt = start + readevery;

  try {
    do {
      let concurrentRequester = new ConcurrentRequester(client, start, stopAt, concurrencyLevel,
        function (cl, currentNr) { return common.createUser(cl, currentNr); },
        function (event) { if (!readMode) console.log(event.data.result.nr + ";" + Math.round(event.data.result.start) + ";" + Math.round(event.data.result.end) + ";" + Math.round(event.data.result.end - event.data.result.start)); }
      )
      await concurrentRequester.start();
      if (readMode === true) {
        let totalLength = 0;
        let totalCount = 0;
        let concurrentRequesterRead = new ConcurrentRequester(client, 1, readcount, concurrencyLevel,
          function (cl, currentNr) { return common.findUser(cl, 'user' + Math.round((stopAt / readcount) * currentNr)); },
          (event) => {
            totalLength += Math.round(event.data.result.end - event.data.result.start);
            totalCount++;
          }
        )
        await concurrentRequesterRead.start();
        console.log(stopAt + ";" + Math.round(totalLength / totalCount));
      }
      start = stopAt + 1;
      stopAt += readevery;
    }
    while (readMode === true && stopAt <= nr);

    let endTime = performance.now();
    console.log("all done!");
    console.log("adding " + nr + " users took " + (endTime - startTime) + " ms. That's " + (endTime - startTime) / nr + " ms/user.");
    process.exit();
  } catch (error) {
    console.log("there was an error: " + error.message);
    console.log(error);
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

