-- PC Parts Inventory Manager: MySQL table design
-- The web demo stores the same fields in the browser (localStorage).

CREATE DATABASE IF NOT EXISTS pc_inventory;
USE pc_inventory;

CREATE TABLE parts (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)   NOT NULL,
  category      ENUM('Processor', 'Memory', 'Storage', 'Graphics card', 'Power supply', 'Peripheral') NOT NULL,
  price         DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  qty           INT UNSIGNED   NOT NULL DEFAULT 0,
  reorder_level INT UNSIGNED   NOT NULL DEFAULT 3,
  updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO parts (name, category, price, qty, reorder_level) VALUES
  ('AMD Ryzen 5 5600',            'Processor',     6500.00,  4, 2),
  ('Kingston Fury 8GB DDR4 3200', 'Memory',        1350.00,  2, 5),
  ('Samsung 980 1TB NVMe',        'Storage',       3800.00,  7, 3),
  ('RTX 3060 12GB',               'Graphics card', 17500.00, 1, 2),
  ('Seasonic 650W 80+ Gold',      'Power supply',  4500.00,  5, 2),
  ('Logitech G102 Mouse',         'Peripheral',    990.00,  12, 4);

-- Low-stock report
SELECT name, category, qty, reorder_level
FROM parts
WHERE qty <= reorder_level
ORDER BY qty;
