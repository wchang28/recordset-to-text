"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var JSONStream = require('JSONStream');
var csv = require("csv");
function to_json(recordsetStream) {
    var stringifier = JSONStream.stringify("[", ",", "]");
    recordsetStream.on("error", function (err) {
        stringifier.emit("error", err);
    });
    return recordsetStream.pipe(stringifier);
}
exports.to_json = to_json;
// create a readable stream that emits both column headers and rows as array of strings 
function createStringArrayStream(recordsetStream) {
    var columnHeaders = null;
    var pt = new stream_1.PassThrough({ objectMode: true });
    recordsetStream.once("data", function (chunk) {
        columnHeaders = [];
        for (var _i = 0, _a = Object.keys(chunk); _i < _a.length; _i++) {
            var key = _a[_i];
            columnHeaders.push(key);
        }
        pt.write(columnHeaders);
    }).on("data", function (chunk) {
        var ret = [];
        for (var _i = 0, columnHeaders_1 = columnHeaders; _i < columnHeaders_1.length; _i++) {
            var field = columnHeaders_1[_i];
            var value = chunk[field];
            if (value === null || value === undefined)
                value = "";
            else if (value instanceof Date) {
                value = value.toISOString();
            }
            else {
                value = value.toString();
            }
            ret.push(value);
        }
        pt.write(ret);
    }).on("end", function () {
        pt.end();
    }).on("error", function (err) {
        pt.emit("error", err); // propagate the error downstream
    });
    return pt;
}
function to_csv(recordsetStream) {
    var sas = createStringArrayStream(recordsetStream);
    var stringifier = csv.stringify();
    sas.on("error", function (err) {
        stringifier.emit("error", err);
    });
    return sas.pipe(stringifier);
}
exports.to_csv = to_csv;
//# sourceMappingURL=index.js.map