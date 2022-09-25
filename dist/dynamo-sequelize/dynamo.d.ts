import { Options } from './types';
import { Sequelize } from 'sequelize';
export declare function seqSchemaToDynamoSchema(seqSchema: Options, jsonAsObject: boolean): Options;
export declare class Dynamo extends Sequelize {
    options: Options;
    constructor(options: Options);
    define(name: string, seqSchema: Options): any;
}
