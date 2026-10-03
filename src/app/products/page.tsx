'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ProductRow } from '@/types/database';
import {
  Search,
  X,
  Plus,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  SlidersHorizontal,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>('newest');

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          throw new Error(
            'The "products" table does not exist in your database yet. Run the SQL migration in supabase/migrations/20261003120621_create_products.sql.'
          );
        }
        throw new Error(error.message);
      }

      setProducts(data || []);
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load products from database.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          if (error.code === '42P01') {
            setErrorMsg(
              'The "products" table does not exist in your database yet. Run the SQL migration in supabase/migrations/20261003120621_create_products.sql.'
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setProducts(data || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load products from database.';
          setErrorMsg(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & sorted products based on search term and sort option
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const matches = products.filter((p) => {
      if (!term) return true;
      const matchName = p.name?.toLowerCase().includes(term);
      const matchDesc = p.description ? p.description.toLowerCase().includes(term) : false;
      return matchName || matchDesc;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, searchTerm, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-page)' }}>
      {/* 1. Header / Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link href="/" className="navbar-brand">
            <div className="logo-icon">S</div>
            <span>Storefront</span>
          </Link>

          <nav className="nav-links">
            <Link href="/products" className="nav-link" style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
              Shop All
            </Link>
            <Link href="/#curated" className="nav-link">
              Help
            </Link>
          </nav>

          <div className="nav-actions">
            <Link href="/products/new" className="btn-add-product">
              <Plus size={16} /> Add Product
            </Link>
            <Link href="/login" className="btn-login">
              Login
            </Link>
            <Link href="/signup" className="btn-signup">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero / Header Banner */}
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <div className="catalog-eyebrow">
            <Sparkles size={14} /> CURATED COLLECTION
          </div>
          <h1 className="catalog-title">All Products</h1>
          <p className="catalog-subtitle">
            Explore our meticulously crafted collection. Search by name or description to find exactly what you are looking for.
          </p>

          {/* Search & Filter Bar */}
          <div className="catalog-search-card">
            <div className="search-input-box">
              <Search size={18} className="search-icon-left" />
              <input
                type="text"
                className="search-text-field"
                placeholder="Search by product name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filter-controls-group">
              <div className="sort-select-box">
                <SlidersHorizontal size={15} className="sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'name-asc')}
                  className="sort-dropdown"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <button
                type="button"
                className="refresh-btn"
                onClick={fetchProducts}
                title="Refresh product list"
                disabled={isLoading}
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Products List Area */}
      <main className="catalog-main-content">
        {/* Results summary bar */}
        <div className="results-status-bar">
          <div className="results-count">
            {isLoading ? (
              <span>Loading products...</span>
            ) : (
              <span>
                Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchTerm && (
                  <>
                    {' '}
                    matching &ldquo;<strong>{searchTerm}</strong>&rdquo;
                  </>
                )}
              </span>
            )}
          </div>

          <Link href="/products/new" className="inline-add-link">
            <Plus size={15} /> Add New Product
          </Link>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="feedback-banner error" style={{ margin: '1.5rem 0' }}>
            <AlertCircle size={20} className="feedback-icon" />
            <div className="feedback-text">
              <strong>Database Connection Error</strong>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="catalog-loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-info">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line desc" />
                  <div className="skeleton-line price" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State: 0 products in database */}
        {!isLoading && !errorMsg && products.length === 0 && (
          <div className="catalog-empty-card">
            <div className="empty-icon-circle">
              <Package size={32} />
            </div>
            <h2 className="empty-title">No Products in Catalog Yet</h2>
            <p className="empty-desc">
              Your database table is ready, but no products have been added. Click below to publish your first piece!
            </p>
            <Link href="/products/new" className="empty-cta-btn">
              <Plus size={18} /> Create First Product
            </Link>
          </div>
        )}

        {/* Empty State: Search yielded no matches */}
        {!isLoading && !errorMsg && products.length > 0 && filteredProducts.length === 0 && (
          <div className="catalog-empty-card">
            <div className="empty-icon-circle">
              <Search size={30} />
            </div>
            <h2 className="empty-title">No Matching Products</h2>
            <p className="empty-desc">
              No products found matching &ldquo;<strong>{searchTerm}</strong>&rdquo;. Try searching with different keywords.
            </p>
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              Clear Search Filter
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="catalog-grid">
            {filteredProducts.map((product) => {
              const hasImages = product.images && product.images.length > 0;
              const primaryImage = hasImages ? product.images[0] : null;
              const formattedPrice = Number(product.price).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              });

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="catalog-product-card"
                >
                  <div className="catalog-image-wrap">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        className="catalog-image"
                        unoptimized
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <ShoppingBag size={32} />
                        <span>No image</span>
                      </div>
                    )}

                    {hasImages && product.images.length > 1 && (
                      <div className="images-count-pill" title={`${product.images.length} images`}>
                        <Layers size={12} />
                        <span>{product.images.length} photos</span>
                      </div>
                    )}
                  </div>

                  <div className="catalog-product-body">
                    <h3 className="catalog-product-title">{product.name}</h3>

                    {product.description && (
                      <p className="catalog-product-desc">{product.description}</p>
                    )}

                    <div className="catalog-card-footer">
                      <span className="catalog-price-tag">{formattedPrice}</span>
                      <span className="view-details-action">
                        View Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>© 2024 Storefront. All rights reserved.</p>
      </footer>
    </div>
  );
}
