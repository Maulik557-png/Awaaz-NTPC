-- Sample equipment data for NTPC plant
-- Run this in your Supabase SQL Editor

INSERT INTO public.equipment (name, category, model, serial_number, plant_location, status) VALUES
-- Motors
('Motor Unit A1', 'motors', 'ABB M3AA 200L', 'MOT-2023-001', 'unit_a', 'healthy'),
('Motor Unit B3', 'motors', 'Siemens 1LA7 132M', 'MOT-2023-002', 'unit_b', 'healthy'),
('Motor Unit C7', 'motors', 'WEG W22 160M', 'MOT-2023-003', 'unit_c', 'warning'),

-- Pumps
('Pump B3 Main', 'pumps', 'KSB Etanorm 100-200', 'PMP-2023-001', 'unit_b', 'healthy'),
('Pump HX5 Circulation', 'pumps', 'Grundfos CRN 10-10', 'PMP-2023-002', 'hx5_area', 'healthy'),
('Pump Unit T2 Feed', 'pumps', 'Sulzer AHLSTAR A 100-250', 'PMP-2023-003', 'unit_t', 'critical'),

-- Valves
('Valve C7 Control', 'valves', 'Fisher DVC6200', 'VAL-2023-001', 'unit_c', 'healthy'),
('Valve A1 Isolation', 'valves', 'Masoneilan 21000', 'VAL-2023-002', 'unit_a', 'healthy'),
('Valve HX5 Bypass', 'valves', 'Samson 3241', 'VAL-2023-003', 'hx5_area', 'warning'),

-- Turbines
('Turbine T2 Main', 'turbines', 'Siemens SST-400', 'TUR-2023-001', 'unit_t', 'healthy'),
('Turbine A1 Auxiliary', 'turbines', 'GE 7FA.05', 'TUR-2023-002', 'unit_a', 'healthy'),

-- Heat Exchangers
('Heat Exchanger HX5-1', 'heat_exchangers', 'Alfa Laval M10-BFG', 'HEX-2023-001', 'hx5_area', 'healthy'),
('Heat Exchanger HX5-2', 'heat_exchangers', 'SPX Flow APV HX', 'HEX-2023-002', 'hx5_area', 'offline');
