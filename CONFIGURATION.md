# Configuración del Backend

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
MONGODB_URL=mongodb://mongo-user:123456@localhost:27017/centeno?authSource=admin
```

## Iniciar MongoDB

Para iniciar MongoDB usando Docker Compose:

```bash
docker-compose up -d mongo-db
```

## Instalar Dependencias

```bash
npm install
```

## Ejecutar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Endpoints Disponibles

### Contactos

- `POST /api/contacts` - Crear un nuevo contacto
- `GET /api/contacts` - Obtener todos los contactos
- `GET /api/contacts/:id` - Obtener un contacto por ID

### Ejemplo de Crear Contacto

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "+1234567890",
    "email": "juan@example.com"
  }'
``` 