-- Script para criar e popular as tabelas vehicle_types e fuel_types
-- Executar este script diretamente no banco de dados MySQL

-- Criar tabela vehicle_types se não existir
CREATE TABLE IF NOT EXISTS vehicle_types (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'commercial',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela fuel_types se não existir
CREATE TABLE IF NOT EXISTS fuel_types (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'liquid',
  unit VARCHAR(20) NOT NULL DEFAULT 'litros',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Popular tabela vehicle_types
INSERT IGNORE INTO vehicle_types (name, description, category) VALUES
('Camião', 'Veículo pesado para transporte de carga', 'heavy_duty'),
('Carrinha', 'Veículo comercial ligeiro para transporte de carga e passageiros', 'commercial'),
('Autocarro', 'Veículo para transporte público de passageiros', 'passenger'),
('Minibus', 'Veículo de médio porte para transporte de passageiros', 'passenger'),
('Pick-up', 'Veículo utilitário com caixa aberta', 'commercial'),
('Furgão', 'Veículo comercial fechado para transporte de carga', 'commercial'),
('Tractor', 'Veículo para puxar semi-reboques', 'heavy_duty'),
('Semi-reboque', 'Reboque sem eixo dianteiro para transporte de carga pesada', 'heavy_duty'),
('Reboque', 'Veículo rebocado para transporte adicional de carga', 'commercial'),
('Motocicleta', 'Veículo de duas rodas para transporte rápido', 'commercial'),
('Automóvel', 'Veículo ligeiro de passageiros', 'passenger'),
('Todo-o-terreno', 'Veículo 4x4 para terrenos difíceis', 'commercial');

-- Popular tabela fuel_types
INSERT IGNORE INTO fuel_types (name, description, category, unit) VALUES
('Gasóleo', 'Combustível diesel para veículos pesados e comerciais', 'liquid', 'litros'),
('Gasolina', 'Combustível para veículos ligeiros', 'liquid', 'litros'),
('GPL', 'Gás de Petróleo Liquefeito para veículos adaptados', 'gas', 'litros'),
('GNC', 'Gás Natural Comprimido para veículos comerciais', 'gas', 'm³'),
('Eléctrico', 'Energia eléctrica para veículos eléctricos', 'electric', 'kWh'),
('Híbrido Gasolina', 'Sistema híbrido com motor a gasolina e eléctrico', 'hybrid', 'litros'),
('Híbrido Diesel', 'Sistema híbrido com motor diesel e eléctrico', 'hybrid', 'litros'),
('Biodiesel', 'Combustível renovável derivado de óleos vegetais', 'liquid', 'litros'),
('Etanol', 'Combustível renovável derivado de biomassa', 'liquid', 'litros'),
('Hidrogénio', 'Combustível para células de combustível', 'gas', 'kg');

-- Verificar dados inseridos
SELECT 'vehicle_types' as tabela, COUNT(*) as total_registos FROM vehicle_types
UNION ALL
SELECT 'fuel_types' as tabela, COUNT(*) as total_registos FROM fuel_types;