const sharp = require('sharp');
const fs = require('fs');

const configurations = [
  {
    directory: '/home/ubuntu/anonderbazar-list-sized-s3/images',
    backet: "anonderbazar-list-sized-images",
    dimension: 250,
    existCount: 0,
    errorCount: 0,
    successCount: 0
  },
  {
    directory: '/home/ubuntu/anonderbazar-thumb-images-s3/images',
    backet: "anonderbazar-thumb-images",
    dimension: 50,
    existCount: 0,
    errorCount: 0,
    successCount: 0
  },
  {
    directory: '/home/ubuntu/anonderbazar-original-resized-s3/images',
    backet: "anonderbazar-original-resized",
    dimension: 640,
    existCount: 0,
    errorCount: 0,
    successCount: 0
  }
];

const sourceDirectory = '/home/ubuntu/anonderbazar-s3-mounted/images';

configurations[0].existingFiles = fs.readdirSync('/home/ubuntu/anonderbazar-list-sized-s3/images');
configurations[1].existingFiles = fs.readdirSync('/home/ubuntu/anonderbazar-thumb-images-s3/images');
configurations[2].existingFiles = fs.readdirSync('/home/ubuntu/anonderbazar-original-resized-s3/images');

let writer = fs.createWriteStream('image-resize-log.txt')

console.log('read done');
writer.write('read done');

fs.readdir(sourceDirectory, (err, files) => {
  const len = files.length;
  const configLen = configurations.length;

  const allPromises = [];
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < configLen; j++) {
      if (configurations[j].existingFiles.indexOf(files[i]) !== -1) {
        configurations[j].existCount++;
        continue;
      }

      allPromises.push(sharp(sourceDirectory + '/' + files[i])
        .resize({
          width: configurations[j].dimension,
          height: configurations[j].dimension,
          kernel: sharp.kernel.nearest,
          fit: 'contain',
          background: {r: 255, g: 255, b: 255, alpha: 1}
        })
        .toFile(configurations[j].directory + '/' + files[i])
        .then(() => {
          configurations[j].successCount++;
          return true;
        })
        .catch((erratic) => {

          configurations[j].errorCount++;
          console.log('error - ' + files[i]);
          console.log(erratic);
          writer.write('error - ' + files[i] + "\n\r");
          writer.write(erratic,  "\n\r");
          return false;

        }));
    }
  }

  Promise.all(allPromises)
    .then((res) => {
      console.log('Source File Count: ' + len);
      writer.write('Source File Count: ' + len + "\n\r");
      console.log('list: exists: ' + configurations[0].existCount + ' success: ' + configurations[0].successCount + ' error: ' + configurations[0].errorCount);
      writer.write('list: exists: ' + configurations[0].existCount + ' success: ' + configurations[0].successCount + ' error: ' + configurations[0].errorCount + "\n\r");
      console.log('thumb: exists: ' + configurations[1].existCount + ' success: ' + configurations[1].successCount + ' error: ' + configurations[1].errorCount);
      writer.write('thumb: exists: ' + configurations[1].existCount + ' success: ' + configurations[1].successCount + ' error: ' + configurations[1].errorCount + "\n\r");
      console.log('original: exists: ' + configurations[2].existCount + ' success: ' + configurations[2].successCount + ' error: ' + configurations[2].errorCount);
      writer.write('original: exists: ' + configurations[2].existCount + ' success: ' + configurations[2].successCount + ' error: ' + configurations[2].errorCount + "\n\r");
      writer.end();
    })
    .catch(err => {
      console.log('err', err);
      writer.end();
    })

});

