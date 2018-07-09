var program = require('commander');
var common = require('./common');
var PromisePool = require('es6-promise-pool')
const { performance } = require('perf_hooks');

var readmode = false;
var currentNr = 0;
var globalClient;
var stopNr;
var roomId;

var promiseProducer = function () {
  if (currentNr < stopNr) {
    currentNr++;
    return common.sendMessage(globalClient, roomId, currentNr, currentNr + ": " + randomString(150));
  }
  else {
    return null;
  }
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sendMessages(url, username, password, port, nr, roomname, usersnr, concurrencyLevel, readevery, readcount) {
  if (readevery && readcount) {
    readmode = true;
  }

  let startTime = performance.now();
  console.log('logging in to ' + url + ' as ' + username);
  let client = await common.login(url, username, password, port);

  let userlist = [];
  for (let c = 1; c <= usersnr; c++) {
    userlist.push("user" + c);
  }

  console.log('creating room ' + roomname + 'with users:');
  console.log(userlist);
  var roomInfo = await common.createGroup(client, roomname, userlist);

  roomId = roomInfo.group._id;
  globalClient = client;
  currentNr = 0;
  stopNr = nr;

  var pool = new PromisePool(promiseProducer, concurrencyLevel)
  pool.addEventListener('fulfilled', function (event) {
    if (readmode) {
      if (event.data.result.nr % readevery === 0) {
        common.getGroupHistory(client, roomId, readcount).then(ret => {
          console.log(event.data.result.nr + ";" + Math.round(ret.start) + ";" + Math.round(ret.end) + ";" + Math.round(ret.end - ret.start));
        });        
      }
    }
    else {
      console.log(event.data.result.nr + ";" + Math.round(event.data.result.start) + ";" + Math.round(event.data.result.end) + ";" + Math.round(event.data.result.end - event.data.result.start));
    }
  });
  var poolPromise = pool.start();
  poolPromise.then(function () {
    console.log("all done!");
    let endTime = performance.now();
    console.log("sending " + nr + " messages took " + (endTime - startTime) + " ms. That's " + (endTime - startTime) / nr + " ms/message.");
    process.exit();
  }, function (error) {
    console.log("There was an error: " + error.message);
    console.log(error);
    process.exit();
  })
}

program
  .option('-u, --username <username>', 'admin user name')
  .option('-p, --password <password>', 'admin password')
  .option('-s, --server <server>', 'server URL')
  .option('-o, --port <port>', 'port number')
  .option('-c, --concurrency <concurrency>', 'how many requests should be sent at once')
  .option('-r, --readevery <readevery>', 'after how many sent messages read operations should take place')
  .option('-n, --readcount <readcount>', 'how many messages should be requested when reading')
  .action(function (roomname, usersnr, nr, cmd) {
    console.log('sending ' + nr + ' messages. ' + program.concurrency + ' requests at once');
    if (program.readevery && program.readcount) {
      console.log('in read measurement mode: reading ' + program.readcount + ' messages after every ' + program.readevery + ' sent messages.');
    }

    sendMessages(program.server, program.username, program.password, parseInt(program.port), parseInt(nr), roomname, parseInt(usersnr), parseInt(program.concurrency), parseInt(program.readevery), parseInt(program.readcount));
  })
  .parse(process.argv);

