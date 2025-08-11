#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/contacts"

echo -e "${YELLOW}🧪 Probando endpoints de Contactos${NC}"
echo "=================================="

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    # Separar el body de la respuesta del código de estado
    body=$(echo "$response" | head -n -1)
    status_code=$(echo "$response" | tail -n 1)
    
    echo -e "${GREEN}✅ $method $endpoint (Status: $status_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
}

# 1. Crear un contacto
echo -e "${YELLOW}1. Creando un contacto...${NC}"
make_request "POST" "" '{
    "nombre": "Juan Pérez",
    "telefono": "+1234567890",
    "email": "juan@example.com"
}'

# 2. Crear otro contacto
echo -e "${YELLOW}2. Creando otro contacto...${NC}"
make_request "POST" "" '{
    "nombre": "María García",
    "telefono": "+0987654321",
    "email": "maria@example.com"
}'

# 3. Obtener todos los contactos
echo -e "${YELLow}3. Obteniendo todos los contactos...${NC}"
make_request "GET" ""

# 4. Obtener un contacto específico (asumiendo que el primer contacto tiene ID)
echo -e "${YELLOW}4. Obteniendo un contacto específico...${NC}"
# Nota: Necesitarás reemplazar el ID con uno real de la respuesta anterior
make_request "GET" "/ID_DEL_CONTACTO"

echo -e "${GREEN}✅ Pruebas completadas${NC}" 