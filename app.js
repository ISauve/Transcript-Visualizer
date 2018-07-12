let utils = require('./utils'),
    fs = require('fs'),
    PDFParser = require("pdf2json"),
    readline = require('readline');

var pdfParser = new PDFParser(this,1);
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFile("transcript.txt", pdfParser.getRawTextContent(), (err) => {
        if (err) throw err;
        console.log('Sucessfully read input pdf');

        processTranscript("transcript.txt", "public/data.csv").then(function(result) {
            console.log('Successfully processed transcript data');
            utils.serveAndOpenWebPage();
        }, function(err) {
            console.log(err);
        })
    });
});

// Determine which transcript to read based on command line arg
var filename = "SSR_TSRPT.pdf";
var CLargs = process.argv.slice(2);
if (CLargs.length == 1) filename = CLargs[0];

pdfParser.loadPDF(filename);


/****************** Helper ******************/

// Takes an input text file of a parsed transcript & generates a formatted CSV file
function processTranscript(pathIn, pathOut) {
    return new Promise((resolve, reject) => {
        var data = [];
        var nodes = ['Subject,'];

        var lineReader = readline.createInterface({
          input: fs.createReadStream(pathIn)
        });
        var extract = false;

        // Read each line one by one, extracting data from the lines with course info
        lineReader.on('line', function (line) {
            if (line == "CourseDescriptionAttemptedEarnedGrade")  extract = true;
            else if (line == "In GPAEarned")                      extract = false;
            else if (extract) {
                if (!utils.hasNumber(line) ||         // Skip designations
                    !utils.isLetter(line.charAt(0)))  // Skip erroneous lines
                    return;

                var courseData = utils.extractData(line);
                utils.processCourseData(data, nodes, courseData);
            };
        }).on('close', function() {
            data = data.concat(nodes);
            data.sort();
            data.unshift('id,value');

            fs.writeFile(pathOut, data.join("\n"), function (err) {
              if (err) reject(err);
              resolve();
            });
        })
    });
}
