#!/usr/bin/env node
"use strict";

var program = require('commander');

program
  .command('addusers <from> <nr>', 'add users')  
  .command('deleteusers <from> <to>', 'delete users');

program.parse(process.argv);
