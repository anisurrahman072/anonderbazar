const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');

// get reference to S3 client
const s3 = new AWS.S3();

export const handler = async (event, context, callback) => {
 
   // const imagePath = await resizeHandler.process(event);
    // const URL = `http://anonderbazar.s3-ap-southeast-1.amazonaws.com`;
	
    // Read options from the event parameter.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
	
	const srcBucket = event.Records[0].s3.bucket.name;
	const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const dstBucket = "anonderbazar-medium-resized";
    const dstKey    =  srcKey;
    
	  // Infer the image type from the file suffix.
    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.log("Could not determine the image type.");
        return;
    }
	
	    // Check that the image type is supported  
    const imageType = typeMatch[1].toLowerCase();
    if (imageType != "jpg" && imageType != "png") {
        console.log(`Unsupported image type: ${imageType}`);
        return;
    }
	
	// policy: anonderbazar_image_resize
	//role: anonderbazar-lambda-s3-role
	
	    // Download the image from the S3 source bucket. 

    try {
        const params = {
            Bucket: srcBucket,
            Key: srcKey
        };
        var origimage = await s3.getObject(params).promise();

    } catch (error) {
        console.log(error);
        return;
    } 
	
	// set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
    const width  = 620;
    const height  = 413;

    // Use the Sharp module to resize the image and save in a buffer.
    try { 
        var buffer = await sharp(origimage.Body).resize({
			width,
			height,
			kernel: sharp.kernel.nearest,
			fit: 'contain',
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		}).toBuffer();
            
    } catch (error) {
        console.log(error);
        return;
    } 
	
	  // Upload the thumbnail image to the destination bucket
    try {
        const destparams = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: buffer,
            ContentType: "image"
        };

        const putResult = await s3.putObject(destparams).promise(); 
        
    } catch (error) {
        console.log(error);
        return;
    } 
        
    console.log('Successfully resized ' + srcBucket + '/' + srcKey +
        ' and uploaded to ' + dstBucket + '/' + dstKey); 
		
 
};
