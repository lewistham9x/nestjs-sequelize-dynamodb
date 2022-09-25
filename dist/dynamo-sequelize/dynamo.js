"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dynamo = exports.seqSchemaToDynamoSchema = void 0;
const model_1 = __importDefault(require("./model"));
const dynamoose_1 = __importStar(require("dynamoose"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const sequelize_1 = require("sequelize");
const config = {
    throughput: {
        read: 1,
        write: 1,
    },
};
if (process.env.DYNAMODB_TABLE_PREFIX !== undefined) {
    config.prefix = process.env.DYNAMODB_TABLE_PREFIX;
}
if (process.env.DYNAMODB_READ !== undefined) {
    config.throughput.read = process.env.DYNAMODB_READ;
}
if (process.env.DYNAMODB_WRITE !== undefined) {
    config.throughput.write = process.env.DYNAMODB_WRITE;
}
dynamoose_1.default.model.defaults.set(config);
if (process.env.DYNAMODB_LOCALHOST) {
    dynamoose_1.default.aws.ddb.local(process.env.DYNAMODB_LOCALHOST);
}
function typeMapper(type, key, jsonAsObject) {
    const stringType = type.toString();
    switch (stringType) {
        case 'STRING':
        case 'TEXT':
            return String;
        case 'JSONTYPE': {
            if (jsonAsObject) {
                return [Object, Array];
            }
            return String;
        }
        case 'BOOLEAN':
            return Boolean;
        case 'INTEGER':
        case 'BIGINT':
        case 'FLOAT':
        case 'DECIMAL':
        case 'DOUBLE':
            return Number;
        case 'DATE':
            return Date;
        default:
            throw new Error(`do not support type ${type} for key: ${key}`);
    }
}
function seqSchemaToDynamoSchema(seqSchema, jsonAsObject) {
    const keys = Object.keys(seqSchema);
    return keys.reduce((prev, k) => {
        const v = seqSchema[k];
        const originalType = v.type.toString();
        const type = typeMapper(originalType, k, jsonAsObject);
        const def = {
            type,
        };
        if (type === Date) {
            def.get = function (v) {
                return new Date(v);
            };
            def.set = function (v) {
                return new Date(v).getTime();
            };
        }
        else if (!jsonAsObject && originalType === 'JSONTYPE') {
            prev.jsonTypes[k] = 1;
        }
        if (v.primaryKey) {
            v.hashKey = true;
        }
        if (v.required) {
            v.required = true;
        }
        if (v.defaultValue !== undefined) {
            def.default = v.defaultValue;
        }
        prev.config[k] = def;
        return prev;
    }, {
        config: {},
        jsonTypes: {},
    });
}
exports.seqSchemaToDynamoSchema = seqSchemaToDynamoSchema;
class Dynamo extends sequelize_1.Sequelize {
    constructor(options) {
        super(options);
        this.options = options;
    }
    define(name, seqSchema) {
        const jsonAsObject = (0, lodash_get_1.default)(this.options, 'define.jsonAsObject') || false;
        const { config, jsonTypes } = seqSchemaToDynamoSchema(seqSchema, jsonAsObject);
        const sc = new dynamoose_1.Schema(config, {
            saveUnknown: (0, lodash_get_1.default)(this.options, 'define.saveUnknown') || true,
            timestamps: (0, lodash_get_1.default)(this.options, 'define.timestamps'),
        });
        const model = dynamoose_1.default.model(name, sc);
        return (0, model_1.default)(model, jsonTypes);
    }
}
exports.Dynamo = Dynamo;
