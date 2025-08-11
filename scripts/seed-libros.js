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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const libro_datasource_1 = require("../src/infrastructure/datasources/libro.datasource");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const librosData = [
    { id: 1, categoria: 'CIVIL', titulo: 'Derecho Civil Parte General', autor: 'Rivera . Medina', edicion: '2da ed. actualizada 2019', precio: 13280 },
    { id: 2, categoria: 'CIVIL', titulo: 'Derecho Civil Manual Parte General', autor: 'Ghersi Carlos', edicion: '3ra ed. actualizada 2017', precio: 17680 },
    { id: 3, categoria: 'CIVIL', titulo: 'Derecho Civil Parte General', autor: 'Borda', edicion: '2da ed. 2019', precio: 4920 },
];
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://mongo-user:123456@localhost:27017/centeno?authSource=admin';
        yield mongoose_1.default.connect(mongoUrl);
        const ds = new libro_datasource_1.MongoLibroDatasource();
        // limpiar colección
        yield mongoose_1.default.connection.collection('libros').deleteMany({});
        const jsonPath = path_1.default.join(__dirname, 'libros.json');
        const file = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const { libros } = JSON.parse(file);
        for (const l of libros) {
            yield ds.create({
                categoria: l.categoria,
                titulo: l.titulo,
                autor: l.autor,
                edicion: l.edicion,
                precio: (_a = l.precio) !== null && _a !== void 0 ? _a : null,
            });
        }
        console.log(`Seed completado: ${libros.length} libros`);
        yield mongoose_1.default.disconnect();
    });
}
main().catch((err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(err);
    yield mongoose_1.default.disconnect();
    process.exit(1);
}));
