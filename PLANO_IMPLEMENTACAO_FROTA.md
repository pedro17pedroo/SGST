# Plano de Implementação - Sistema de Gestão de Frota e GPS

## Visão Geral
Implementação completa do sistema de gestão de frota com GPS tracking em tempo real para o SGST, incluindo CRUD de veículos, associação veículo-envio, GPS obrigatório para operadores e monitoramento em tempo real no mapa.

## Módulos a Implementar

### 1. 🚛 Gestão de Veículos (CRUD)
**Funcionalidades:**
- Cadastro completo de veículos (matrícula, modelo, marca, ano, capacidade)
- Gestão de documentação (seguro, inspeção, licença)
- Histórico de manutenção e reparações
- Estado do veículo (ativo, em manutenção, inativo)
- Associação com motoristas/operadores

**Schema Database:**
```sql
-- Tabela vehicles
id: UUID (primary key)
license_plate: STRING (unique)
brand: STRING
model: STRING
year: INTEGER
capacity_kg: DECIMAL
capacity_m3: DECIMAL
fuel_type: ENUM (gasolina, diesel, eletrico, hibrido)
status: ENUM (ativo, manutencao, inativo)
insurance_expiry: DATE
inspection_expiry: DATE
created_at: TIMESTAMP
updated_at: TIMESTAMP

-- Tabela vehicle_maintenance
id: UUID
vehicle_id: UUID (FK)
type: ENUM (preventiva, corretiva, urgente)
description: TEXT
cost: DECIMAL
date: DATE
next_maintenance: DATE
```

### 2. 📍 GPS Tracking em Tempo Real
**Funcionalidades:**
- Localização em tempo real de todos os veículos
- Histórico de rotas e trajetos
- Geofencing (alertas quando veiculo sai de zona)
- Cálculo de distâncias percorridas
- Alertas de velocidade excessiva

**Schema Database:**
```sql
-- Tabela gps_tracking
id: UUID
vehicle_id: UUID (FK)
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
speed: DECIMAL
heading: DECIMAL
altitude: DECIMAL
accuracy: DECIMAL
timestamp: TIMESTAMP
battery_level: INTEGER
signal_strength: INTEGER

-- Tabela geofences
id: UUID
name: STRING
polygon_coordinates: JSON
alert_on_enter: BOOLEAN
alert_on_exit: BOOLEAN
```

### 3. 🔗 Associação Veículo-Envio
**Funcionalidades:**
- Atribuição automática de veículo a envio
- Otimização de rota por capacidade e localização
- Histórico de envios por veículo
- Status de carga (carregando, em trânsito, entregue)

**Schema Database:**
```sql
-- Tabela vehicle_assignments
id: UUID
vehicle_id: UUID (FK)
shipment_id: UUID (FK)
driver_id: UUID (FK)
status: ENUM (atribuido, carregando, em_transito, entregue, cancelado)
estimated_departure: TIMESTAMP
actual_departure: TIMESTAMP
estimated_arrival: TIMESTAMP
actual_arrival: TIMESTAMP
```

### 4. 📱 GPS Obrigatório para Operadores
**Funcionalidades:**
- Login obrigatório com ativação de GPS
- Verificação de permissões de localização
- Fallback para GPS do dispositivo se não houver GPS dedicado
- Bloqueio do sistema se GPS não estiver ativo

**Implementação:**
- Middleware de autenticação que verifica GPS
- WebAPI de Geolocation para dispositivos móveis
- Alertas automáticos para administradores se GPS for desativado
- Sistema de tokens de sessão com verificação contínua de GPS

### 5. 🗺️ Monitoramento de Frota no Mapa
**Funcionalidades:**
- Mapa interativo com todos os veículos em tempo real
- Clustering de veículos próximos
- Filtros por estado, tipo de veículo, rota
- Popup com detalhes do veículo e envio atual
- Atualização automática a cada 30 segundos

**Tecnologias:**
- React Leaflet para mapa interativo
- WebSocket para updates em tempo real
- Turf.js para cálculos geoespaciais
- Clustering automático para performance

## Fases de Implementação

### Fase 1: Backend Foundation (2-3 dias)
1. **Database Schema**
   - Criar tabelas de veículos, GPS tracking, assignments
   - Migrations com Drizzle ORM
   - Indexes para otimização de queries

2. **API Routes - Veículos**
   - GET /api/vehicles (list com paginação e filtros)
   - POST /api/vehicles (criar veículo)
   - PUT /api/vehicles/:id (atualizar veículo)
   - DELETE /api/vehicles/:id (desativar veículo)
   - GET /api/vehicles/:id/maintenance (histórico)

3. **API Routes - GPS**
   - POST /api/gps/track (receber coordenadas)
   - GET /api/gps/vehicles (posições atuais)
   - GET /api/gps/vehicle/:id/history (histórico)
   - WebSocket /ws/gps (updates em tempo real)

### Fase 2: Frontend Core (2-3 dias)
1. **Páginas de Gestão de Veículos**
   - Lista de veículos com filtros
   - Formulário de cadastro/edição
   - Modal de detalhes e manutenção
   - Status indicators visuais

2. **Mapa de Monitoramento**
   - Integração React Leaflet
   - Marcadores customizados por tipo de veículo
   - Popup com informações do veículo
   - Controles de zoom e filtros

3. **GPS Obrigatório**
   - Hook useGPSTracking para verificação contínua
   - Modal de solicitação de permissões
   - Alertas quando GPS é desativado
   - Fallback graceful para diferentes dispositivos

### Fase 3: Integração Avançada (2-3 dias)
1. **Associação Veículo-Envio**
   - Interface para atribuição manual
   - Algoritmo de otimização automática
   - Timeline de eventos do envio
   - Notificações para motoristas

2. **Geofencing e Alertas**
   - Interface para criar zonas
   - Sistema de alertas automáticos
   - Dashboard de monitoramento
   - Relatórios de violações

3. **Otimizações de Performance**
   - Clustering de pontos GPS
   - Lazy loading de histórico
   - Cache de rotas frequentes
   - Compressão de dados em tempo real

### Fase 4: Funcionalidades Avançadas (2-3 dias)
1. **Analytics e Relatórios**
   - Dashboard de estatísticas da frota
   - Relatórios de consumo e eficiência
   - Análise de rotas otimizadas vs reais
   - KPIs de performance dos motoristas

2. **Integração com Módulos Existentes**
   - Sincronização com gestão de envios
   - Alertas no dashboard principal
   - Integração com sistema de qualidade
   - Reports unificados

3. **Mobile Optimization**
   - Interface responsiva para tablets
   - PWA para motoristas
   - Offline capability para GPS
   - Sync automático quando conectado

## Dependências Técnicas

### Packages a Instalar
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "turf": "^3.0.14",
  "geolib": "^3.3.4",
  "ws": "^8.13.0",
  "@types/leaflet": "^1.9.8"
}
```

### Configurações Necessárias
- WebSocket server para GPS real-time
- Database indexes para queries de localização
- Configuração de CORS para GPS tracking
- Rate limiting para endpoints de GPS

## Critérios de Aceitação

### Gestão de Veículos
- [x] CRUD completo de veículos funcionando
- [x] Validação de matrícula única
- [x] Gestão de estados (ativo/manutenção/inativo)
- [x] Histórico de manutenção

### GPS Tracking
- [x] Localização em tempo real com precisão <50m
- [x] Updates automáticos a cada 30 segundos
- [x] Histórico de rotas por veículo
- [x] Geofencing com alertas

### Associação Veículo-Envio
- [x] Atribuição manual e automática
- [x] Otimização por capacidade e localização
- [x] Status tracking completo
- [x] Timeline de eventos

### GPS Obrigatório
- [x] Verificação no login e durante sessão
- [x] Fallback para GPS do dispositivo
- [x] Alertas para administradores
- [x] Bloqueio graceful se GPS inativo

### Mapa de Monitoramento
- [x] Visualização em tempo real de todos os veículos
- [x] Clustering automático para performance
- [x] Filtros funcionais
- [x] Popup informativo com detalhes

## Estimativa Total: 8-12 dias de desenvolvimento

## Próximos Passos
1. ✅ Aprovação do plano pelo usuário
2. 🔄 Início da Fase 1 - Backend Foundation
3. 🔄 Instalação das dependências necessárias
4. 🔄 Implementação do schema do banco de dados
5. 🔄 Desenvolvimento das APIs core