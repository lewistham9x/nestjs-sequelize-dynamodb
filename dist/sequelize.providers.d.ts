import { Provider } from '@nestjs/common';
import { DynamoSequelizeOptions } from './interfaces/sequelize-options.interface';
export declare function createSequelizeProviders(entities?: Function[], connection?: DynamoSequelizeOptions | string): Provider[];
