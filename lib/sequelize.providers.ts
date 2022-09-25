import { Provider } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DynamoSequelizeOptions } from './interfaces/sequelize-options.interface';
import { getConnectionToken, getModelToken } from './common/sequelize.utils';

export function createSequelizeProviders(
  entities?: Function[],
  connection?: DynamoSequelizeOptions | string,
): Provider[] {
  const repositories = (entities || []).map((entity) => ({
    provide: getModelToken(entity, connection),
    useFactory: (connection: Sequelize) => {
      if (!connection.repositoryMode) {
        return entity;
      }
      return connection.getRepository(entity as any);
    },
    inject: [getConnectionToken(connection)],
  }));

  return [...repositories];
}
