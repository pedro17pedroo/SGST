#!/bin/bash

echo "🔍 Testando criação de lista de picking com itens usando curl..."

# 1. Fazer login e obter cookies
echo "\n1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST \
  http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# 2. Buscar armazéns
echo "\n2. Buscando armazéns..."
WAREHOUSES_RESPONSE=$(curl -s -b cookies.txt \
  http://localhost:4001/api/warehouses)

echo "Warehouses response: $WAREHOUSES_RESPONSE"

# Extrair o primeiro warehouse ID (assumindo que existe pelo menos um)
WAREHOUSE_ID=$(echo $WAREHOUSES_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Warehouse ID: $WAREHOUSE_ID"

# 3. Buscar produtos
echo "\n3. Buscando produtos..."
PRODUCTS_RESPONSE=$(curl -s -b cookies.txt \
  http://localhost:4001/api/products)

echo "Products response: $PRODUCTS_RESPONSE"

# Extrair o primeiro product ID
PRODUCT_ID=$(echo $PRODUCTS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Product ID: $PRODUCT_ID"

# 4. Criar lista de picking com itens
echo "\n4. Criando lista de picking com itens..."
PICKING_RESPONSE=$(curl -s -b cookies.txt -X POST \
  http://localhost:4001/api/picking-lists \
  -H "Content-Type: application/json" \
  -d "{
    \"orderNumbers\": [\"ORD-TEST-CURL-001\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"high\",
    \"pickingType\": \"individual\",
    \"notes\": \"Lista criada pelo teste curl com itens\",
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantityToPick\": 5,
        \"locationId\": \"no-location\"
      },
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantityToPick\": 3,
        \"locationId\": \"no-location\"
      }
    ]
  }")

echo "Picking list creation response: $PICKING_RESPONSE"

# 5. Verificar se a lista foi criada
if echo "$PICKING_RESPONSE" | grep -q '"id"'; then
  PICKING_LIST_ID=$(echo $PICKING_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "\n5. Lista criada com ID: $PICKING_LIST_ID"
  
  # Buscar detalhes da lista
  echo "\n6. Buscando detalhes da lista..."
  LIST_DETAILS=$(curl -s -b cookies.txt \
    http://localhost:4001/api/picking-lists/$PICKING_LIST_ID)
  
  echo "List details: $LIST_DETAILS"
else
  echo "\n❌ Erro ao criar lista de picking"
fi

# Limpar cookies
rm -f cookies.txt

echo "\n🎉 Teste concluído!"