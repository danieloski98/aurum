'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProductRow } from '@/types/database';
import {
  ArrowLeft,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Globe,
  RotateCcw,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Share2,
  Check,
  CreditCard
} from 'lucide-react';
import PaystackCheckoutModal from '@/components/PaystackCheckoutModal';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          setErrorMsg('Product not found in the catalog.');
        } else {
          setProduct(data);
        }
      } catch (err: unknown) {
        console.error('Error fetching product:', err);
        const msg = err instanceof Error ? err.message : 'Could not fetch product details.';
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const images = product?.images || [];
  const activeImage = images[selectedImageIndex] || (images.length > 0 ? images[0] : null);

  const prevImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formattedPrice = product
    ? Number(product.price).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : '';

  const formattedDate = product?.created_at
    ? new Date(product.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

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

      {/* 2. Main Content */}
      <main className="product-detail-page">
        {/* Breadcrumb & Navigation */}
        <div className="detail-top-nav">
          <Link href="/products" className="back-link">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>

          <button type="button" onClick={handleCopyLink} className="share-btn">
            {isCopied ? (
              <>
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="detail-loading-box">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading product details...</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (errorMsg || !product) && (
          <div className="detail-error-card">
            <div className="empty-icon-circle">
              <AlertCircle size={32} />
            </div>
            <h1 className="empty-title">Product Not Found</h1>
            <p className="empty-desc">
              {errorMsg || 'We could not find the product you are looking for. It may have been removed.'}
            </p>
            <Link href="/products" className="empty-cta-btn">
              <ArrowLeft size={16} /> Return to Catalog
            </Link>
          </div>
        )}

        {/* Product Details Layout */}
        {!isLoading && product && (
          <div className="product-detail-grid">
            {/* Left Column: Multi-Image Gallery */}
            <div className="gallery-column">
              <div className="gallery-main-frame">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 600px"
                    className="gallery-main-img"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="no-image-placeholder detail">
                    <ShoppingBag size={48} />
                    <span>No image uploaded for this product</span>
                  </div>
                )}

                {/* Left/Right carousel navigation arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="carousel-arrow prev"
                      onClick={prevImage}
                      title="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="carousel-arrow next"
                      onClick={nextImage}
                      title="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="image-counter-pill">
                      <Layers size={12} />
                      <span>
                        {selectedImageIndex + 1} of {images.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="thumbnails-scroll-row">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`thumb-button ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="thumb-image"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Information & Ordering */}
            <div className="info-column">
              <div className="info-eyebrow">
                <span className="stock-status-badge">Available in Catalog</span>
                {formattedDate && (
                  <span className="catalog-date">
                    <Calendar size={13} /> {formattedDate}
                  </span>
                )}
              </div>

              <h1 className="detail-product-title">{product.name}</h1>

              <div className="detail-price-box">
                <span className="detail-price">{formattedPrice}</span>
                <span className="price-tax-note">Taxes and duties included</span>
              </div>

              {/* Description */}
              <div className="detail-desc-card">
                <h3 className="section-sub-title">Product Details</h3>
                <p className="detail-desc-text">
                  {product.description || 'No detailed description provided for this product.'}
                </p>
              </div>

              {/* Actions */}
              <div className="detail-actions-box">
                <button
                  type="button"
                  className="btn-paystack-action"
                  onClick={() => setIsPaystackOpen(true)}
                >
                  <CreditCard size={18} /> Pay with Paystack • {formattedPrice}
                </button>

                <button
                  type="button"
                  className={`btn-add-bag ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} /> Added to Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} /> Add to Bag
                    </>
                  )}
                </button>

                <Link href="/products/new" className="btn-secondary-action">
                  <Plus size={16} /> Add Another Product
                </Link>
              </div>

              {/* Paystack Checkout Modal */}
              <PaystackCheckoutModal
                product={product}
                isOpen={isPaystackOpen}
                onClose={() => setIsPaystackOpen(false)}
              />

              {/* Trust & Guarantee highlights */}
              <div className="trust-grid">
                <div className="trust-item">
                  <Globe size={18} className="trust-icon" />
                  <div>
                    <strong>Complimentary Express Delivery</strong>
                    <span>Fast, carbon-neutral global courier</span>
                  </div>
                </div>

                <div className="trust-item">
                  <ShieldCheck size={18} className="trust-icon" />
                  <div>
                    <strong>Authenticity Guaranteed</strong>
                    <span>Direct from master artisan workshops</span>
                  </div>
                </div>

                <div className="trust-item">
                  <RotateCcw size={18} className="trust-icon" />
                  <div>
                    <strong>30-Day Hassle-Free Returns</strong>
                    <span>Complimentary return pickup available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>© 2024 Storefront. All rights reserved.</p>
      </footer>
    </div>
  );
}
