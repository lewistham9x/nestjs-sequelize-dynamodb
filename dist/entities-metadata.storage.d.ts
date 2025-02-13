import { SequelizeModuleOptions } from './interfaces';
declare type ConnectionToken = SequelizeModuleOptions | string;
export declare class EntitiesMetadataStorage {
    private static readonly storage;
    static addEntitiesByConnection(connection: ConnectionToken, entities: Function[]): void;
    static getEntitiesByConnection(connection: ConnectionToken): Function[];
}
export {};
