'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  UploadCloud,
  X,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Info,
  Package
} from 'lucide-react';

interface ImagePreviewItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function AddProductForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: string;
    productId?: string;
  } | null>(null);

  // Handle files selected via file input or drop
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImageFiles = fileArray.filter((file) => file.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      setFeedback({
        type: 'warning',
        title: 'Invalid File Type',
        message: 'Please select valid image files (PNG, JPG, WEBP, or SVG).'
      });
      return;
    }

    const newPreviewItems: ImagePreviewItem[] = validImageFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedImages((prev) => [...prev, ...newPreviewItems]);
    setFeedback(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (idToRemove: string) => {
    setSelectedImages((prev) => {
      const item = prev.find((i) => i.id === idToRemove);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== idToRemove);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (!name.trim()) {
      setFeedback({
        type: 'warning',
        title: 'Product Name Required',
        message: 'Please provide a name for the product.'
      });
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFeedback({
        type: 'warning',
        title: 'Invalid Price',
        message: 'Please enter a valid non-negative price amount.'
      });
      return;
    }

    if (selectedImages.length === 0) {
      setFeedback({
        type: 'warning',
        title: 'Images Required',
        message: 'Please upload at least one product image.'
      });
      return;
    }

    setIsLoading(true);
    setUploadStatus('Connecting to Supabase...');

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      // 1. Upload each image to Supabase Storage bucket 'product-images'
      for (let i = 0; i < selectedImages.length; i++) {
        const item = selectedImages[i];
        setUploadStatus(`Uploading image ${i + 1} of ${selectedImages.length}...`);

        const fileExt = item.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const sanitizedBase = item.file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFileName = `${Date.now()}_${sanitizedBase}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `products/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, item.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          // Check for bucket not found
          if (
            uploadError.message.toLowerCase().includes('bucket not found') ||
            uploadError.message.toLowerCase().includes('does not exist')
          ) {
            throw new Error(
              `The 'product-images' storage bucket does not exist yet. Please run the migration script in supabase/migrations/20261003120621_create_products.sql or create a public bucket named 'product-images' in your Supabase Dashboard.`
            );
          }
          throw new Error(`Failed to upload ${item.file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error(`Could not generate public URL for ${item.file.name}`);
        }

        uploadedUrls.push(urlData.publicUrl);
      }

      // 2. Insert product record into Supabase 'products' table
      setUploadStatus('Saving product to database...');

      const { data: createdProduct, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            price: parsedPrice,
            images: uploadedUrls
          }
        ])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '42P01') {
          throw new Error(
            `The 'products' table has not been created in Supabase yet. Please execute the SQL migration located at 'supabase/migrations/20261003120621_create_products.sql' in your Supabase SQL Editor.`
          );
        }
        throw new Error(insertError.message);
      }

      // Clean up object URLs
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));

      setFeedback({
        type: 'success',
        title: 'Product Created Successfully!',
        message: `"${name}" with ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} has been added to your catalog.`,
        productId: createdProduct?.id
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      console.error('Error adding product:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred while saving the product.';
      setFeedback({
        type: 'error',
        title: 'Failed to Add Product',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="product-form-container">
      {/* Back button and breadcrumb */}
      <div className="form-header-bar">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to Storefront
        </Link>
        <div className="form-tag">
          <Sparkles size={14} /> Catalog Management
        </div>
      </div>

      <div className="form-card">
        <div className="form-title-group">
          <div className="form-icon-circle">
            <Package size={24} />
          </div>
          <h1 className="form-main-heading">Add New Product</h1>
          <p className="form-sub-heading">
            Fill in the details below to publish a new piece to the collection.
            Images are securely stored in Supabase Storage with links stored in the database.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>
            <div className="feedback-icon">
              {feedback.type === 'success' && <CheckCircle2 size={20} />}
              {feedback.type === 'warning' && <Info size={20} />}
              {feedback.type === 'error' && <AlertCircle size={20} />}
            </div>
            <div className="feedback-text">
              <strong>{feedback.title}</strong>
              <p>{feedback.message}</p>
              {feedback.productId && (
                <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    href={`/products/${feedback.productId}`}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#047857',
                      textDecoration: 'underline'
                    }}
                  >
                    View Product Details →
                  </Link>
                  <Link
                    href="/products"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#065f46',
                      textDecoration: 'underline'
                    }}
                  >
                    Browse All Products →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Product Name */}
          <div className="field-group">
            <label className="field-label" htmlFor="product-name">
              Product Name <span className="required-star">*</span>
            </label>
            <div className="field-input-wrapper">
              <Tag size={18} className="field-icon-left" />
              <input
                id="product-name"
                type="text"
                className="custom-text-input"
                placeholder="e.g. Minimalist Titanium Chronograph"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="field-group">
            <label className="field-label" htmlFor="product-price">
              Price (USD) <span className="required-star">*</span>
            </label>
            <div className="field-input-wrapper">
              <DollarSign size={18} className="field-icon-left" />
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                className="custom-text-input"
                placeholder="295.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="field-group">
            <label className="field-label" htmlFor="product-description">
              Description
            </label>
            <div className="field-textarea-wrapper">
              <FileText size={18} className="textarea-icon-left" />
              <textarea
                id="product-description"
                rows={4}
                className="custom-textarea"
                placeholder="Handcrafted details, bespoke materials, specifications, and provenance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Multiple Images Upload */}
          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label">
                Product Images (Multiple) <span className="required-star">*</span>
              </label>
              <span className="field-sublabel">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} chosen
              </span>
            </div>

            {/* Dropzone */}
            <div
              className={`dropzone-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
                disabled={isLoading}
              />

              <div className="dropzone-content">
                <div className="upload-icon-wrapper">
                  <UploadCloud size={28} />
                </div>
                <div className="upload-instructions">
                  <span className="upload-prompt-highlight">Click to upload</span> or drag and drop
                </div>
                <p className="upload-supported-types">
                  PNG, JPG, WEBP, or SVG • Select multiple files
                </p>
              </div>
            </div>

            {/* Image Previews Grid */}
            {selectedImages.length > 0 && (
              <div className="previews-grid">
                {selectedImages.map((img, index) => (
                  <div key={img.id} className="preview-card">
                    <div className="preview-image-box">
                      <Image
                        src={img.previewUrl}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="(max-width: 600px) 100px, 120px"
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        title="Remove image"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                      <span className="preview-index-badge">#{index + 1}</span>
                    </div>
                    <div className="preview-meta">
                      <span className="preview-filename" title={img.file.name}>
                        {img.file.name}
                      </span>
                      <span className="preview-filesize">
                        {(img.file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-product-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>{uploadStatus || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Publish Product</span>
                </>
              )}
            </button>

            <Link href="/" className="cancel-btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
