"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var SequelizeCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequelizeCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const dynamo_1 = require("./dynamo-sequelize/dynamo");
const sequelize_utils_1 = require("./common/sequelize.utils");
const entities_metadata_storage_1 = require("./entities-metadata.storage");
const sequelize_constants_1 = require("./sequelize.constants");
let SequelizeCoreModule = SequelizeCoreModule_1 = class SequelizeCoreModule {
    constructor(options, moduleRef) {
        this.options = options;
        this.moduleRef = moduleRef;
    }
    static forRoot(options = {}) {
        const sequelizeModuleOptions = {
            provide: sequelize_constants_1.SEQUELIZE_MODULE_OPTIONS,
            useValue: options,
        };
        const connectionProvider = {
            provide: (0, sequelize_utils_1.getConnectionToken)(options),
            useFactory: () => __awaiter(this, void 0, void 0, function* () { return yield this.createConnectionFactory(options); }),
        };
        return {
            module: SequelizeCoreModule_1,
            providers: [connectionProvider, sequelizeModuleOptions],
            exports: [connectionProvider],
        };
    }
    static forRootAsync(options) {
        const connectionProvider = {
            provide: (0, sequelize_utils_1.getConnectionToken)(options),
            useFactory: (sequelizeOptions) => __awaiter(this, void 0, void 0, function* () {
                if (options.name) {
                    return yield this.createConnectionFactory(Object.assign(Object.assign({}, sequelizeOptions), { name: options.name }));
                }
                return yield this.createConnectionFactory(sequelizeOptions);
            }),
            inject: [sequelize_constants_1.SEQUELIZE_MODULE_OPTIONS],
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: SequelizeCoreModule_1,
            imports: options.imports,
            providers: [
                ...asyncProviders,
                connectionProvider,
                {
                    provide: sequelize_constants_1.SEQUELIZE_MODULE_ID,
                    useValue: (0, sequelize_utils_1.generateString)(),
                },
            ],
            exports: [connectionProvider],
        };
    }
    onApplicationShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.moduleRef.get((0, sequelize_utils_1.getConnectionToken)(this.options));
            connection && (yield connection.close());
        });
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: sequelize_constants_1.SEQUELIZE_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        const inject = [
            (options.useClass ||
                options.useExisting),
        ];
        return {
            provide: sequelize_constants_1.SEQUELIZE_MODULE_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createSequelizeOptions(options.name); }),
            inject,
        };
    }
    static createConnectionFactory(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, rxjs_1.lastValueFrom)((0, rxjs_1.defer)(() => __awaiter(this, void 0, void 0, function* () {
                const sequelize = new dynamo_1.Dynamo(options);
                if (!options.autoLoadModels) {
                    return sequelize;
                }
                const connectionToken = options.name || sequelize_constants_1.DEFAULT_CONNECTION_NAME;
                const models = entities_metadata_storage_1.EntitiesMetadataStorage.getEntitiesByConnection(connectionToken);
                yield sequelize.authenticate();
                if (typeof options.synchronize === 'undefined' || options.synchronize) {
                    yield sequelize.sync(options.sync);
                }
                return sequelize;
            })).pipe((0, sequelize_utils_1.handleRetry)(options.retryAttempts, options.retryDelay)));
        });
    }
};
SequelizeCoreModule = SequelizeCoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({}),
    __param(0, (0, common_1.Inject)(sequelize_constants_1.SEQUELIZE_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object, core_1.ModuleRef])
], SequelizeCoreModule);
exports.SequelizeCoreModule = SequelizeCoreModule;
