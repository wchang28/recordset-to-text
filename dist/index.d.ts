/// <reference types="node" />
import { Readable } from "stream";
export declare function to_json(recordsetStream: Readable): Readable;
export declare function to_csv(recordsetStream: Readable): Readable;
