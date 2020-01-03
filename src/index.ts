import {Readable, PassThrough, Transform} from "stream";
const JSONStream:{stringify: (open?: string, sep?: string, close?: string) => Transform} = require('JSONStream');
const csv = require("csv") as {stringify: (options?: any) => Transform};

export function to_json(recordsetStream: Readable) {
    const stringifier = JSONStream.stringify("[", ",", "]");
    recordsetStream.on("error", (err) => {  // propagate the error downstream
        stringifier.emit("error", err);
    });
    return recordsetStream.pipe(stringifier) as Readable;
}

// create a readable stream that emits both column headers and rows as array of strings 
function createStringArrayStream(recordsetStream: Readable) {
    let columnHeaders: string[] = null;
    const pt = new PassThrough({objectMode: true});
    recordsetStream.once("data", (chunk) => {
        columnHeaders = [];
        for (const key of Object.keys(chunk)) {
            columnHeaders.push(key);
        }
        pt.write(columnHeaders);
    }).on("data", (chunk) => {
        const ret: string[] = [];
        for (const field of columnHeaders) {
            let value = chunk[field];
            if (value === null || value === undefined)
                value = "";
            else if (value instanceof Date) {
                value = (value as Date).toISOString();
            } else {
                value = (value as Object).toString();
            }
            ret.push(value as string);
        }
        pt.write(ret);
    }).on("end", () => {
        pt.end();
    }).on("error", (err) => {
        pt.emit("error", err);  // propagate the error downstream
    });
    return pt as Readable;
}

export function to_csv(recordsetStream: Readable) {
    const sas = createStringArrayStream(recordsetStream);
    const stringifier = csv.stringify();
    sas.on("error", (err) => {  // propagate the error downstream
        stringifier.emit("error", err);
    });
    return sas.pipe(stringifier) as Readable;
}
