const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');

// get reference to S3 client
const s3 = new AWS.S3();

exports.handler = async (event, context) => {

  // const imagePath = await resizeHandler.process(event);
  // const URL = `http://anonderbazar.s3-ap-southeast-1.amazonaws.com`;

  // Read options from the event parameter.
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  const destinationBuckets = [
    {
      backet: "anonderbazar-list-sized-images",
      dimension: 250
    },
    {
      backet: "anonderbazar-thumb-images",
      dimension: 50
    },
    {
      backet: "anonderbazar-original-resized",
      dimension: 640
    }
  ];

  const dstKey = srcKey;

  console.log('srcKey', srcKey);
  console.log('srcBucket', srcBucket);

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  console.log('typeMatch', typeMatch);

  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return 0;
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  console.log('imageType', imageType);

  if (imageType !== "jpeg" && imageType !== "jpg" && imageType !== "png" && imageType !== "webp") {
    console.log(`Unsupported image type: ${imageType}`);
    return 0;
  }

  // Download the image from the S3 source bucket.

  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey
    };
    var origimage = await s3.getObject(params).promise();

  } catch (error) {
    console.log(error);
    return 0;
  }

  const len = destinationBuckets.length;

  for (let i = 0; i < len; i++) {

    const destinationBucket = destinationBuckets[i].backet;
    let desiredDimension = destinationBuckets[i].dimension;

    try {
      const sharpImageObject = sharp(origimage.Body);
      const metadata = await sharpImageObject.metadata();

      if (destinationBucket === 'anonderbazar-original-resized') {
        if(metadata.width < metadata.height){
          desiredDimension = metadata.height;
        } else {
          desiredDimension = metadata.width;
        }
      }

      const imageBuffer = await sharpImageObject
        .resize({
          width: desiredDimension,
          height: desiredDimension,
          kernel: sharp.kernel.nearest,
          fit: 'contain',
          background: {r: 255, g: 255, b: 255, alpha: 1}
        })
        .toBuffer();

      const destinationParams = {
        Bucket: destinationBucket,
        Key: dstKey,
        Body: imageBuffer,
        ContentType: "image"
      };

      const putResult = await s3.putObject(destinationParams).promise();

    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  console.log('Successfully resized ' + srcBucket + '/' + srcKey + ' and uploaded to ' + dstBucket + '/' + dstKey);

  return 1;
};
