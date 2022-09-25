import { DynamicModule } from '@nestjs/common';
import { DynamoSequelizeOptions } from './interfaces/sequelize-options.interface';
import { SequelizeModuleAsyncOptions, SequelizeModuleOptions } from './interfaces/sequelize-options.interface';
export declare class SequelizeModule {
    static forRoot(options: SequelizeModuleOptions): DynamicModule;
    static forFeature(entities?: Function[], connection?: DynamoSequelizeOptions | string): DynamicModule;
    static forRootAsync(options: SequelizeModuleAsyncOptions): DynamicModule;
}
