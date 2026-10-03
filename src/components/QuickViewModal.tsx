'use client';

import { X, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  description: string;
  specs: string[];
}

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '0', overflow: 'hidden' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 20,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <X size={18} color="#0f172a" />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px', background: '#f1f5f9' }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c2410c' }}>
                {product.category}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem' }}>
                {product.name}
              </h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                {product.price}
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {product.description}
              </p>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem', listStyle: 'none' }}>
                {product.specs.map((spec, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Check size={14} color="#10b981" /> {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <button
                className="btn-hero-primary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => {
                  alert(`Added ${product.name} to your bag!`);
                  onClose();
                }}
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
