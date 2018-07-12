
var SUBJECTS = {
    "Math.": {
      "Stats.":            ["STAT", "NE115"],
      "Linear Algebra.":   ["MATH136", "MATH235", "NE112"],
      "Algebra.":          ["MATH135"],
      "Calculus.":         ["MATH117", "MATH119", "MATH137", "MATH138", "MATH213", "MATH237"],
      "CO.":               ["CO", "MATH239"],
      "ActSci.":           ["ACTSC"],
      "Other.":            ["AMATH", "MATBUS", "PMATH"]
    },
    "CS.":                   ["CS", "SE", "NE111", "NE113", "ECE150", "ECE124", "ECE222"],
    "Science.": {
      "Chem.":             ["CHEM", "NE121", "NE122", "NE125"],
      "Physics.":          ["PHYS", "NE131", "ECE106", "ECE140"],
    },
    "Humanities.":           ["AFM", "ECON", "MSCI", "WS", "ENGL", "PD", "BUS", "COMM", "HRM"]
};

module.exports = {
    isLetter: function(c) {
        return c.length == 1 && c.match(/[a-z]/i);
    },

    hasNumber: function(s) {
        return /\d/.test(s);
    },

    extractData: function(line) {
        var data = new Object();

        // Course abbreviation & code are separated by a double space
        var i = line.indexOf("  ");
        data.abbrev = line.substring(0, i);
        line = line.substr(i+2);

        var j = 0;
        data.code = "";
        while ( !this.isLetter(line.charAt(j)) && j <= line.length ) {
            data.code += line.charAt(j);
            j++;
        }
        line = line.substr(j);

        data.grade = line.substr(line.length - 2);
        data.name = line.substring(0, line.length - 10);
        data.courseInfo = data.abbrev + data.code + ": " + data.name + "," + data.grade;

        return data;
    },

    processCourseData: function(data, nodes, cd) {
        var prefix = 'Subject.';

        // Try to match either the course to a subject
        for (var key in SUBJECTS) {
            var value = SUBJECTS[key];
            if (value.constructor == Array) { // if the subject has no sub-subjects
                if (value.indexOf(cd.abbrev) >= 0 || value.indexOf(cd.abbrev + cd.code) >= 0) {
                    // Add node if not already present
                    var node = prefix + key;
                    node = node.substring(0, node.length-1) + ",";
                    if (nodes.indexOf(node) == -1) nodes.push(node);

                    data.push(prefix + key + cd.courseInfo);
                    return;
              }
            } else {    // subject has sub-subjects
                for (var subKey in value) {
                    var subValue = value[subKey];
                    if (subValue.indexOf(cd.abbrev) >= 0 || subValue.indexOf(cd.abbrev + cd.code) >= 0){
                        // Add node(s) if not already present
                        var node = prefix + key;
                        node = node.substring(0, node.length-1) + ",";
                        if (nodes.indexOf(node) == -1) nodes.push(node);
                        node = prefix + key + subKey;
                        node = node.substring(0, node.length-1) + ",";
                        if (nodes.indexOf(node) == -1) nodes.push(node);

                        data.push(prefix + key + subKey + cd.courseInfo);
                        return;
                    }
                }
            }
        };

        // Course did not match any of the subjects
        console.log("Unable to classify " + cd.abbrev + cd.code)
    },

    serveAndOpenWebPage: function() {
        var http = require('http'),
            opn = require('opn'),
            nocache = require('nocache'),
            express = require('express');

        var app = express();
        app.use(express.static('./public'));
        app.use(nocache());
        var server = http.createServer(app).listen(8080, function () {
            console.log('Server is running using express.js');
        });

        opn('http://localhost:8080/');
    }
};
