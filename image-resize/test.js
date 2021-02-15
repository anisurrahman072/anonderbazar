const fs = require('fs');
let writer = fs.createWriteStream('test_gfg.txt')
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.end();

fs = require('fs')
fs.readFile('/etc/hosts', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
