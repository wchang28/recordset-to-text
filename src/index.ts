import {Readable, PassThrough, Transform} from "stream";
const JSONStream:{stringify: (open?: string, sep?: string, close?: string) => Transform} = require('JSONStream');
const csv = require("csv") as {stringify: (options?: any) => Transform};
const csv_stringify = csv.stringify;

export function to_json(recordsetStream: Readable) {
    return recordsetStream.pipe(JSONStream.stringify("[", "", "]")) as Readable;
}

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
    });
    return pt as Readable;
}

export function to_csv(recordsetStream: Readable) {
    return createStringArrayStream(recordsetStream).pipe(csv_stringify()) as Readable;
}
