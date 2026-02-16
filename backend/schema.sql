-- Database schema for Brand Search Application

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brand_domains table
CREATE TABLE IF NOT EXISTS brand_domains (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, domain)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_domains_brand_id ON brand_domains(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
