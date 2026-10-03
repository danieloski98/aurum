import Link from 'next/link';
import AddProductForm from '@/components/AddProductForm';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Product | Storefront',
  description: 'Upload product details and multiple images to your catalog.'
};

export default function NewProductPage() {
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
            <Link href="/" className="nav-link">Shop</Link>
            <Link href="/#curated" className="nav-link">Help</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/products/new" className="btn-add-product active">
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

      {/* 2. Main Form Content */}
      <main style={{ flexGrow: 1, padding: '2.5rem 1rem' }}>
        <AddProductForm />
      </main>

      {/* 3. Footer */}
      <footer className="footer">
        <p>© 2024 Storefront. All rights reserved.</p>
      </footer>
    </div>
  );
}
