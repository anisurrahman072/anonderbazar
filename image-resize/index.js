const sharp = require('sharp');
const fs = require('fs');

const sourceDirectory = '/home/ubuntu/anonderbazar-s3-mounted';
const destinationDirectory = '/home/ubuntu/anonderbazar-medium-resized-s3-mounted';

const desiredWidth = 620;
const desiredHeight = 413;

/*
fs.readdir(sourceDirectory, (err, files) => {
  files.forEach(async (file) => {
    try {
      var buffer = await sharp(origimage.Body).resize({
        width,
        height,
        kernel: sharp.kernel.nearest,
        fit: 'contain',
        background: {r: 255, g: 255, b: 255, alpha: 1}
      }).toBuffer();

    } catch (error) {
      console.log(error);
      return 0;
    }
  });
});
*/


sharp('/home/ubuntu/anonderbazar-s3-mounted/002eb8d8-d3f0-491c-81f8-ba4916456797.jpg').resize({
  width: desiredWidth,
  height: desiredHeight,
  kernel: sharp.kernel.nearest,
  fit: 'contain',
  background: {r: 255, g: 255, b: 255, alpha: 1}
}).toFile('/home/ubuntu/anonderbazar-medium-resized-s3-mounted/resized-002eb8d8-d3f0-491c-81f8-ba4916456797.jpg')
  .then(info => {
    console.log(info);
  })
  .catch(err => {
    console.error(err);
  });
