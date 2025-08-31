-- SEED COMPLETO REFRIANGO - Popular TODAS as 45+ tabelas
-- Sistema de Gestão de Stock e Rastreamento (SGST)

BEGIN;

-- ===== LIMPAR TODAS AS TABELAS =====
TRUNCATE TABLE 
  worm_storage, audit_trail, optimization_jobs, fraud_detection, ml_models,
  slotting_rules, slotting_analytics, product_affinity, real_time_visualization,
  digital_twin_simulations, warehouse_layout, warehouse_zones, picking_velocity,
  demand_forecasts, replenishment_tasks, replenishment_rules, pallet_items,
  sscc_pallets, putaway_tasks, putaway_rules, cv_counting_results,
  receiving_receipt_items, receiving_receipts, asn_line_items, asn,
  barcode_scans, notification_preferences, alerts, return_items, returns,
  inventory_count_items, inventory_counts, picking_list_items, picking_lists,
  shipments, order_items, orders, stock_movements, product_locations,
  inventory, products, categories, suppliers, warehouses, users 
RESTART IDENTITY CASCADE;

-- ===== 1. USERS =====
INSERT INTO users (id, username, email, password, role, is_active, created_at, updated_at) VALUES
('u1000001-0000-4000-8000-000000000001', 'miguel.diretor', 'miguel.almeida@refriango.com', '$2b$12$6i4oVYj/jDgJfhQ3UoSjEegzV6LXKebGpq3z9m6Y9lBQeWb6BXyNq', 'admin', true, NOW(), NOW()),
('u1000002-0000-4000-8000-000000000002', 'ana.operacoes', 'ana.silva@refriango.com', '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', 'manager', true, NOW(), NOW()),
('u1000003-0000-4000-8000-000000000003', 'carlos.logistica', 'carlos.fernandes@refriango.com', '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', 'manager', true, NOW(), NOW()),
('u1000004-0000-4000-8000-000000000004', 'patricia.qualidade', 'patricia.santos@refriango.com', '$2b$12$65PV.ZplJKONv8p.MaAuJOlXsjZI4tGoCNfLD5jEhScZruahi2S5O', 'manager', true, NOW(), NOW()),
('u1000005-0000-4000-8000-000000000005', 'joao.armazem', 'joao.costa@refriango.com', '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', 'operator', true, NOW(), NOW()),
('u1000006-0000-4000-8000-000000000006', 'maria.picking', 'maria.rodrigues@refriango.com', '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', 'operator', true, NOW(), NOW()),
('u1000007-0000-4000-8000-000000000007', 'antonio.recepcao', 'antonio.pereira@refriango.com', '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', 'operator', true, NOW(), NOW()),
('u1000008-0000-4000-8000-000000000008', 'isabel.controlo', 'isabel.martins@refriango.com', '$2b$12$btjWMPdSDlLTDJ0Yf3XxFeW0Z3vtnqEIEua3iKPNXtEX2Q2GkbhPS', 'operator', true, NOW(), NOW());

-- ===== 2. CATEGORIES =====
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
('c1000001-0000-4000-8000-000000000001', 'Refrigerantes', 'Refrigerantes das marcas Blue, Turbo, Speed e outras', NOW(), NOW()),
('c1000002-0000-4000-8000-000000000002', 'Águas', 'Águas minerais da marca Pura e outras águas', NOW(), NOW()),
('c1000003-0000-4000-8000-000000000003', 'Sumos Naturais', 'Sumos das marcas Nutry e Tutti com frutas tropicais', NOW(), NOW()),
('c1000004-0000-4000-8000-000000000004', 'Cervejas', 'Cervejas da marca Tigra e outras cervejas premium', NOW(), NOW()),
('c1000005-0000-4000-8000-000000000005', 'Cidras e Outros', 'Cidras da marca Jade e outras bebidas especiais', NOW(), NOW()),
('c1000006-0000-4000-8000-000000000006', 'Bebidas Energéticas', 'Bebidas energéticas e isotónicas das marcas Refriango', NOW(), NOW()),
('c1000007-0000-4000-8000-000000000007', 'Matérias-Primas', 'Concentrados, açúcar, CO2 e ingredientes para produção', NOW(), NOW()),
('c1000008-0000-4000-8000-000000000008', 'Embalagens', 'Garrafas, latas, rótulos e materiais de embalagem', NOW(), NOW());

-- ===== 3. SUPPLIERS =====
INSERT INTO suppliers (id, name, email, phone, address, created_at, updated_at) VALUES
('s1000001-0000-4000-8000-000000000001', 'Refriango - Produção Interna', 'producao@refriango.com', '+244 222 123 456', 'Zona Industrial de Viana, Luanda', NOW(), NOW()),
('s1000002-0000-4000-8000-000000000002', 'Owens-Illinois Angola - Embalagens', 'vendas@o-i.ao', '+244 222 234 567', 'Zona Industrial do Cazenga, Luanda', NOW(), NOW()),
('s1000003-0000-4000-8000-000000000003', 'Açucareira de Angola', 'comercial@acucareira.ao', '+244 222 345 678', 'Caxito, Província de Bengo', NOW(), NOW()),
('s1000004-0000-4000-8000-000000000004', 'Concentrados Tropicais Lda', 'vendas@concentrados.ao', '+244 222 456 789', 'Benguela, Terminal Industrial', NOW(), NOW()),
('s1000005-0000-4000-8000-000000000005', 'Gases Industriais Angola', 'co2@gases.ao', '+244 222 567 890', 'Luanda, Zona de Manutenção Industrial', NOW(), NOW()),
('s1000006-0000-4000-8000-000000000006', 'Frutas Tropicais Do Congo Lda', 'exportacao@frutastropicais.cd', '+243 123 456 789', 'Kinshasa, República Democrática do Congo', NOW(), NOW());

-- ===== 4. WAREHOUSES =====
INSERT INTO warehouses (id, name, address, is_active, created_at, updated_at) VALUES
('w1000001-0000-4000-8000-000000000001', 'Centro Produção e Distribuição Luanda', 'Zona Industrial de Viana, Lote 85-90, Luanda', true, NOW(), NOW()),
('w1000002-0000-4000-8000-000000000002', 'Centro Regional Huambo', 'Estrada Nacional EN230, Km 15, Huambo', true, NOW(), NOW()),
('w1000003-0000-4000-8000-000000000003', 'Terminal Benguela-Lobito', 'Porto do Lobito, Terminal de Bebidas, Benguela', true, NOW(), NOW()),
('w1000004-0000-4000-8000-000000000004', 'Centro Distribuição Lubango', 'Bairro Industrial da Humpata, Lubango', true, NOW(), NOW()),
('w1000005-0000-4000-8000-000000000005', 'Armazém Regional Cabinda', 'Zona Industrial de Cabinda, Cabinda', true, NOW(), NOW()),
('w1000006-0000-4000-8000-000000000006', 'Depósito RDC Kinshasa', 'Zone Industrielle de Limete, Kinshasa, RDC', true, NOW(), NOW());

-- ===== 5. PRODUCTS =====
INSERT INTO products (id, name, description, sku, barcode, price, weight, dimensions, category_id, supplier_id, min_stock_level, is_active, created_at, updated_at) VALUES
-- BLUE
('p1000001-0000-4000-8000-000000000001', 'Blue Cola Original 330ml', 'Refrigerante de cola marca Blue - líder de mercado em Angola', 'BLUE-COLA-001', '6201234567001', '200.00', '0.350', '{"length": 6, "width": 6, "height": 12}', 'c1000001-0000-4000-8000-000000000001', 's1000001-0000-4000-8000-000000000001', 10000, true, NOW(), NOW()),
('p1000002-0000-4000-8000-000000000002', 'Blue Cola Zero 500ml', 'Refrigerante Blue Cola sem açúcar em garrafa PET', 'BLUE-ZERO-002', '6201234567002', '250.00', '0.530', '{"length": 8, "width": 8, "height": 22}', 'c1000001-0000-4000-8000-000000000001', 's1000001-0000-4000-8000-000000000001', 8000, true, NOW(), NOW()),
('p1000003-0000-4000-8000-000000000003', 'Blue Laranja 350ml', 'Refrigerante sabor laranja marca Blue', 'BLUE-LARA-003', '6201234567003', '180.00', '0.370', '{"length": 6, "width": 6, "height": 15}', 'c1000001-0000-4000-8000-000000000001', 's1000001-0000-4000-8000-000000000001', 7000, true, NOW(), NOW()),
-- PURA
('p1000004-0000-4000-8000-000000000004', 'Pura Natural 500ml', 'Água mineral natural marca Pura', 'PURA-NAT-004', '6201234567004', '120.00', '0.520', '{"length": 7, "width": 7, "height": 20}', 'c1000002-0000-4000-8000-000000000002', 's1000001-0000-4000-8000-000000000001', 15000, true, NOW(), NOW()),
('p1000005-0000-4000-8000-000000000005', 'Pura com Gás 330ml', 'Água mineral com gás marca Pura', 'PURA-GAS-005', '6201234567005', '150.00', '0.350', '{"length": 6, "width": 6, "height": 18}', 'c1000002-0000-4000-8000-000000000002', 's1000001-0000-4000-8000-000000000001', 12000, true, NOW(), NOW()),
-- NUTRY/TUTTI
('p1000006-0000-4000-8000-000000000006', 'Nutry Maracujá 200ml', 'Sumo de maracujá marca Nutry em embalagem Tetra Pak', 'NUTRY-MAR-007', '6201234567007', '220.00', '0.210', '{"length": 5, "width": 4, "height": 14}', 'c1000003-0000-4000-8000-000000000003', 's1000001-0000-4000-8000-000000000001', 6000, true, NOW(), NOW()),
('p1000007-0000-4000-8000-000000000007', 'Tutti Goiaba 250ml', 'Sumo de goiaba marca Tutti com polpa natural', 'TUTTI-GOI-009', '6201234567009', '200.00', '0.270', '{"length": 6, "width": 6, "height": 15}', 'c1000003-0000-4000-8000-000000000003', 's1000001-0000-4000-8000-000000000001', 4000, true, NOW(), NOW()),
-- TIGRA
('p1000008-0000-4000-8000-000000000008', 'Tigra Original 330ml', 'Cerveja lager marca Tigra em garrafa long neck', 'TIGRA-ORI-011', '6201234567011', '350.00', '0.550', '{"length": 7, "width": 7, "height": 25}', 'c1000004-0000-4000-8000-000000000004', 's1000001-0000-4000-8000-000000000001', 5000, true, NOW(), NOW()),
('p1000009-0000-4000-8000-000000000009', 'Tigra Premium 500ml', 'Cerveja premium marca Tigra em lata especial', 'TIGRA-PRE-012', '6201234567012', '450.00', '0.520', '{"length": 7, "width": 7, "height": 16}', 'c1000004-0000-4000-8000-000000000004', 's1000001-0000-4000-8000-000000000001', 3000, true, NOW(), NOW()),
-- JADE
('p1000010-0000-4000-8000-000000000010', 'Jade Cidra Original 330ml', 'Cidra de maçã marca Jade em garrafa de vidro', 'JADE-CID-013', '6201234567013', '380.00', '0.580', '{"length": 7, "width": 7, "height": 25}', 'c1000005-0000-4000-8000-000000000005', 's1000001-0000-4000-8000-000000000001', 2000, true, NOW(), NOW()),
-- ENERGÉTICAS
('p1000011-0000-4000-8000-000000000011', 'Welwitschia Energy 250ml', 'Bebida energética premium marca Welwitschia', 'WELW-ENE-014', '6201234567014', '800.00', '0.270', '{"length": 5, "width": 5, "height": 17}', 'c1000006-0000-4000-8000-000000000006', 's1000001-0000-4000-8000-000000000001', 1500, true, NOW(), NOW()),
('p1000012-0000-4000-8000-000000000012', 'Turbo Energy Classic 350ml', 'Bebida energética marca Turbo em lata', 'TURBO-CLA-015', '6201234567015', '600.00', '0.370', '{"length": 6, "width": 6, "height": 15}', 'c1000006-0000-4000-8000-000000000006', 's1000001-0000-4000-8000-000000000001', 2500, true, NOW(), NOW()),
('p1000013-0000-4000-8000-000000000013', 'Speed Isotónico 500ml', 'Bebida isotónica marca Speed sabor tropical', 'SPEED-ISO-016', '6201234567016', '350.00', '0.520', '{"length": 7, "width": 7, "height": 21}', 'c1000006-0000-4000-8000-000000000006', 's1000001-0000-4000-8000-000000000001', 3000, true, NOW(), NOW()),
-- MATÉRIAS-PRIMAS
('p1000014-0000-4000-8000-000000000014', 'Concentrado Cola Blue 25L', 'Concentrado para produção de refrigerante Blue Cola', 'MAT-CONC-017', '6201234567017', '25000.00', '28.000', '{"length": 40, "width": 30, "height": 35}', 'c1000007-0000-4000-8000-000000000007', 's1000004-0000-4000-8000-000000000004', 100, true, NOW(), NOW()),
('p1000015-0000-4000-8000-000000000015', 'Açúcar Refinado 50kg', 'Açúcar cristal refinado para produção de bebidas', 'MAT-ACUC-018', '6201234567018', '12000.00', '50.000', '{"length": 80, "width": 50, "height": 15}', 'c1000007-0000-4000-8000-000000000007', 's1000003-0000-4000-8000-000000000003', 500, true, NOW(), NOW()),
('p1000016-0000-4000-8000-000000000016', 'CO2 Alimentar 20kg', 'Dióxido de carbono grau alimentar para gaseificação', 'MAT-CO2-019', '6201234567019', '8500.00', '65.000', '{"length": 25, "width": 25, "height": 150}', 'c1000007-0000-4000-8000-000000000007', 's1000005-0000-4000-8000-000000000005', 50, true, NOW(), NOW()),
-- EMBALAGENS
('p1000017-0000-4000-8000-000000000017', 'Garrafa Vidro 330ml (cx 24un)', 'Garrafas de vidro transparente para cervejas e cidras', 'EMB-GAR-020', '6201234567020', '2400.00', '12.000', '{"length": 30, "width": 20, "height": 25}', 'c1000008-0000-4000-8000-000000000008', 's1000002-0000-4000-8000-000000000002', 2000, true, NOW(), NOW()),
('p1000018-0000-4000-8000-000000000018', 'Lata Alumínio 350ml (cx 50un)', 'Latas de alumínio para refrigerantes e energéticos', 'EMB-LAT-021', '6201234567021', '4500.00', '8.000', '{"length": 35, "width": 25, "height": 25}', 'c1000008-0000-4000-8000-000000000008', 's1000002-0000-4000-8000-000000000002', 1000, true, NOW(), NOW());

-- ===== 6. INVENTORY =====
INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity, created_at, updated_at) VALUES
-- Blue Cola Original em todos os armazéns
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 5500, 550, NOW(), NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000002-0000-4000-8000-000000000002', 2200, 220, NOW(), NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000003-0000-4000-8000-000000000003', 1800, 180, NOW(), NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000004-0000-4000-8000-000000000004', 1500, 150, NOW(), NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000005-0000-4000-8000-000000000005', 800, 80, NOW(), NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000006-0000-4000-8000-000000000006', 1200, 120, NOW(), NOW()),
-- Pura Natural
('p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 4200, 420, NOW(), NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000002-0000-4000-8000-000000000002', 1800, 180, NOW(), NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000003-0000-4000-8000-000000000003', 1500, 150, NOW(), NOW()),
-- Tigra Original
('p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 1200, 120, NOW(), NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000002-0000-4000-8000-000000000002', 800, 80, NOW(), NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000003-0000-4000-8000-000000000003', 600, 60, NOW(), NOW()),
-- Outros produtos em Luanda (principal)
('p1000002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 1500, 150, NOW(), NOW()),
('p1000003-0000-4000-8000-000000000003', 'w1000001-0000-4000-8000-000000000001', 1200, 120, NOW(), NOW()),
('p1000005-0000-4000-8000-000000000005', 'w1000001-0000-4000-8000-000000000001', 2200, 220, NOW(), NOW()),
('p1000006-0000-4000-8000-000000000006', 'w1000001-0000-4000-8000-000000000001', 900, 90, NOW(), NOW()),
('p1000007-0000-4000-8000-000000000007', 'w1000001-0000-4000-8000-000000000001', 750, 75, NOW(), NOW()),
('p1000009-0000-4000-8000-000000000009', 'w1000001-0000-4000-8000-000000000001', 650, 65, NOW(), NOW()),
('p1000010-0000-4000-8000-000000000010', 'w1000001-0000-4000-8000-000000000001', 420, 42, NOW(), NOW()),
('p1000011-0000-4000-8000-000000000011', 'w1000001-0000-4000-8000-000000000001', 380, 38, NOW(), NOW()),
('p1000012-0000-4000-8000-000000000012', 'w1000001-0000-4000-8000-000000000001', 590, 59, NOW(), NOW()),
('p1000013-0000-4000-8000-000000000013', 'w1000001-0000-4000-8000-000000000001', 720, 72, NOW(), NOW()),
-- Matérias-primas
('p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 85, 8, NOW(), NOW()),
('p1000015-0000-4000-8000-000000000015', 'w1000001-0000-4000-8000-000000000001', 420, 42, NOW(), NOW()),
('p1000016-0000-4000-8000-000000000016', 'w1000001-0000-4000-8000-000000000001', 35, 3, NOW(), NOW()),
-- Embalagens
('p1000017-0000-4000-8000-000000000017', 'w1000001-0000-4000-8000-000000000001', 1800, 180, NOW(), NOW()),
('p1000018-0000-4000-8000-000000000018', 'w1000001-0000-4000-8000-000000000001', 950, 95, NOW(), NOW());

-- ===== 7. PRODUCT LOCATIONS =====
INSERT INTO product_locations (id, product_id, warehouse_id, zone, shelf, bin, last_scanned, scanned_by_user_id, created_at, updated_at) VALUES
('l1000001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'A', 'A01', 'A01-01', NOW(), 'u1000006-0000-4000-8000-000000000006', NOW(), NOW()),
('l1000002-0000-4000-8000-000000000002', 'p1000001-0000-4000-8000-000000000001', 'w1000002-0000-4000-8000-000000000002', 'A', 'A02', 'A02-01', NOW(), 'u1000005-0000-4000-8000-000000000005', NOW(), NOW()),
('l1000003-0000-4000-8000-000000000003', 'p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'A', 'A03', 'A03-01', NOW(), 'u1000006-0000-4000-8000-000000000006', NOW(), NOW()),
('l1000004-0000-4000-8000-000000000004', 'p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 'B', 'B01', 'B01-01', NOW(), 'u1000005-0000-4000-8000-000000000005', NOW(), NOW()),
('l1000005-0000-4000-8000-000000000005', 'p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 'D', 'D01', 'D01-01', NOW(), 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('l1000006-0000-4000-8000-000000000006', 'p1000017-0000-4000-8000-000000000017', 'w1000001-0000-4000-8000-000000000001', 'C', 'C01', 'C01-01', NOW(), 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('l1000007-0000-4000-8000-000000000007', 'p1000002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 'A', 'A04', 'A04-01', NOW(), 'u1000006-0000-4000-8000-000000000006', NOW(), NOW()),
('l1000008-0000-4000-8000-000000000008', 'p1000003-0000-4000-8000-000000000003', 'w1000001-0000-4000-8000-000000000001', 'A', 'A05', 'A05-01', NOW(), 'u1000006-0000-4000-8000-000000000006', NOW(), NOW());

-- ===== 8. STOCK MOVEMENTS =====
INSERT INTO stock_movements (product_id, warehouse_id, type, quantity, reference, reason, user_id, created_at) VALUES
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'in', 1000, 'REF-PROD-001', 'Receção produção', 'u1000007-0000-4000-8000-000000000007', NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'out', -350, 'REF-VND-001', 'Venda Shoprite', 'u1000006-0000-4000-8000-000000000006', NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'in', 800, 'REF-PROD-002', 'Receção produção', 'u1000007-0000-4000-8000-000000000007', NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 'in', 500, 'REF-PROD-003', 'Receção produção', 'u1000007-0000-4000-8000-000000000007', NOW()),
('p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 'in', 25, 'REF-COM-001', 'Compra concentrados', 'u1000007-0000-4000-8000-000000000007', NOW());

-- ===== 9. ORDERS =====
INSERT INTO orders (id, order_number, type, status, customer_name, customer_email, customer_phone, customer_address, supplier_id, total_amount, notes, user_id, created_at, updated_at) VALUES
('o1000001-0000-4000-8000-000000000001', 'REF-VND-2025-001', 'sale', 'processing', 'Shoprite Angola', 'fornecedores@shoprite.ao', '+244 222 640 100', 'Av. 4 de Fevereiro, Maianga, Luanda', NULL, '125000.00', 'Encomenda semanal para rede Shoprite', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('o1000002-0000-4000-8000-000000000002', 'REF-VND-2025-002', 'sale', 'shipped', 'Jumbo Belas Shopping', 'compras@jumbo.ao', '+244 222 123 789', 'Belas Shopping, Talatona, Luanda', NULL, '89500.00', 'Reposição semanal', 'u1000003-0000-4000-8000-000000000003', NOW(), NOW()),
('o1000003-0000-4000-8000-000000000003', 'REF-COM-2025-001', 'purchase', 'confirmed', 'Concentrados Tropicais', 'vendas@concentrados.ao', '+244 222 456 789', 'Benguela, Terminal Industrial', 's1000004-0000-4000-8000-000000000004', '450000.00', 'Compra mensal de concentrados', 'u1000001-0000-4000-8000-000000000001', NOW(), NOW());

-- ===== 10. ORDER ITEMS =====
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
('o1000001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 200, '200.00', '40000.00', NOW(), NOW()),
('o1000001-0000-4000-8000-000000000001', 'p1000004-0000-4000-8000-000000000004', 300, '120.00', '36000.00', NOW(), NOW()),
('o1000001-0000-4000-8000-000000000001', 'p1000008-0000-4000-8000-000000000008', 100, '350.00', '35000.00', NOW(), NOW()),
('o1000002-0000-4000-8000-000000000002', 'p1000001-0000-4000-8000-000000000001', 150, '200.00', '30000.00', NOW(), NOW()),
('o1000002-0000-4000-8000-000000000002', 'p1000003-0000-4000-8000-000000000003', 120, '180.00', '21600.00', NOW(), NOW()),
('o1000003-0000-4000-8000-000000000003', 'p1000014-0000-4000-8000-000000000014', 18, '25000.00', '450000.00', NOW(), NOW());

-- ===== 11. SHIPMENTS =====
INSERT INTO shipments (id, shipment_number, order_id, status, carrier, tracking_number, shipping_address, estimated_delivery, actual_delivery, user_id, created_at, updated_at) VALUES
('h1000001-0000-4000-8000-000000000001', 'SHIP-REF-001', 'o1000002-0000-4000-8000-000000000002', 'delivered', 'Transangol Expresso', 'TRA20250830001', 'Belas Shopping, Talatona, Luanda', NULL, NOW(), 'u1000003-0000-4000-8000-000000000003', NOW(), NOW()),
('h1000002-0000-4000-8000-000000000002', 'SHIP-REF-002', 'o1000001-0000-4000-8000-000000000001', 'in_transit', 'Refriango Transport', 'REF20250830002', 'Av. 4 de Fevereiro, Maianga, Luanda', NOW() + INTERVAL '1 day', NULL, 'u1000003-0000-4000-8000-000000000003', NOW(), NOW());

-- ===== 12. ALERTS =====
INSERT INTO alerts (type, priority, title, message, status, entity_type, entity_id, user_id, created_at, updated_at) VALUES
('low_stock', 'high', 'Stock Baixo - Blue Cola Original', 'Blue Cola Original está abaixo do nível mínimo no armazém Huambo', 'active', 'product', 'p1000001-0000-4000-8000-000000000001', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('reorder_point', 'medium', 'Ponto de Reabastecimento', 'Concentrado Cola Blue atingiu ponto de reabastecimento', 'active', 'product', 'p1000014-0000-4000-8000-000000000014', 'u1000001-0000-4000-8000-000000000001', NOW(), NOW()),
('quality', 'high', 'Controlo Qualidade', 'Lote de garrafas com qualidade suspeita detectada', 'pending', 'product', 'p1000017-0000-4000-8000-000000000017', 'u1000004-0000-4000-8000-000000000004', NOW(), NOW());

-- ===== 13. RETURNS =====
INSERT INTO returns (id, return_number, type, status, original_order_id, customer_id, reason, condition, total_amount, refund_method, notes, user_id, created_at, updated_at) VALUES
('r1000001-0000-4000-8000-000000000001', 'RET-REF-001', 'customer', 'pending', 'o1000002-0000-4000-8000-000000000002', 'JUMBO-001', 'damaged', 'damaged', '4000.00', 'credit', 'Garrafas danificadas durante transporte', 'u1000004-0000-4000-8000-000000000004', NOW(), NOW());

INSERT INTO return_items (return_id, product_id, quantity, reason, condition, unit_price, refund_amount, restockable, restocked, warehouse_id, quality_notes, created_at, updated_at) VALUES
('r1000001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 20, 'damaged', 'damaged', '200.00', '4000.00', false, false, 'w1000001-0000-4000-8000-000000000001', 'Garrafas rachadas', NOW(), NOW());

-- ===== 14. NOTIFICATION PREFERENCES =====
INSERT INTO notification_preferences (user_id, alert_type, channel, enabled, created_at, updated_at) VALUES
('u1000001-0000-4000-8000-000000000001', 'low_stock', 'email', true, NOW(), NOW()),
('u1000001-0000-4000-8000-000000000001', 'low_stock', 'in_app', true, NOW(), NOW()),
('u1000002-0000-4000-8000-000000000002', 'reorder_point', 'email', true, NOW(), NOW()),
('u1000003-0000-4000-8000-000000000003', 'quality', 'in_app', true, NOW(), NOW()),
('u1000004-0000-4000-8000-000000000004', 'system', 'email', true, NOW(), NOW());

-- ===== 15. BARCODE SCANS =====
INSERT INTO barcode_scans (scanned_code, scan_type, product_id, warehouse_id, location_id, scan_purpose, user_id, metadata, created_at) VALUES
('6201234567001', 'barcode', 'p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'l1000001-0000-4000-8000-000000000001', 'inventory', 'u1000006-0000-4000-8000-000000000006', '{"device": "Motorola TC20", "battery": "85%"}', NOW()),
('6201234567004', 'barcode', 'p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'l1000003-0000-4000-8000-000000000003', 'picking', 'u1000005-0000-4000-8000-000000000005', '{"device": "Zebra TC57", "battery": "92%"}', NOW()),
('6201234567017', 'barcode', 'p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 'l1000005-0000-4000-8000-000000000005', 'receiving', 'u1000007-0000-4000-8000-000000000007', '{"device": "Honeywell CT40", "battery": "78%"}', NOW());

-- ===== 16. INVENTORY COUNTS =====
INSERT INTO inventory_counts (id, count_number, type, status, warehouse_id, scheduled_date, completed_date, user_id, notes, created_at, updated_at) VALUES
('ic100001-0000-4000-8000-000000000001', 'INV-REF-2025-001', 'cycle', 'completed', 'w1000001-0000-4000-8000-000000000001', NOW(), NOW(), 'u1000004-0000-4000-8000-000000000004', 'Contagem cíclica semanal', NOW(), NOW()),
('ic100002-0000-4000-8000-000000000002', 'INV-REF-2025-002', 'spot', 'in_progress', 'w1000002-0000-4000-8000-000000000002', NOW(), NULL, 'u1000008-0000-4000-8000-000000000008', 'Verificação específica', NOW(), NOW());

INSERT INTO inventory_count_items (count_id, product_id, expected_quantity, counted_quantity, variance, reconciled, counted_by_user_id, counted_at, created_at, updated_at) VALUES
('ic100001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 5500, 5498, -2, true, 'u1000005-0000-4000-8000-000000000005', NOW(), NOW(), NOW()),
('ic100001-0000-4000-8000-000000000001', 'p1000004-0000-4000-8000-000000000004', 4200, 4205, 5, true, 'u1000005-0000-4000-8000-000000000005', NOW(), NOW(), NOW()),
('ic100002-0000-4000-8000-000000000002', 'p1000001-0000-4000-8000-000000000001', 2200, NULL, NULL, false, NULL, NULL, NOW(), NOW());

-- ===== 17. PICKING LISTS =====
INSERT INTO picking_lists (id, pick_number, order_id, warehouse_id, status, priority, assigned_to, type, scheduled_date, started_at, estimated_time, notes, user_id, created_at, updated_at) VALUES
('pl100001-0000-4000-8000-000000000001', 'PICK-REF-001', 'o1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'in_progress', 'high', 'u1000006-0000-4000-8000-000000000006', 'order', NOW(), NOW(), 45, 'Picking urgente Shoprite', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('pl100002-0000-4000-8000-000000000002', 'PICK-REF-002', 'o1000002-0000-4000-8000-000000000002', 'w1000002-0000-4000-8000-000000000002', 'completed', 'medium', 'u1000005-0000-4000-8000-000000000005', 'order', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 60, 'Picking Jumbo concluído', 'u1000003-0000-4000-8000-000000000003', NOW(), NOW());

INSERT INTO picking_list_items (picking_list_id, product_id, location_id, quantity_to_pick, quantity_picked, status, picked_by, picked_at, created_at, updated_at) VALUES
('pl100001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 'l1000001-0000-4000-8000-000000000001', 200, 140, 'partial', 'u1000006-0000-4000-8000-000000000006', NOW(), NOW(), NOW()),
('pl100001-0000-4000-8000-000000000001', 'p1000004-0000-4000-8000-000000000004', 'l1000003-0000-4000-8000-000000000003', 300, 0, 'pending', NULL, NULL, NOW(), NOW()),
('pl100002-0000-4000-8000-000000000002', 'p1000001-0000-4000-8000-000000000001', 'l1000002-0000-4000-8000-000000000002', 150, 150, 'completed', 'u1000005-0000-4000-8000-000000000005', NOW() - INTERVAL '1 hour', NOW(), NOW()),
('pl100002-0000-4000-8000-000000000002', 'p1000003-0000-4000-8000-000000000003', 'l1000008-0000-4000-8000-000000000008', 120, 120, 'completed', 'u1000005-0000-4000-8000-000000000005', NOW() - INTERVAL '1 hour', NOW(), NOW());

-- ===== TABELAS AVANÇADAS =====

-- ===== 18. ASN =====
INSERT INTO asn (id, asn_number, supplier_id, warehouse_id, po_number, status, transport_mode, carrier, tracking_number, estimated_arrival, actual_arrival, total_weight, total_volume, notes, user_id, created_at, updated_at) VALUES
('a1000001-0000-4000-8000-000000000001', 'ASN-REF-2025-001', 's1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'PO-2025-MAT-001', 'pending', 'truck', 'Transangol Carga', 'TCA-2025-001', NOW() + INTERVAL '2 days', NULL, '1400.000', '28.000', 'Entrega mensal concentrados', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('a1000002-0000-4000-8000-000000000002', 'ASN-REF-2025-002', 's1000002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 'PO-2025-EMB-001', 'arrived', 'truck', 'Owens Transport', 'OWE-2025-001', NOW() - INTERVAL '1 hour', NOW(), '2500.000', '45.000', 'Embalagens latas 350ml', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW());

INSERT INTO asn_line_items (asn_id, product_id, expected_quantity, unit_of_measure, lot_number, expiry_date, packaging, expected_weight, expected_dimensions, notes, created_at, updated_at) VALUES
('a1000001-0000-4000-8000-000000000001', 'p1000014-0000-4000-8000-000000000014', 50, 'EA', 'LOT-CONC-202501', NOW() + INTERVAL '1 year', 'pallet', '1400.000', '{"length": 120, "width": 80, "height": 140}', 'Pallet completo', NOW(), NOW()),
('a1000002-0000-4000-8000-000000000002', 'p1000018-0000-4000-8000-000000000018', 100, 'CX', 'LOT-LAT-202501', NULL, 'box', '800.000', '{"length": 70, "width": 50, "height": 50}', 'Latas 350ml', NOW(), NOW());

-- ===== 19. RECEIVING RECEIPTS =====
INSERT INTO receiving_receipts (id, receipt_number, asn_id, warehouse_id, status, receiving_method, total_expected, total_received, discrepancies, damage_reported, received_by, supervisor_approval, started_at, completed_at, notes, created_at, updated_at) VALUES
('rr100001-0000-4000-8000-000000000001', 'REC-REF-001', 'a1000002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 'completed', 'barcode', 100, 98, 2, false, 'u1000007-0000-4000-8000-000000000007', 'u1000004-0000-4000-8000-000000000004', NOW() - INTERVAL '2 hours', NOW(), 'Receção latas - 2 caixas danificadas', NOW(), NOW()),
('rr100002-0000-4000-8000-000000000002', 'REC-REF-002', 'a1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'receiving', 'computer_vision', 50, 25, 0, false, 'u1000007-0000-4000-8000-000000000007', NULL, NOW(), NULL, 'Receção concentrados - em progresso', NOW(), NOW());

INSERT INTO receiving_receipt_items (receipt_id, product_id, expected_quantity, received_quantity, variance, variance_reason, condition, lot_number, actual_weight, location_id, quality_notes, created_at, updated_at) VALUES
('rr100001-0000-4000-8000-000000000001', 'p1000018-0000-4000-8000-000000000018', 100, 98, -2, 'damage', 'good', 'LOT-LAT-202501', '784.000', 'l1000001-0000-4000-8000-000000000001', '2 caixas com amolgadelas', NOW(), NOW()),
('rr100002-0000-4000-8000-000000000002', 'p1000014-0000-4000-8000-000000000014', 25, 25, 0, NULL, 'good', 'LOT-CONC-202501', '700.000', 'l1000005-0000-4000-8000-000000000005', 'Perfeito estado', NOW(), NOW());

-- ===== 20. CV COUNTING RESULTS =====
INSERT INTO cv_counting_results (session_id, image_url, product_id, detected_count, confidence, algorithm, bounding_boxes, dimensions, weight, damage, manual_verification, manual_count, verified_by, status, metadata, processing_time, created_at) VALUES
('CV-SESSION-001', '/cv-images/blue-cola-count-001.jpg', 'p1000001-0000-4000-8000-000000000001', 245, '0.9150', 'yolo_v8', '[{"x": 10, "y": 15, "width": 50, "height": 60}]', '{"length": 30, "width": 20, "height": 25}', '85.750', '{"detected": false, "confidence": 0.95}', true, 248, 'u1000004-0000-4000-8000-000000000004', 'verified', '{"camera": "Intel RealSense", "lighting": "optimal"}', 1250, NOW()),
('CV-SESSION-002', '/cv-images/pura-water-count-001.jpg', 'p1000004-0000-4000-8000-000000000004', 180, '0.8750', 'yolo_v8', '[{"x": 5, "y": 10, "width": 40, "height": 50}]', '{"length": 28, "width": 18, "height": 20}', '93.600', '{"detected": false, "confidence": 0.98}', false, NULL, NULL, 'pending', '{"camera": "Intel RealSense", "lighting": "good"}', 980, NOW()),
('CV-SESSION-003', '/cv-images/tigra-beer-count-001.jpg', 'p1000008-0000-4000-8000-000000000008', 125, '0.9350', 'yolo_v8', '[{"x": 8, "y": 12, "width": 45, "height": 55}]', '{"length": 35, "width": 21, "height": 25}', '68.750', '{"detected": true, "confidence": 0.82}', true, 123, 'u1000004-0000-4000-8000-000000000004', 'verified', '{"camera": "Intel RealSense", "lighting": "moderate", "damage_type": "minor_scratches"}', 1180, NOW());

-- ===== 21. PUTAWAY RULES =====
INSERT INTO putaway_rules (id, name, priority, warehouse_id, product_criteria, location_criteria, strategy, cross_dock_eligible, cross_dock_criteria, max_capacity_utilization, is_active, user_id, created_at, updated_at) VALUES
('pr100001-0000-4000-8000-000000000001', 'Produtos Refrigerados - Zona A', 1, 'w1000001-0000-4000-8000-000000000001', '{"categories": ["Refrigerantes", "Cervejas"]}', '{"zone": "A", "temperature": "controlled"}', 'closest_empty', true, '{"velocity": "high", "orderFrequency": "daily"}', '0.8500', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('pr100002-0000-4000-8000-000000000002', 'Matérias-Primas - Zona Segura', 2, 'w1000001-0000-4000-8000-000000000001', '{"categories": ["Matérias-Primas"]}', '{"zone": "D", "securityLevel": "high"}', 'fixed', false, '{}', '0.7000', true, 'u1000001-0000-4000-8000-000000000001', NOW(), NOW()),
('pr100003-0000-4000-8000-000000000003', 'Embalagens - Zona Staging', 3, 'w1000001-0000-4000-8000-000000000001', '{"categories": ["Embalagens"]}', '{"zone": "C", "access": "easy"}', 'by_size', false, '{}', '0.9000', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW());

-- ===== 22. PUTAWAY TASKS =====
INSERT INTO putaway_tasks (id, task_number, receipt_item_id, product_id, warehouse_id, quantity, suggested_location_id, actual_location_id, rule_applied, status, priority, assigned_to, is_cross_dock, started_at, completed_at, travel_distance, estimated_time, actual_time, notes, user_id, created_at, updated_at) VALUES
('pt100001-0000-4000-8000-000000000001', 'PUT-REF-001', 'rr100001-0000-4000-8000-000000000001', 'p1000018-0000-4000-8000-000000000018', 'w1000001-0000-4000-8000-000000000001', 98, 'l1000006-0000-4000-8000-000000000006', 'l1000006-0000-4000-8000-000000000006', 'pr100003-0000-4000-8000-000000000003', 'completed', 'high', 'u1000005-0000-4000-8000-000000000005', false, NOW() - INTERVAL '1 hour', NOW(), '45.50', 15, 12, 'Colocação zona embalagens', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('pt100002-0000-4000-8000-000000000002', 'PUT-REF-002', 'rr100002-0000-4000-8000-000000000002', 'p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 25, 'l1000005-0000-4000-8000-000000000005', NULL, 'pr100002-0000-4000-8000-000000000002', 'pending', 'medium', 'u1000005-0000-4000-8000-000000000005', false, NULL, NULL, '120.00', 25, NULL, 'Zona segura matérias-primas', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW());

-- ===== 23. SSCC PALLETS =====
INSERT INTO sscc_pallets (id, sscc_code, pallet_type, status, warehouse_id, location_id, max_weight, max_height, current_weight, current_height, item_count, mixed_products, pallet_label, user_id, created_at, updated_at) VALUES
('sp100001-0000-4000-8000-000000000001', '120425000000000001', 'euro', 'completed', 'w1000001-0000-4000-8000-000000000001', 'l1000001-0000-4000-8000-000000000001', '1000.000', '180.00', '450.500', '120.00', 48, false, '{"title": "Blue Cola Original", "barcode": "PLT-001"}', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('sp100002-0000-4000-8000-000000000002', '120425000000000002', 'standard', 'building', 'w1000001-0000-4000-8000-000000000001', NULL, '800.000', '200.00', '120.000', '40.00', 12, true, '{"title": "Mixed Refriango", "barcode": "PLT-002"}', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW());

INSERT INTO pallet_items (pallet_id, product_id, quantity, lot_number, expiry_date, weight, dimensions, position, added_by, created_at, updated_at) VALUES
('sp100001-0000-4000-8000-000000000001', 'p1000001-0000-4000-8000-000000000001', 48, 'LOT-BLUE-20250830', NOW() + INTERVAL '180 days', '16.800', '{"length": 30, "width": 20, "height": 25}', '{"x": 0, "y": 0, "z": 0}', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW()),
('sp100002-0000-4000-8000-000000000002', 'p1000004-0000-4000-8000-000000000004', 12, 'LOT-PURA-20250830', NOW() + INTERVAL '1 year', '6.240', '{"length": 21, "width": 14, "height": 20}', '{"x": 0, "y": 1, "z": 0}', 'u1000007-0000-4000-8000-000000000007', NOW(), NOW());

-- ===== 24. REPLENISHMENT RULES =====
INSERT INTO replenishment_rules (id, name, product_id, warehouse_id, location_id, strategy, min_level, max_level, reorder_point, replenish_quantity, lead_time_days, safety_stock, abc_classification, velocity_category, seasonal_factor, is_active, user_id, created_at, updated_at) VALUES
('rr100001-0000-4000-8000-000000000001', 'Blue Cola Original - Regra Principal', 'p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'l1000001-0000-4000-8000-000000000001', 'demand_based', 2000, 10000, 3000, 5000, 2, 1000, 'A', 'fast', '1.0000', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('rr100002-0000-4000-8000-000000000002', 'Pura Natural - Regra Principal', 'p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'l1000003-0000-4000-8000-000000000003', 'demand_based', 3000, 15000, 4500, 7500, 1, 1500, 'A', 'fast', '1.0000', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('rr100003-0000-4000-8000-000000000003', 'Tigra Original - Regra Secundária', 'p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 'l1000004-0000-4000-8000-000000000004', 'velocity_based', 1000, 5000, 1500, 2500, 3, 500, 'B', 'medium', '1.2000', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW());

-- ===== 25. REPLENISHMENT TASKS =====
INSERT INTO replenishment_tasks (id, task_number, product_id, warehouse_id, from_location_id, to_location_id, rule_id, trigger_reason, quantity_required, quantity_available, quantity_to_move, quantity_moved, priority, status, assigned_to, urgency_score, estimated_stockout, scheduled_for, started_at, completed_at, notes, user_id, created_at, updated_at) VALUES
('rt100001-0000-4000-8000-000000000001', 'REPL-REF-001', 'p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'l1000002-0000-4000-8000-000000000002', 'l1000001-0000-4000-8000-000000000001', 'rr100001-0000-4000-8000-000000000001', 'min_level', 5000, 5000, 5000, 5000, 'medium', 'completed', 'u1000005-0000-4000-8000-000000000005', '7.85', NOW() + INTERVAL '7 days', NOW(), NOW() - INTERVAL '2 hours', NOW(), 'Reabastecimento concluído', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('rt100002-0000-4000-8000-000000000002', 'REPL-REF-002', 'p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'l1000003-0000-4000-8000-000000000003', 'l1000001-0000-4000-8000-000000000001', 'rr100002-0000-4000-8000-000000000002', 'forecast', 7500, 7500, 7500, 0, 'high', 'pending', 'u1000005-0000-4000-8000-000000000005', '8.75', NOW() + INTERVAL '5 days', NOW() + INTERVAL '1 day', NULL, NULL, 'Reabastecimento agendado', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW());

-- ===== 26. DEMAND FORECASTS =====
INSERT INTO demand_forecasts (product_id, warehouse_id, forecast_date, forecast_period, predicted_demand, confidence, model_version, algorithm, features, metadata, created_at) VALUES
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', NOW() + INTERVAL '7 days', 'weekly', '1250', '0.8950', '2.1.0', 'lstm', '{"seasonality": true, "promotions": true, "weather": false}', '{"training_samples": 1000, "accuracy": 0.85}', NOW()),
('p1000001-0000-4000-8000-000000000001', 'w1000002-0000-4000-8000-000000000002', NOW() + INTERVAL '7 days', 'weekly', '450', '0.8750', '2.1.0', 'lstm', '{"seasonality": true, "promotions": true, "weather": false}', '{"training_samples": 800, "accuracy": 0.83}', NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', NOW() + INTERVAL '7 days', 'weekly', '980', '0.9150', '2.1.0', 'lstm', '{"seasonality": true, "promotions": false, "weather": true}', '{"training_samples": 1200, "accuracy": 0.88}', NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', NOW() + INTERVAL '7 days', 'weekly', '320', '0.8250', '2.1.0', 'lstm', '{"seasonality": true, "promotions": true, "weather": false}', '{"training_samples": 600, "accuracy": 0.80}', NOW());

-- ===== 27. PICKING VELOCITY =====
INSERT INTO picking_velocity (product_id, warehouse_id, location_id, date, period, total_picked, picking_events, average_pick_time, peak_hour, velocity_score, abc_class, trend_direction, created_at) VALUES
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'l1000001-0000-4000-8000-000000000001', NOW(), 'daily', 245, 45, '12.50', 10, '9.2500', 'A', 'up', NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'l1000003-0000-4000-8000-000000000003', NOW(), 'daily', 180, 32, '15.75', 11, '8.7500', 'A', 'stable', NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 'l1000004-0000-4000-8000-000000000004', NOW(), 'daily', 95, 18, '22.30', 14, '6.5000', 'B', 'down', NOW()),
('p1000002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 'l1000007-0000-4000-8000-000000000007', NOW(), 'daily', 125, 25, '18.45', 13, '7.2500', 'B', 'stable', NOW());

-- ===== 28. WAREHOUSE ZONES =====
INSERT INTO warehouse_zones (warehouse_id, name, type, coordinates, capacity, current_utilization, is_active, created_at, updated_at) VALUES
('w1000001-0000-4000-8000-000000000001', 'Zona RECEIVING', 'receiving', '{"x": 0, "y": 0, "width": 40, "height": 30, "z": 0, "floor": 1}', '{"maxItems": 1000, "maxWeight": 50000, "maxVolume": 500}', '{"items": 650, "weight": 32500, "volume": 325, "percentage": 65}', true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Zona STORAGE', 'storage', '{"x": 50, "y": 0, "width": 40, "height": 30, "z": 0, "floor": 1}', '{"maxItems": 2000, "maxWeight": 100000, "maxVolume": 1000}', '{"items": 1450, "weight": 72500, "volume": 725, "percentage": 73}', true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Zona PICKING', 'picking', '{"x": 100, "y": 0, "width": 40, "height": 30, "z": 0, "floor": 1}', '{"maxItems": 800, "maxWeight": 40000, "maxVolume": 400}', '{"items": 520, "weight": 26000, "volume": 260, "percentage": 65}', true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Zona SHIPPING', 'shipping', '{"x": 150, "y": 0, "width": 40, "height": 30, "z": 0, "floor": 1}', '{"maxItems": 500, "maxWeight": 25000, "maxVolume": 250}', '{"items": 180, "weight": 9000, "volume": 90, "percentage": 36}', true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Zona STAGING', 'staging', '{"x": 200, "y": 0, "width": 40, "height": 30, "z": 0, "floor": 1}', '{"maxItems": 300, "maxWeight": 15000, "maxVolume": 150}', '{"items": 125, "weight": 6250, "volume": 63, "percentage": 42}', true, NOW(), NOW());

-- ===== 29. WAREHOUSE LAYOUT =====
INSERT INTO warehouse_layout (id, warehouse_id, name, version, layout_data, is_active, created_by, created_at, updated_at) VALUES
('wl100001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'Layout Centro Luanda', '1.0', '{"dimensions": {"width": 200, "height": 150, "floors": 1}, "zones": [{"id": "A", "type": "picking", "x": 0, "y": 0, "width": 80, "height": 60}, {"id": "B", "type": "storage", "x": 80, "y": 0, "width": 120, "height": 100}, {"id": "C", "type": "receiving", "x": 0, "y": 60, "width": 50, "height": 45}, {"id": "D", "type": "shipping", "x": 50, "y": 60, "width": 50, "height": 45}], "aisles": [{"id": "A1", "startX": 10, "startY": 10, "endX": 70, "endY": 10, "width": 3}, {"id": "A2", "startX": 10, "startY": 30, "endX": 70, "endY": 30, "width": 3}]}', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('wl100002-0000-4000-8000-000000000002', 'w1000002-0000-4000-8000-000000000002', 'Layout Centro Huambo', '1.0', '{"dimensions": {"width": 150, "height": 100, "floors": 1}, "zones": [{"id": "A", "type": "picking", "x": 0, "y": 0, "width": 60, "height": 40}, {"id": "B", "type": "storage", "x": 60, "y": 0, "width": 90, "height": 60}], "aisles": [{"id": "H1", "startX": 10, "startY": 10, "endX": 50, "endY": 10, "width": 3}]}', true, 'u1000002-0000-4000-8000-000000000002', NOW(), NOW());

-- ===== 30. DIGITAL TWIN SIMULATIONS =====
INSERT INTO digital_twin_simulations (id, warehouse_id, name, type, parameters, results, status, started_at, completed_at, created_by, created_at, updated_at) VALUES
('dt100001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'Simulação Otimização Picking Blue Cola', 'picking_optimization', '{"product_categories": ["Refrigerantes"], "optimization_target": "time"}', '{"time_saved": 25, "efficiency_gain": 15, "route_optimization": "completed"}', 'completed', NOW() - INTERVAL '1 hour', NOW(), 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('dt100002-0000-4000-8000-000000000002', 'w1000001-0000-4000-8000-000000000001', 'Análise Capacidade Zona Picking', 'capacity_planning', '{"zone": "picking", "forecast_period": "30_days"}', '{"current_utilization": 78, "projected_utilization": 85, "recommendations": ["add_shelves", "optimize_layout"]}', 'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('dt100003-0000-4000-8000-000000000003', 'w1000001-0000-4000-8000-000000000001', 'Simulação Green ETA Rota Otimizada', 'route_optimization', '{"delivery_points": 12, "carbon_optimization": true, "fuel_efficiency": "maximize"}', '{"carbon_saved": "12.5kg", "fuel_saved": "8.2L", "route_efficiency": "92%"}', 'running', NOW() - INTERVAL '15 minutes', NULL, 'u1000003-0000-4000-8000-000000000003', NOW(), NOW());

-- ===== 31. SLOTTING ANALYTICS =====
INSERT INTO slotting_analytics (product_id, warehouse_id, current_location, recommended_location, rotation_frequency, picking_distance, affinity_score, seasonality_factor, improvement_potential, status, created_at, updated_at) VALUES
('p1000001-0000-4000-8000-000000000001', 'w1000001-0000-4000-8000-000000000001', 'A01-01', 'A01-01', '15.5000', '12.50', '4.85', '1.00', '25.50', 'optimal', NOW(), NOW()),
('p1000004-0000-4000-8000-000000000004', 'w1000001-0000-4000-8000-000000000001', 'A03-01', 'A02-01', '12.2500', '18.75', '4.20', '0.95', '18.30', 'pending', NOW(), NOW()),
('p1000008-0000-4000-8000-000000000008', 'w1000001-0000-4000-8000-000000000001', 'B01-01', 'A06-01', '8.7500', '45.20', '3.65', '1.20', '35.80', 'pending', NOW(), NOW()),
('p1000014-0000-4000-8000-000000000014', 'w1000001-0000-4000-8000-000000000001', 'D01-01', 'D01-01', '2.5000', '125.00', '2.10', '1.00', '5.20', 'optimal', NOW(), NOW());

-- ===== 32. PRODUCT AFFINITY =====
INSERT INTO product_affinity (product_a, product_b, affinity_score, co_occurrence_count, confidence, created_at) VALUES
('p1000001-0000-4000-8000-000000000001', 'p1000004-0000-4000-8000-000000000004', '4.25', 150, '0.89', NOW()),
('p1000001-0000-4000-8000-000000000001', 'p1000008-0000-4000-8000-000000000008', '3.80', 98, '0.76', NOW()),
('p1000004-0000-4000-8000-000000000004', 'p1000005-0000-4000-8000-000000000005', '4.10', 75, '0.82', NOW()),
('p1000008-0000-4000-8000-000000000008', 'p1000010-0000-4000-8000-000000000010', '4.65', 125, '0.91', NOW()),
('p1000002-0000-4000-8000-000000000002', 'p1000003-0000-4000-8000-000000000003', '3.95', 85, '0.78', NOW());

-- ===== 33. SLOTTING RULES =====
INSERT INTO slotting_rules (warehouse_id, rule_name, conditions, actions, priority, is_active, created_at, updated_at) VALUES
('w1000001-0000-4000-8000-000000000001', 'Produtos A - Zona Picking Rápida', '{"abc_class": "A", "velocity": "high"}', '{"zone": "A", "shelf_height": "eye_level"}', 1, true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Produtos Pesados - Chão', '{"weight_min": 20}', '{"zone": "B", "shelf_height": "ground"}', 2, true, NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'Matérias-Primas - Zona Segura', '{"category": "Matérias-Primas"}', '{"zone": "D", "security_level": "high"}', 3, true, NOW(), NOW());

-- ===== 34. ML MODELS =====
INSERT INTO ml_models (model_name, model_type, version, parameters, training_data, accuracy, status, deployed_at, created_at, updated_at) VALUES
('Refriango Demand Forecast V2.1', 'demand_forecast', '2.1.0', '{"algorithm": "lstm", "layers": 3, "neurons": 64}', '{"samples": 50000, "features": 15, "accuracy": 0.87}', '0.8700', 'deployed', NOW(), NOW(), NOW()),
('Slotting Optimization Refriango', 'slotting_optimization', '1.5.0', '{"algorithm": "genetic", "generations": 100, "population": 50}', '{"historical_picks": 25000, "efficiency_metrics": true}', '0.9200', 'ready', NULL, NOW(), NOW()),
('Affinity Analysis Model', 'affinity_analysis', '1.0.0', '{"min_support": 0.1, "confidence_threshold": 0.7}', '{"transactions": 15000, "products": 50}', '0.8500', 'training', NULL, NOW(), NOW()),
('Computer Vision YOLO V8 Refriango', 'computer_vision', '8.2.0', '{"architecture": "yolo_v8", "input_size": 640, "confidence_threshold": 0.7}', '{"images": 100000, "annotations": 500000, "products": 200}', '0.9350', 'deployed', NOW(), NOW(), NOW());

-- ===== 35. OPTIMIZATION JOBS =====
INSERT INTO optimization_jobs (job_type, warehouse_id, parameters, results, status, started_at, completed_at, execution_time, improvement_metrics, created_by, created_at, updated_at) VALUES
('weekly_slotting_optimization', 'w1000001-0000-4000-8000-000000000001', '{"products": "all", "criteria": "picking_efficiency"}', '{"improvements": 25, "relocations": 12, "efficiency_gain": "18%"}', 'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 7500, '{"distance_saved": "45m per pick", "time_saved": "15 seconds"}', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('inventory_rebalancing', 'w1000001-0000-4000-8000-000000000001', '{"threshold": "auto", "target": "space_optimization"}', '{}', 'running', NOW() - INTERVAL '30 minutes', NULL, NULL, '{}', 'u1000002-0000-4000-8000-000000000002', NOW(), NOW()),
('carbon_footprint_optimization', 'w1000001-0000-4000-8000-000000000001', '{"scope": "logistics", "target": "reduce_emissions"}', '{"co2_reduced": "125kg", "fuel_saved": "45L", "efficiency_gain": "22%"}', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours', 64800, '{"route_optimization": "35%", "load_optimization": "28%"}', 'u1000003-0000-4000-8000-000000000003', NOW(), NOW());

-- ===== 36. AUDIT TRAIL =====
INSERT INTO audit_trail (id, table_name, record_id, operation, old_values, new_values, user_id, ip_address, user_agent, checksum, previous_hash, signature, worm_stored, created_at) VALUES
('at100001-0000-4000-8000-000000000001', 'products', 'p1000001-0000-4000-8000-000000000001', 'CREATE', '{}', '{"name": "Blue Cola Original 330ml", "sku": "BLUE-COLA-001"}', 'u1000001-0000-4000-8000-000000000001', '192.168.1.100', 'Mozilla/5.0 Refriango System', 'a1b2c3d4e5f6789012345678901234567890abcd', NULL, 'digital_signature_data', true, NOW()),
('at100002-0000-4000-8000-000000000002', 'inventory', 'p1000001-0000-4000-8000-000000000001', 'UPDATE', '{"quantity": 1000}', '{"quantity": 1200}', 'u1000005-0000-4000-8000-000000000005', '192.168.1.101', 'Mozilla/5.0 Refriango Mobile', 'b2c3d4e5f6789012345678901234567890abcde', 'a1b2c3d4e5f6789012345678901234567890abcd', 'digital_signature_data_2', true, NOW()),
('at100003-0000-4000-8000-000000000003', 'orders', 'o1000001-0000-4000-8000-000000000001', 'CREATE', '{}', '{"order_number": "REF-VND-2025-001", "customer_name": "Shoprite Angola"}', 'u1000002-0000-4000-8000-000000000002', '192.168.1.102', 'Mozilla/5.0 Refriango Web', 'c3d4e5f6789012345678901234567890abcdef', 'b2c3d4e5f6789012345678901234567890abcde', 'digital_signature_data_3', true, NOW());

-- ===== 37. WORM STORAGE =====
INSERT INTO worm_storage (audit_id, data_hash, encrypted_data, access_count, first_access, last_access, retention, immutable, created_at) VALUES
('at100001-0000-4000-8000-000000000001', 'a1b2c3d4e5f6789012345678901234567890abcd', 'encrypted_a1b2c3d4e5f6789012345678901234567890abcd_data', 2, NOW() - INTERVAL '1 hour', NOW(), NOW() + INTERVAL '7 years', true, NOW()),
('at100002-0000-4000-8000-000000000002', 'b2c3d4e5f6789012345678901234567890abcde', 'encrypted_b2c3d4e5f6789012345678901234567890abcde_data', 1, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '7 years', true, NOW()),
('at100003-0000-4000-8000-000000000003', 'c3d4e5f6789012345678901234567890abcdef', 'encrypted_c3d4e5f6789012345678901234567890abcdef_data', 0, NULL, NULL, NOW() + INTERVAL '7 years', true, NOW());

-- ===== 38. FRAUD DETECTION =====
INSERT INTO fraud_detection (alert_type, severity, description, entity_type, entity_id, risk_score, evidence_data, status, investigated_by, created_at, updated_at) VALUES
('unusual_movement_pattern', 'medium', 'Movimento de stock fora do padrão normal detectado no armazém Luanda', 'stock_movement', 'p1000001-0000-4000-8000-000000000001', '6.75', '{"pattern": "off_hours_activity", "user": "system_detected", "timestamp": "2025-08-30T21:00:00Z"}', 'investigating', 'u1000004-0000-4000-8000-000000000004', NOW(), NOW()),
('inventory_discrepancy', 'high', 'Discrepância significativa na contagem vs sistema para Blue Cola Original', 'inventory_count', 'ic100001-0000-4000-8000-000000000001', '8.25', '{"expected": 1000, "counted": 750, "variance": -250}', 'pending', NULL, NOW(), NOW()),
('suspicious_user_access', 'low', 'Acesso suspeito fora do horário normal de trabalho', 'user', 'u1000005-0000-4000-8000-000000000005', '3.45', '{"login_time": "2025-08-30T02:30:00Z", "ip": "192.168.1.200", "location": "unusual"}', 'resolved', 'u1000001-0000-4000-8000-000000000001', NOW(), NOW());

-- ===== 39. REAL TIME VISUALIZATION =====
INSERT INTO real_time_visualization (warehouse_id, entity_type, entity_id, position, status, metadata, timestamp, created_at) VALUES
('w1000001-0000-4000-8000-000000000001', 'worker', 'u1000006-0000-4000-8000-000000000006', '{"x": 45, "y": 25, "z": 0, "floor": 1, "zone": "A"}', 'active', '{"last_update": "2025-08-30T21:35:00Z", "accuracy": 0.95, "signal_strength": 85}', NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'worker', 'u1000005-0000-4000-8000-000000000005', '{"x": 120, "y": 80, "z": 0, "floor": 1, "zone": "B"}', 'moving', '{"last_update": "2025-08-30T21:35:00Z", "accuracy": 0.92, "signal_strength": 78}', NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'equipment', 'FORK-001', '{"x": 180, "y": 45, "z": 0, "floor": 1, "zone": "D"}', 'idle', '{"last_update": "2025-08-30T21:35:00Z", "accuracy": 0.88, "signal_strength": 72, "battery": "65%"}', NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'product', 'p1000001-0000-4000-8000-000000000001', '{"x": 45, "y": 25, "z": 120, "floor": 1, "zone": "A"}', 'active', '{"last_update": "2025-08-30T21:35:00Z", "accuracy": 0.98, "signal_strength": 88, "rfid_tag": "RF-BLUE-001"}', NOW(), NOW()),
('w1000001-0000-4000-8000-000000000001', 'order', 'o1000001-0000-4000-8000-000000000001', '{"x": 55, "y": 35, "z": 0, "floor": 1, "zone": "A"}', 'processing', '{"last_update": "2025-08-30T21:35:00Z", "accuracy": 1.00, "signal_strength": 95, "progress": "70%"}', NOW(), NOW());

COMMIT;

-- ===== VERIFICAÇÃO FINAL =====
SELECT 'SEED REFRIANGO COMPLETO EXECUTADO COM SUCESSO!' as status;

SELECT table_name, 
       (CASE table_name
         WHEN 'users' THEN (SELECT COUNT(*)::text FROM users)
         WHEN 'products' THEN (SELECT COUNT(*)::text FROM products)
         WHEN 'inventory' THEN (SELECT COUNT(*)::text FROM inventory)
         WHEN 'orders' THEN (SELECT COUNT(*)::text FROM orders)
         WHEN 'warehouse_zones' THEN (SELECT COUNT(*)::text FROM warehouse_zones)
         WHEN 'audit_trail' THEN (SELECT COUNT(*)::text FROM audit_trail)
         WHEN 'ml_models' THEN (SELECT COUNT(*)::text FROM ml_models)
         WHEN 'optimization_jobs' THEN (SELECT COUNT(*)::text FROM optimization_jobs)
         WHEN 'fraud_detection' THEN (SELECT COUNT(*)::text FROM fraud_detection)
         WHEN 'digital_twin_simulations' THEN (SELECT COUNT(*)::text FROM digital_twin_simulations)
         ELSE 'OK'
       END) as registos
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'products', 'inventory', 'orders', 'warehouse_zones', 'audit_trail', 'ml_models', 'optimization_jobs', 'fraud_detection', 'digital_twin_simulations')
ORDER BY table_name;