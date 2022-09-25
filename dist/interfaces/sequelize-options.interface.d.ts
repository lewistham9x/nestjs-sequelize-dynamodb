import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Options } from 'sequelize';
export interface DynamoSequelizeOptions extends Omit<Options, 'dialect'> {
    dialect?: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'dynamo' | 'dynamodb';
}
export declare type SequelizeModuleOptions = {
    name?: string;
    retryAttempts?: number;
    retryDelay?: number;
    autoLoadModels?: boolean;
    synchronize?: boolean;
    uri?: string;
} & Partial<DynamoSequelizeOptions>;
export interface SequelizeOptionsFactory {
    createSequelizeOptions(connectionName?: string): Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
}
export interface SequelizeModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    useExisting?: Type<SequelizeOptionsFactory>;
    useClass?: Type<SequelizeOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
    inject?: any[];
}
