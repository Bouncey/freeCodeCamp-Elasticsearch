const spawn = require('child_process').spawn;

function callInit() {
  const init = spawn('node',[`${__dirname + '/../../../'}init`]);
  init.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  init.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  init.on('exit', function (code) {
    console.log('spawned child process "node init" exited with code ' + code.toString());
  });
}

module.exports = callInit;
