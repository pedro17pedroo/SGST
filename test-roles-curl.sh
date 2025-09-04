#!/bin/bash

API_BASE="http://localhost:4001"
COOKIE_JAR="cookies.txt"

echo "🔍 Testando API de Roles e Permissions..."
echo

# 1. Fazer login primeiro
echo "1. Fazendo login..."
curl -c "$COOKIE_JAR" -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -s | jq '.'

echo
echo "2. Testando GET /api/roles..."
curl -b "$COOKIE_JAR" -X GET "$API_BASE/api/roles" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo
echo "3. Testando GET /api/permissions..."
curl -b "$COOKIE_JAR" -X GET "$API_BASE/api/permissions" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo
echo "4. Testando seed de permissions..."
curl -b "$COOKIE_JAR" -X POST "$API_BASE/api/permissions/seed" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo
echo "5. Verificando permissions após seed..."
curl -b "$COOKIE_JAR" -X GET "$API_BASE/api/permissions" \
  -H "Content-Type: application/json" \
  -s | jq '.'

# Limpar cookies
rm -f "$COOKIE_JAR"