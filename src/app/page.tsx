'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import QuickViewModal, { Product } from '@/components/QuickViewModal';
import { Globe, ShieldCheck, RotateCcw, Eye, ArrowRight, Plus } from 'lucide-react';

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Minimalist Leather Watch',
    category: 'Timepieces',
    price: '$295.00',
    image: '/images/minimalist_watch.jpg',
    badge: 'Bestseller',
    description: 'Precision Swiss-movement wristwatch featuring a brushed surgical steel case and top-grain Italian leather strap.',
    specs: ['38mm Stainless Steel Case', 'Swiss Quartz Movement', 'Sapphire Crystal Glass', '50m Water Resistant']
  },
  {
    id: 'prod-2',
    name: 'Handcrafted Briefcase',
    category: 'Leather Craft',
    price: '$880.00',
    image: '/images/leather_briefcase.jpg',
    description: 'Masterfully hand-stitched full-grain Tuscan leather briefcase with dedicated laptop compartment and antique brass fittings.',
    specs: ['Full-Grain Tuscan Leather', 'Solid Antique Brass Hardware', 'Padded 15" Laptop Compartment', 'Hand-stitched Edges']
  },
  {
    id: 'prod-3',
    name: 'Silk Pocket Square',
    category: 'Accessories',
    price: '$85.00',
    image: '/images/silk_pocket_square.jpg',
    badge: 'New',
    description: 'Hand-rolled 100% mulberry silk pocket square with bespoke heritage paisley pattern.',
    specs: ['100% Mulberry Silk', 'Hand-Rolled Hem', 'Made in Como, Italy', 'Dimensions: 33 x 33 cm']
  },
  {
    id: 'prod-4',
    name: 'Chronograph Timepiece',
    category: 'Heritage',
    price: '$1,250.00',
    image: '/images/chronograph_watch.jpg',
    description: 'Automatic mechanical chronograph with deep blue sunburst dial, tachymeter scale, and brushed steel bracelet.',
    specs: ['Automatic Chronograph Caliber', '42mm Stainless Steel Case', 'Sunburst Blue Dial', '72-Hour Power Reserve']
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'timepieces' | 'leather'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === 'timepieces') return p.category === 'Timepieces' || p.category === 'Heritage';
    if (activeTab === 'leather') return p.category === 'Leather Craft' || p.category === 'Accessories';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Header / Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <Link href="/" className="navbar-brand">
            <div className="logo-icon">S</div>
            <span>Storefront</span>
          </Link>

          <nav className="nav-links">
            <Link href="/products" className="nav-link">Shop</Link>
            <a href="#curated" className="nav-link">Help</a>
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

      {/* 2. Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url('/images/hero_bg.jpg')` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">AURUM & CO. STUDIO</p>
          <h1 className="hero-title">Timeless Elegance, Modern Craft</h1>
          <p className="hero-subtitle">
            Discover meticulously crafted accessories designed for those who appreciate
            uncompromising quality and understated sophistication.
          </p>
          <div className="hero-cta-group">
            <a href="#featured" className="btn-hero-primary">
              Explore Collection
            </a>
            <a href="#curated" className="btn-hero-secondary">
              Our Heritage
            </a>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights Banner */}
      <section className="features-banner">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="feature-title">Worldwide Shipping</h4>
              <p className="feature-desc">Complimentary express delivery on all international orders.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="feature-title">Secure Checkout</h4>
              <p className="feature-desc">256-bit SSL encryption for complete peace of mind.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="feature-title">30-Day Returns</h4>
              <p className="feature-desc">Hassle-free returns and exchanges worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Masterpieces Section */}
      <section id="featured" className="section-container">
        <div className="section-header-flex">
          <div>
            <p className="section-eyebrow">HANDCRAFTED EXCELLENCE</p>
            <h2 className="section-title">Featured Masterpieces</h2>
          </div>

          <div className="category-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Items
            </button>
            <button
              className={`tab-btn ${activeTab === 'timepieces' ? 'active' : ''}`}
              onClick={() => setActiveTab('timepieces')}
            >
              Timepieces
            </button>
            <button
              className={`tab-btn ${activeTab === 'leather' ? 'active' : ''}`}
              onClick={() => setActiveTab('leather')}
            >
              Leather Goods
            </button>
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrap">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="product-image"
                />
                {product.badge && (
                  <span className={`badge-pill ${product.badge.toLowerCase() === 'new' ? 'new' : ''}`}>
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="product-info">
                <div>
                  <p className="product-category">{product.category}</p>
                  <h3 className="product-name">{product.name}</h3>
                </div>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <button
                    className="btn-quickview"
                    title="Quick View"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Curated Selection Section */}
      <section id="curated" className="curated-section">
        <div className="curated-header">
          <p className="section-eyebrow">CURATED SELECTION</p>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            The 2024 Essentials Edit
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>
            Carefully curated combinations designed to complement the modern wardrobe with refined poise.
          </p>
        </div>

        <div className="edits-grid">
          {/* Card 1 */}
          <div className="edit-card">
            <Image
              src="/images/executive_portfolio.jpg"
              alt="The Executive Portfolio"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="edit-bg-image"
            />
            <div className="edit-overlay" />
            <span className="edit-tag">EDITION 01</span>
            <div className="edit-content">
              <h3 className="edit-title">The Executive Portfolio</h3>
              <p className="edit-desc">
                Command the boardroom with statement leather goods and precision accessories.
              </p>
              <a href="#featured" className="edit-link">
                Explore Edit <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="edit-card">
            <Image
              src="/images/evening_occasion.jpg"
              alt="Evening & Occasion"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="edit-bg-image"
            />
            <div className="edit-overlay" />
            <span className="edit-tag">EDITION 02</span>
            <div className="edit-content">
              <h3 className="edit-title">Evening & Occasion</h3>
              <p className="edit-desc">
                Subtle accents designed for formal galas and evening celebrations.
              </p>
              <a href="#featured" className="edit-link">
                Explore Edit <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="edit-card">
            <Image
              src="/images/modern_voyager.jpg"
              alt="The Modern Voyager"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="edit-bg-image"
            />
            <div className="edit-overlay" />
            <span className="edit-tag">EDITION 03</span>
            <div className="edit-content">
              <h3 className="edit-title">The Modern Voyager</h3>
              <p className="edit-desc">
                Durable yet luxurious companions for the discerning international traveler.
              </p>
              <a href="#featured" className="edit-link">
                Explore Edit <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <p className="newsletter-eyebrow">JOIN THE INNER CIRCLE</p>
          <h2 className="newsletter-title">Receive Private Access to Limited Releases</h2>
          <p className="newsletter-subtitle">
            Subscribe to receive exclusive invitations to seasonal collection launches and private member sales.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="footer">
        <p>© 2024 Storefront. All rights reserved.</p>
      </footer>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
