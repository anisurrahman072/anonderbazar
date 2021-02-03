const fs = require('fs');
let writer = fs.createWriteStream('test_gfg.txt')
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.write('Hi There ');
writer.end();
