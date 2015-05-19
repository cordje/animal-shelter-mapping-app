var express = require('express');
var config = require('config');
var aws = require('aws-sdk');
var s3Info = config.get('S3Info');
var router = express.Router();
var xlsx = require('node-xlsx');


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Express',
        configVal: config.get('S3Info')
    });
});


/* GET file */
router.get('/file', function(req, res){

    // our S3 bucket
    var s3bucket = new aws.S3();

    // store buffers
    var buffers = [];

    // get excel doc from bucket using name and key info
    s3bucket.getObject({Bucket: s3Info.BucketName, Key: s3Info.ExcelFileName})

        // push chunks to 'buffers' array above as they come in
        .on('httpData', function(chunk) { buffers.push(chunk); })

        // on completion
        .on('httpDone', function() {

            // concatenate buffers
            var buffer = Buffer.concat(buffers);

            // we are working from an xlsx doc, so parse the data so that we can work with JSON
            var workbook = xlsx.parse(buffer);

            // write the JSON formatted data from bucket to the response
            res.write(JSON.stringify({data: workbook[0].data}));

            // end our response
            res.end();

        // and send it
        }).send();
});

module.exports = router;
