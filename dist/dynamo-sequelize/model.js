"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function model(Model, jsonTypes) {
    class DynamoModel extends Model {
        constructor(inst) {
            super(inst);
        }
        static sync() { }
        static parser(obj) {
            const keys = Object.keys(DynamoModel.jsonTypes);
            for (const k of keys) {
                if (typeof obj[k] !== 'undefined') {
                    obj[k] = JSON.stringify(obj[k]);
                }
            }
            return obj;
        }
        static jsonFy(obj) {
            const keys = Object.keys(DynamoModel.jsonTypes);
            for (const k of keys) {
                if (typeof obj[k] !== 'undefined') {
                    obj[k] = JSON.parse(obj[k]);
                }
            }
            return obj;
        }
        static create(inst) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!inst) {
                    throw new Error('create requires instance object');
                }
                const obj = DynamoModel.parser(inst);
                const ist = new this(obj);
                const r = yield ist.save();
                return DynamoModel.jsonFy(new this(r));
            });
        }
        static findAll(q) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = [];
                if (q != null && q.lastKey) {
                    result.lastKey = q.lastKey;
                }
                result.queryCount = 0;
                const limit = q != null && q.limit ? q.limit : 0;
                let ok = false;
                do {
                    const scan = DynamoModel.Model.scan();
                    if (result.lastKey) {
                        scan.startAt(result.lastKey);
                    }
                    if (q != null && q.limit) {
                        scan.limit(q.limit);
                    }
                    yield scan.exec().then((r) => {
                        result.push.apply(result, r.map((x) => DynamoModel.jsonFy(new this(x))));
                        result.queryCount++;
                        if (limit && result.length >= limit) {
                            ok = true;
                        }
                        result.lastKey = r.lastKey;
                    });
                } while (!ok && result.lastKey);
                return result;
            });
        }
        static find(query, _limit) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!query || !query.where || Object.keys(query.where).length === 0) {
                    throw new Error('find requires where params');
                }
                const { op = 'eq' } = query;
                const q = Object.keys(query.where).reduce((prev, k) => {
                    prev[k] = {
                        [op]: query.where[k],
                    };
                    return prev;
                }, {});
                const result = [];
                result.queryCount = 0;
                const limit = query.limit || _limit;
                do {
                    const scan = DynamoModel.Model.scan(q);
                    if (result.lastKey) {
                        scan.startAt(result.lastKey);
                    }
                    if (limit) {
                        scan.limit(limit);
                    }
                    yield scan.exec().then((r) => {
                        result.push.apply(result, r.map((x) => DynamoModel.jsonFy(new this(x))));
                        result.queryCount++;
                        if (limit && result.length >= limit) {
                            result.lastKey = undefined;
                        }
                        else {
                            result.lastKey = r.lastKey;
                        }
                    });
                } while (result.lastKey);
                return result;
            });
        }
        static getOne(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield DynamoModel.find(query, 1);
            });
        }
        static findOne(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
                    DynamoModel.Model.get(query.where, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result ? DynamoModel.jsonFy(new this(result)) : result);
                        }
                    });
                });
            });
        }
        static findByPk(id) {
            return __awaiter(this, void 0, void 0, function* () {
                return DynamoModel.findOne({
                    where: {
                        id,
                    },
                });
            });
        }
        static batchGet(querys) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
                    DynamoModel.Model.batchGet(querys, (err, results) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(results.map((x) => DynamoModel.jsonFy(new this(x))));
                        }
                    });
                });
            });
        }
        static update(update, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
                    DynamoModel.Model.update(query.where, DynamoModel.parser(update), (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                });
            });
        }
        static destroy(query) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield new Promise((resolve, reject) => {
                    if (Array.isArray(query.where.id)) {
                        DynamoModel.Model.batchDelete(query.where.id, (err, result) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(result);
                            }
                        });
                        return;
                    }
                    DynamoModel.Model.delete(query.where, (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result || 1);
                        }
                    });
                });
            });
        }
        destroy() {
            return this.delete();
        }
        toJSON() {
            return Object.keys(this)
                .filter((k) => {
                return (typeof this[k] !== 'function' &&
                    'value' in (Object.getOwnPropertyDescriptor(this, k) || {}) !=
                        null &&
                    k !== '$__');
            })
                .reduce((prev, k) => {
                return Object.assign(Object.assign({}, prev), { [k]: this[k] });
            }, {});
        }
        save(...args) {
            const _super = Object.create(null, {
                save: { get: () => super.save }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const jsonAsStringKeys = Object.keys(DynamoModel.jsonTypes);
                if (jsonAsStringKeys.length === 0) {
                    return _super.save.call(this, ...args);
                }
                let shouldJSONStringify = false;
                for (const key of jsonAsStringKeys) {
                    if (typeof this[key] === 'object') {
                        shouldJSONStringify = true;
                        break;
                    }
                }
                if (!shouldJSONStringify) {
                    return _super.save.call(this, ...args);
                }
                DynamoModel.parser(this);
                yield _super.save.call(this, ...args);
                DynamoModel.jsonFy(this);
            });
        }
    }
    DynamoModel.jsonTypes = jsonTypes;
    DynamoModel.Model = Model;
    return DynamoModel;
}
exports.default = model;
