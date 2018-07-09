#!/usr/bin/env node
"use strict";

var program = require('commander');

program
  .command('addusers <from> <nr>', 'add users')  
  .command('deleteusers <from> <to>', 'delete users')
  .command('sendmessages <roomname> <usersnr> <number>', 'send the number of messages in a newly created chat room'); 

program.parse(process.argv);
