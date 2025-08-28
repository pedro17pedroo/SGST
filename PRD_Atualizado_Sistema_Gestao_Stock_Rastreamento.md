# Documento de Requisitos do Produto (PRD): Sistema de Gestão de Stock e Rastreamento Logístico de Classe Mundial

## 1. Visão Geral

### 1.1 Propósito
Este PRD define os requisitos para um Sistema de Gestão de Stock e Rastreamento (SGST) de classe mundial, com cobertura end-to-end (E2E) desde o recebimento até a prova de entrega (POD), orientado por padrões (ISO 27001/27701, GS1, WMS/TMS best practices), com arquitetura resiliente, offline-first e extensível. Este sistema foi desenhado para superar os melhores do mercado, oferecendo recursos adicionais de IA, IoT, triple-ledger traceability (blockchain opcional), digital twin operacional e UX centrada no operador.

### 1.2 Âmbito
O SGST incluirá:

**Funcionalidades Core:**
- Gestão de inventário com precisão ≥ 99,8% (níveis de stock, detalhes de produtos, organização de armazéns)
- Rastreamento em tempo real com cobertura total: item-level (lote/SN), unidade logística (SKU, caixa, palete) e carga (contentor/carreta)
- Integração com sistemas externos (ERP, CRM, plataformas de e-commerce, provedores de logística)
- Interfaces amigáveis para desktop, dispositivos móveis, AR/VR e voice picking
- Relatórios e análises avançadas com IA/ML para tomada de decisões
- Conformidade com regulamentações locais e internacionais

**Diferenciadores 10x:**
- Offline-first total: apps de chão-de-fábrica e motorista operam 100% offline
- Computer Vision Edge: contagem automática e detecção de danos
- RTLS híbrido: RFID + UWB + BLE para precisão < 30 cm
- Digital Twin Operacional: visual 3D/2D do armazém com simulação
- Triple-Ledger Traceability: trilhas internas + assinaturas WORM + blockchain opcional
- Auto-slotting: otimização contínua de layout
- Green ETA: otimização por custo e pegada de carbono
- Operação em Angola: tolerância a falhas de rede/energia

### 1.3 Objetivos Estratégicos

1. **Rastreabilidade total**: item-level (lote/SN), unidade logística (SKU, caixa, palete) e carga (contentor/carreta)
2. **Precisão de inventário ≥ 99,8%** e **OTIF ≥ 98%** com visibilidade em tempo real
3. **Ciclo de picking 10–30% mais rápido** com menos erros (< 0,1%)
4. **ETA preditivo com erro médio < 7 minutos** em zonas urbanas
5. **Segurança by design**: conformidade com ISO 27001 e privacidade por padrão (DPIA/27701)
6. **Operação em ambientes com conectividade limitada** (ex.: zonas de Angola) com sincronização confiável

## 2. Partes Interessadas

**Utilizadores Finais:**
- Gestores de armazéns, funcionários de inventário, coordenadores de logística
- Operadores de picking com handhelds, voice picking e AR
- Conferentes/embalagem com balanças e câmeras
- Motoristas com aplicativo offline e POD em 3 toques
- Torre de controlo com dashboards KPIs e mapas
- Administradores e clientes (para rastreamento)

**Donos de Negócios:** Decisores que buscam eficiência operacional e poupança de custos
**Desenvolvedores:** Equipas internas ou terceiras responsáveis pela implementação e manutenção
**Equipas de Conformidade:** CISO, DPO, auditores para ISO 27001/27701

## 3. Requisitos Funcionais

### 3.1 Master Data & Configurações

**RF1.1: Catálogo de Produtos Avançado**
- Catálogo de produtos (SKU), UOM, kits/BOM, atributos GS1 (GTIN, SSCC), lotes e série
- Suporte a múltiplas unidades de medida e moedas configuráveis (Kwanza angolano como padrão)
- Tags inteligentes, classificação ABC/XYZ, atributos customizados
- Gestão de kits e Bill of Materials (BOM)

**RF1.2: Gestão de Locais Inteligente**
- Armazéns/micro-hubs, zonas, corredores, prateleiras, posições (bin/slot)
- Endereçamento inteligente com capacidade dinâmica
- Mapeamento 3D para digital twin
- Zonas especiais (quarentena, cross-dock, temperature-controlled)

**RF1.3: Gestão de Parceiros**
- Fornecedores, transportadoras, motoristas, clientes com SLAs
- Scorecards de performance e avaliação contínua
- Integração com sistemas de terceiros via APIs

**RF1.4: Regras de Negócio Configuráveis**
- Políticas de picking, reabastecimento, putaway
- Ciclos de contagem, ondas, agendamento docas
- Workflows aprovação e escalonamento

### 3.2 Recebimento & Putaway Avançado

**RF2.1: Recebimento Inteligente**
- ASN/EDI/API/Portal fornecedor com validação automática
- Identificação multi-modal: QR/Barcode (1D/2D), RFID/UWB
- **Visão computacional (CV)** para contagem automática de caixas/itens
- Validação automática de dimensões e peso

**RF2.2: Controlo de Qualidade**
- Inspeção por amostragem configurável
- Quarentena automática por regras
- Captura de fotos e notas de qualidade
- Integração com sistemas de laboratório

**RF2.3: Putaway Otimizado**
- Putaway guiado por regras (slotting dinâmico)
- Cross-dock automático baseado em regras
- Criação automática de palete SSCC
- Otimização de espaço em tempo real

### 3.3 Gestão de Stocks (WMS Core)

**RF3.1: Inventário em Tempo Real**
- Inventário em tempo real por localização/lote/SN
- Reservas automáticas e gestão de alocações
- Multi-owner support (3PL scenarios)
- Valuation FIFO/FEFO/LEFO por lote

**RF3.2: Reabastecimento Inteligente**
- Reabastecimento automático (min/max, demanda preditiva)
- Algoritmos ML para previsão de demanda
- Reabastecimento baseado em velocidade de picking
- Alerta de ruptura preditivo

**RF3.3: Contagem Cíclica Avançada**
- Contagem cíclica por risco/valor/rotatividade
- Dupla conferência por CV/RFID
- Algoritmos ABC/XYZ para priorização
- Reconciliação automática com tolerâncias configuráveis

**RF3.4: Movimentações e Ajustes**
- Transferências internas com aprovação
- Ajustes auditáveis (SOX-like)
- Trilha de auditoria imutável
- Integração automática com financeiro

### 3.4 Planeamento & Execução de Picking Avançado

**RF4.1: Estratégias de Picking**
- Estratégias múltiplas: single, batch, cluster, zone, wave, waveless
- Otimização automática baseada em perfil do pedido
- Picking por prioridade dinâmica
- Consolidação inteligente de pedidos

**RF4.2: Otimização de Rotas**
- Otimização de rotas de picking por grafo do armazém
- Algoritmos genetéticos para TSP (Travelling Salesman Problem)
- Consideração de restrições (peso, volume, temperatura)
- Adaptação em tempo real a bloqueios/indisponibilidades

**RF4.3: Dispositivos e Interfaces**
- Handhelds Android com botões grandes, vibração/áudio
- Wearables (ring scanners) para hands-free operation
- **Voice picking (PT/EN)** com reconhecimento de voz
- **AR (óculos)** para highlights de prateleiras
- Smart-carts com UWB/RTLS para localização

**RF4.4: Verificação e Qualidade**
- Verificação dupla: scan-scan (local + item)
- Balanças integradas para verificação de peso
- Validação de pick por computer vision
- Controlo de qualidade no pick (danos, validade)

### 3.5 Embalagem, Consolidação e Expedição

**RF5.1: Packing Inteligente**
- Packing UI com validação de peso/volume automática
- Otimização de embalagem (cubing algorithms)
- Validação por computer vision
- Geração automática de etiquetas GS1-128/QR

**RF5.2: Consolidação e Manifesto**
- Consolidação automática por destino/rota
- Booking de doca automático
- Manifestos eletrônicos com assinatura digital
- Selos digitais para anti-tampering

**RF5.3: Conformidade e Documentação**
- Dangerous goods handling
- Cold-chain compliance com alertas
- Documentação aduaneira automática
- Certificados de origem eletrônicos

### 3.6 TMS & Monitoramento de Entregas

**RF6.1: Planeamento de Rotas Avançado**
- Planeamento de rotas (VRP) com janelas de tempo
- Restrições de veículo (peso, volume, tipo)
- Otimização multi-objetivo (tempo, custo, carbono)
- Re-planeamento automático por eventos

**RF6.2: ETA Preditivo com IA**
- **ETA preditivo (ML + tráfego + histórico + clima)**
- Gradient boosting/transformers para previsão
- Features de tráfego tempo real quando disponível
- Alertas proativos de atrasos

**RF6.3: Aplicativo do Motorista**
- Navegação offline com mapas locais
- Gestão de paradas com otimização dinâmica
- **Provas de entrega (POD)**: assinatura, foto, OCR documento, e-seal
- Chat seguro com dispatcher
- Controlo de despesas e combustível

**RF6.4: Monitoramento e Alertas**
- Geofencing indoor/outdoor
- Alertas automáticos: atraso, desvio, violações de temperatura
- Telemetria veicular (CAN-bus/OBD-II)
- Dashboards em tempo real para controlo

### 3.7 Devoluções (Reverse Logistics)

**RF7.1: Gestão de RMA**
- Workflow de RMA com aprovações
- Portal cliente para iniciação de devoluções
- QR codes para easy returns
- Integração com customer service

**RF7.2: Triagem e Processamento**
- Triagem automática (re-estocagem/refabricação/descartes)
- Inspeção de qualidade com fotos
- Recolha programada com otimização de rotas
- Integração com sistemas de refund

### 3.8 Torre de Controlo (Command Center)

**RF8.1: Dashboards em Tempo Real**
- Painéis executivos (WMS/TMS/OMS)
- Heatmaps de performance por zona/operador
- **Digital twin** do armazém e da frota em 3D/2D
- KPIs em tempo real com alertas

**RF8.2: Simulação e What-if**
- Simulação de cenários (picos, falta de mão-de-obra, avarias)
- Previsões de backlog
- Capacity planning
- Impact analysis de mudanças

### 3.9 Integrações & EDI

**RF9.1: Integrações ERP/OMS**
- ERP (financeiro/ordens): SAP, Oracle, Microsoft, Primavera, PHC
- OMS, e-commerce, marketplaces
- Sincronização bi-direcional em tempo real
- Mapeamento flexível de dados

**RF9.2: APIs e Conectividade**
- APIs REST/GraphQL com versionamento
- Webhooks com assinatura HMAC e retry
- EDI (EDIFACT/X12), AS2/SFTP
- iPaaS/ESB leve para transformações

**RF9.3: Integrações Locais (Angola)**
- **EMIS/Unitel Money** para cobranças na entrega (CoD)
- Multicaixa para pagamentos
- Mapas offline para navegação
- Provedores locais de tráfego quando disponível

### 3.10 Administração, Auditoria e Compliance

**RF10.1: Gestão de Utilizadores**
- SSO/OIDC, MFA obrigatório
- RBAC/ABAC granular
- PAM para administradores
- Segregação de funções (SOD)

**RF10.2: Auditoria e Compliance**
- Trilhas de auditoria imutáveis
- Conformidade ISO 27001/27701
- LGPD/GDPR-like compliance
- Retenção e expurgo automático

**RF10.3: Segurança**
- Gestão de segredos/PKI
- Criptografia end-to-end
- Assinatura digital para PODs/eventos
- SIEM integration

## 4. Diferenciadores Tecnológicos (10x)

### 4.1 Offline-First Total
- Apps de chão-de-fábrica operam 100% offline
- CRDTs (Conflict-free Replicated Data Types) para sincronização
- Fila de eventos com retry inteligente
- Sincronização < 60s após rede restabelecida

### 4.2 Computer Vision Edge
- Contagem automática em recebimento
- Conferência automática no packing
- Detecção de danos em produtos
- Leitura automática de etiquetas/documentos

### 4.3 RTLS Híbrido
- RFID + UWB + BLE para precisão < 30 cm
- Geofencing indoor/outdoor
- Tracking de pessoas e assets
- Heatmaps de movimento em tempo real

### 4.4 Digital Twin Operacional
- Visualização 3D/2D do armazém
- Simulação de picking/putaway
- Previsões de backlog
- Otimização contínua de layout

### 4.5 Anomalia & Fraude Detection
- ML para eventos incoerentes
- Detecção de saltos de localização impossíveis
- Leituras fora de janela temporal
- Manipulação de etiquetas/selos

### 4.6 Triple-Ledger Traceability
- Trilhas internas (database)
- Assinaturas em WORM storage
- Hash em blockchain permissionada (opcional)
- Anti-fraude e non-repudiation

### 4.7 Auto-Slotting Inteligente
- Otimização contínua de layout
- Base na rotatividade e afinidade de itens
- Redução de percursos de picking
- Machine learning para melhorias

### 4.8 Green ETA
- Otimização por custo e pegada de carbono
- Consolidação dinâmica
- Rotas eco-friendly
- Relatórios de sustentabilidade

### 4.9 UX Hiper-Rápida
- < 200 ms de latência percebida
- Atalhos inteligentes
- "1-tap confirm" operations
- Interface adaptativa por contexto

### 4.10 Operação em Angola
- Tolerância a falhas de rede/energia
- Pacotes de mapas offline
- Fallback via SMS/USSD para POD básico
- Buffer local com sincronização diferida

## 5. Requisitos Não Funcionais

### 5.1 Performance
- **Precisão de inventário**: ≥ 99,8%
- **Taxa de erro de picking**: ≤ 0,1%
- **OTIF**: ≥ 98%
- **ETA accuracy**: MAPE < 12%, erro médio < 7 minutos
- **Latência BFF p95**: < 200 ms
- **Tempo de ciclo de picking**: -20% YoY

### 5.2 Escalabilidade
- Particionamento por tenant (multi-tenant seguro)
- Escalabilidade horizontal
- Suporte a múltiplos armazéns/países
- Auto-scaling baseado em carga

### 5.3 Disponibilidade e Resiliência
- **Disponibilidade serviço core**: 99,95% (cloud) / 99,9% (edge-gateway)
- Circuit breakers e retries
- Idempotência em todas as APIs
- Backpressure handling

### 5.4 Segurança (ISO 27001)
- TLS 1.3 para todas as comunicações
- AES-GCM para dados em repouso
- Chaves rotacionadas automaticamente
- HSM/KMS para secrets management

### 5.5 Observabilidade
- Logs estruturados com correlação
- Métricas (Prometheus/OpenMetrics)
- Tracing distribuído (OpenTelemetry)
- SIEM integration

### 5.6 Conformidade e Privacidade (ISO 27701)
- DPIA (Data Protection Impact Assessment)
- Minimização e pseudonimização
- Consentimento granular quando aplicável
- Retenção por finalidade com expurgo automático

## 6. Arquitetura de Referência

### 6.1 Estilo Arquitetural
- Microserviços orientados a domínio (DDD)
- Event-driven architecture
- CQRS + Event Sourcing onde crítico
- Edge computing para operações críticas

### 6.2 Camadas

**Edge/Clients:**
- Apps Android (WMS, Driver, Supervisor)
- Web (Ops/Admin)
- AR/Voice interfaces

**BFF (Backend for Frontend):**
- GraphQL gateway + REST
- Agregação de dados por persona
- Rate limiting e caching

**Serviços de Domínio:**
- inventory, receiving, slotting, picking
- packing, shipping, transport, eta-ml
- alerts, billing, audit, authz

**Plataforma de Dados:**
- Event bus (Kafka/Pulsar)
- Data Lakehouse (Delta/Iceberg)
- Feature Store para ML
- Cache distribuído (Redis)
- Search (Elastic/OpenSearch)
- Timeseries DB (IoT)
- WORM storage (S3-Object Lock)

**Integração:**
- iPaaS/ESB leve
- Conectores EDI/AS2
- Webhooks com assinatura HMAC

**Infraestrutura:**
- Kubernetes multi-zona
- Edge nodes (no armazém) para CV/IoT
- CDN para assets

## 7. IA/ML em Produção

### 7.1 ETA Preditivo
- Gradient boosting/transformers
- Features: tráfego/clima/histórico
- Real-time inference
- Continuous learning

### 7.2 Previsão de Demanda
- Modelos sazonais
- Eventos promocionais
- External factors (weather, events)
- Automatic retraining

### 7.3 Detecção de Anomalias
- Isolation Forest/Autoencoders
- Eventos e telemetria
- Real-time scoring
- Alert generation

### 7.4 Computer Vision
- Contagem de caixas/itens
- Leitura de etiquetas/códigos
- Detecção de danos
- Verificação de vedação/selos

### 7.5 Recomendador de Slotting
- Otimização combinatória (GRASP/ILS)
- Feedback humano
- A/B testing de layouts
- ROI measurement

## 8. Conectividade & IoT

### 8.1 Edge Computing
- Gateways edge com buffer store (MQTT)
- Edge AI para computer vision
- Local processing para baixa latência
- Sincronização inteligente para cloud

### 8.2 Sensores e Dispositivos
- Temperatura/umidade/choque
- E-seals para anti-tampering
- CAN-bus/OBD-II para veículos
- Câmeras com NVR local

### 8.3 Localização
- UWB para RTLS indoor (< 30cm precisão)
- BLE beacons para proximidade
- RFID (EPCglobal) para inventário
- GNSS multi-banda para outdoor

## 9. Métricas & KPIs

### 9.1 Operacionais
- Precisão de inventário (≥ 99,8%)
- Taxa de erro de picking (≤ 0,1%)
- Tempo médio de ciclo de picking (-20% YoY)
- OTIF (≥ 98%)
- Lead time de recebimento (-25%)

### 9.2 Logísticos
- Ocupação de slots (%) e distância média por tarefa (-15%)
- Cumprimento de ETA (MAPE < 12%)
- Taxa de devoluções por erro logístico (-40%)
- Emissões de CO2 por entrega

### 9.3 Técnicos
- MTTR incidentes críticos de TI (< 30 min)
- Disponibilidade de serviços (99,95%)
- Latência de APIs (p95 < 200ms)
- Taxa de sincronização offline-online

## 10. Roadmap de Implementação

### Fase 0 — Foundations (0–6 semanas)
- ISMS inicial (políticas, SoA, risco)
- Arquitetura e DevSecOps
- CI/CD e observabilidade
- MVP: inventário, recebimento, putaway, picking simples
- App motorista com POD offline

### Fase 1 — Performance & Visibilidade (6–16 semanas)
- Otimização de picking
- Contagem cíclica
- Packing e TMS com rotas
- ETA básico
- Dashboards executivos
- Torre de controlo
- Integrações ERP/OMS

### Fase 2 — 10x e IA (16–32 semanas)
- CV no recebimento/packing
- RTLS híbrido
- ETA avançado com ML
- Detecção de anomalia/fraude
- Auto-slotting
- Blockchain/WORM
- Digital twin
- Simulações

### Fase 3 — Escala & Certificação (32–48 semanas)
- DR ativo-ativo
- Multi-armazém/país
- Certificação ISO 27001/27701
- Performance tuning
- Rollout completo

## 11. Testes & Qualidade

### 11.1 Estratégia de Testes
- Teste de unidade (≥ 85% cobertura)
- Contratos de API (consumer-driven)
- Teste de performance (picos Black Friday)
- Chaos testing para tolerância a falhas

### 11.2 UAT e Pilotos
- UAT com scripts por persona
- Pilotos em 1–2 armazéns
- 1 região de entrega para TMS
- Métricas de sucesso definidas

### 11.3 Segurança
- Auditorias de segurança contínuas
- Pentests trimestrais
- SAST/DAST/SCA (> 90% cobertura)
- Exercícios de DR

## 12. Riscos & Mitigações

### 12.1 Conectividade
- **Risco**: Falhas de rede em Angola
- **Mitigação**: Offline-first, buffer de eventos, fallback SMS/USSD

### 12.2 Adoção de Operadores
- **Risco**: Resistência a mudança
- **Mitigação**: UX simplificada, formação extensiva, métricas de coaching

### 12.3 Hardware
- **Risco**: Falhas de equipamento
- **Mitigação**: Plano de spares, MDM, contratos de manutenção

### 12.4 Privacidade
- **Risco**: Não conformidade LGPD
- **Mitigação**: DPIA, minimização, políticas claras

## 13. Integrações Prioritárias (Angola-ready)

### 13.1 ERPs Locais
- SAP, Oracle, Microsoft Dynamics
- Primavera, PHC
- Sistemas locais customizados

### 13.2 Pagamentos
- EMIS/Multicaixa para cartões
- Unitel Money para mobile money
- Cash-on-delivery (CoD) tracking

### 13.3 Logística
- Correios de Angola
- TAAG Cargo
- Transportadoras locais
- DHL/FedEx internacional

### 13.4 Mapas e Navegação
- Mapas offline detalhados
- Integração com provedores locais de tráfego
- Geocoding para endereços angolanos

## 14. SLOs/SLAs Técnicos

- **Disponibilidade serviço core**: 99,95% (cloud) / 99,9% (edge-gateway)
- **Latência BFF p95**: < 200 ms
- **Sincronização offline → online**: < 60 s após rede restabelecida
- **Entrega de eventos (at-least-once) p99**: < 5 s
- **RTO/RPO**: RTO ≤ 1h / RPO ≤ 15min

## 15. Dados & Retenção

- **Eventos operacionais**: 36 meses (quente 90 dias / frio 33 meses)
- **Logs de segurança**: ≥ 12 meses (WORM 6 meses)
- **POD**: 5–10 anos (conforme jurídico/contratual)
- **Telemetria veículo**: 12–24 meses (agregado/anonimizado após 90 dias)

## 16. Checklist de Go-Live

- [ ] Precisão de inventário ≥ 99,8% confirmada por contagem cíclica
- [ ] Erro de picking ≤ 0,1% em 30 dias
- [ ] MAPE de ETA < 12% e média de erro < 7 minutos
- [ ] 100% dos PODs com assinatura + foto + geotag + hash imutável
- [ ] Sincronização offline validada (≥ 72h sem rede)
- [ ] Pentest sem achados críticos, cobertura SAST/DAST/SCA > 90%
- [ ] DR testado com RTO ≤ 1h / RPO ≤ 15min

## 17. Bill of Materials (BoM) de Hardware

### 17.1 Dispositivos Móveis
- Handhelds Android IP65+ com scanners 2D
- Ring scanners para hands-free operation
- Headsets de voz para voice picking
- Óculos AR (Microsoft HoloLens/Magic Leap) - opcional

### 17.2 Infraestrutura de Armazém
- Balanças Bluetooth integradas
- Impressoras térmicas para etiquetas GS1
- Gateways IoT para sensores
- Leitores RFID/UWB fixos
- Access points Wi-Fi 6/6E

### 17.3 Sensores e Monitoramento
- E-seals para anti-tampering
- Sensores temperatura/umidade
- Câmeras IP para computer vision
- UPS/geradores para energia backup

## 18. Próximos Passos

1. **Assessment atual**: Confirmar processos e volumes (SKU, linhas/dia, veículos, áreas)
2. **PoC Hardware**: Selecionar BoM e PoC de RTLS
3. **Definição de metas**: Por site e cronograma de rollout
4. **Kick-off Fase 0**: Foundations com quick wins em 6 semanas

---

*Este PRD representa a visão mais ambiciosa e tecnicamente avançada de um sistema WMS/TMS, incorporando as melhores práticas globais com adaptações específicas para o mercado angolano e africano.*