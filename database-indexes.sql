-- Database Performance Optimization: Add Indexes
-- Run this SQL script to add indexes to frequently queried columns
-- This will significantly improve query performance

-- Blog Posts Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);

-- Blog Categories Indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_status ON blog_categories(status);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Solutions Indexes
CREATE INDEX IF NOT EXISTS idx_solutions_sort_order ON solutions(sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);
CREATE INDEX IF NOT EXISTS idx_solutions_slug ON solutions(slug);
CREATE INDEX IF NOT EXISTS idx_solutions_category ON solutions(category);

-- Solution Related Tables Indexes
CREATE INDEX IF NOT EXISTS idx_solution_feature_cards_solution_id ON solution_feature_cards(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_implementation_steps_solution_id ON solution_implementation_steps(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_extra_cards_solution_id ON solution_extra_cards(solution_id);

-- Solution Categories Indexes
CREATE INDEX IF NOT EXISTS idx_solution_categories_status ON solution_categories(status);
CREATE INDEX IF NOT EXISTS idx_solution_categories_slug ON solution_categories(slug);

-- Brands Indexes
CREATE INDEX IF NOT EXISTS idx_brands_sort_order ON brands(sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(category);
CREATE INDEX IF NOT EXISTS idx_brands_featured ON brands(featured);

-- Brand Categories Indexes
CREATE INDEX IF NOT EXISTS idx_brand_categories_status ON brand_categories(status);
CREATE INDEX IF NOT EXISTS idx_brand_categories_slug ON brand_categories(slug);

-- Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_is_read ON leads(is_read);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Media Items Indexes
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media_items(file_type);

-- Site Settings Index
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(`key`);

-- Verify indexes were created
SHOW INDEX FROM blog_posts;
SHOW INDEX FROM solutions;
SHOW INDEX FROM brands;
SHOW INDEX FROM leads;
SHOW INDEX FROM media_items;
