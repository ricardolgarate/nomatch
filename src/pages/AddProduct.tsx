import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  Pencil,
  ChevronLeft,
  AlertCircle,
  Package,
} from 'lucide-react';
import {
  deleteProduct,
  getAllProducts,
  ProductCategory,
  ProductInventory,
  saveProduct,
} from '../firebase/inventory';
import { deleteProductImage, uploadProductImage } from '../firebase/storage';

const SHOE_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type Mode = 'shoes' | 'clothing' | 'accessories' | 'other';
type View = 'list' | 'form';

const MODE_LABELS: Record<Mode, string> = {
  shoes: 'Shoes',
  clothing: 'Clothing',
  accessories: 'Accessories',
  other: 'Other',
};

const MODE_CATEGORY: Record<Mode, ProductCategory> = {
  shoes: 'Shoes',
  clothing: 'Clothing',
  accessories: 'Accessories',
  other: 'Other',
};

function categoryToMode(category: string): Mode {
  switch (category) {
    case 'Shoes':
      return 'shoes';
    case 'Clothing':
      return 'clothing';
    case 'Accessories':
      return 'accessories';
    default:
      return 'other';
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function sortSizes(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return CLOTHING_SIZES.indexOf(a) - CLOTHING_SIZES.indexOf(b);
  });
}

function totalStock(p: ProductInventory): number {
  if (p.sizes && Object.keys(p.sizes).length > 0) {
    return Object.values(p.sizes).reduce((a, b) => a + (b || 0), 0);
  }
  return p.stock || 0;
}

interface PickedImage {
  file: File;
  preview: string;
}

export default function AddProduct() {
  const navigate = useNavigate();

  const [view, setView] = useState<View>('list');
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const [editing, setEditing] = useState<ProductInventory | null>(null);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const all = await getAllProducts();
      setProducts(all.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
      setListError('Could not load products.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (product: ProductInventory) => {
    const ok = confirm(`Delete "${product.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      // Delete images from storage (best-effort; ignore errors for non-storage URLs)
      await Promise.all(
        (product.images || []).map((url) =>
          deleteProductImage(url).catch(() => undefined),
        ),
      );
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleClearAll = async () => {
    if (products.length === 0) return;
    const ok = confirm(
      `This will permanently delete all ${products.length} products. Continue?`,
    );
    if (!ok) return;
    const sure = confirm('Are you absolutely sure? This action is irreversible.');
    if (!sure) return;

    setBulkBusy(true);
    try {
      for (const p of products) {
        await Promise.all(
          (p.images || []).map((url) => deleteProductImage(url).catch(() => undefined)),
        );
        await deleteProduct(p.id);
      }
      setProducts([]);
    } catch (err) {
      console.error(err);
      alert('Some products could not be deleted. Refresh and try again.');
    } finally {
      setBulkBusy(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setView('form');
  };

  const openEdit = (product: ProductInventory) => {
    setEditing(product);
    setView('form');
  };

  const onFormDone = async () => {
    setView('list');
    setEditing(null);
    await refresh();
  };

  if (view === 'form') {
    return (
      <ProductForm
        product={editing}
        onBack={() => {
          setView('list');
          setEditing(null);
        }}
        onSaved={onFormDone}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bfab-50/40 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow mb-3">Admin</span>
            <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-3">
              Your <span className="italic text-bfab-600">Boutique</span>
            </h1>
            <p className="text-black/60 font-light mt-2">
              Add, edit, or remove the pieces in your shop.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bfab-600 text-white rounded-lg font-semibold hover:bg-bfab-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={bulkBusy}
                className="inline-flex items-center gap-2 px-5 py-3 border border-black/15 text-black rounded-lg font-medium hover:bg-black/5 transition-colors disabled:opacity-60"
              >
                {bulkBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Clearing…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Clear All
                  </>
                )}
              </button>
            )}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-3 text-black/70 hover:text-bfab-600 font-medium"
            >
              View Shop
            </Link>
          </div>
        </div>

        {listError && (
          <div className="mb-6 p-4 rounded-lg bg-bfab-50 border border-bfab-200 text-sm text-bfab-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {listError}
          </div>
        )}

        {loadingList ? (
          <div className="py-20 text-center text-black/50">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-2xl p-16 text-center shadow-card">
            <Package className="w-12 h-12 text-bfab-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-black mb-2">Nothing here yet</h2>
            <p className="text-black/60 font-light mb-6">
              Add your first product to start curating the boutique.
            </p>
            <button onClick={openAdd} className="btn-primary">
              <Plus className="w-4 h-4" /> ADD YOUR FIRST PIECE
            </button>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded-2xl shadow-card overflow-hidden">
            <div className="divide-y divide-black/5">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onEdit={() => openEdit(p)}
                  onDelete={() => handleDelete(p)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-black/50 hover:text-bfab-600 transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Product row component                                         */
/* ------------------------------------------------------------- */

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductInventory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stock = totalStock(product);
  const out = stock === 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 hover:bg-bfab-50/40 transition-colors">
      <div className="flex items-center gap-4 md:flex-1 min-w-0">
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-bfab-50 border border-black/5 shrink-0">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/30">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg text-black truncate">{product.name}</p>
          <p className="text-sm text-black/60 truncate">
            {product.category} · {product.price}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                out
                  ? 'bg-black text-white'
                  : stock < 5
                  ? 'bg-bfab-100 text-bfab-800'
                  : 'bg-bfab-50 text-bfab-700'
              }`}
            >
              {out ? 'Out of stock' : `${stock} in stock`}
            </span>
            {product.sizes && Object.keys(product.sizes).length > 0 && (
              <span className="text-black/50">
                {Object.keys(product.sizes).length} size{Object.keys(product.sizes).length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-black/15 text-sm text-black hover:bg-black/5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-bfab-700 hover:bg-bfab-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Product form component (add + edit)                           */
/* ------------------------------------------------------------- */

interface ProductFormProps {
  product: ProductInventory | null;
  onBack: () => void;
  onSaved: () => void;
}

function ProductForm({ product, onBack, onSaved }: ProductFormProps) {
  const isEdit = !!product;

  const [mode, setMode] = useState<Mode>(
    product ? categoryToMode(product.category) : 'shoes',
  );
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [details, setDetails] = useState(product?.details || '');
  const [price, setPrice] = useState(product?.price || '');
  const [sku, setSku] = useState(product?.sku || '');

  // Existing image URLs (from storage) that remain; removed ones are queued for delete
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([]);
  // New picked files
  const [newImages, setNewImages] = useState<PickedImage[]>([]);

  // String-backed stock so user can clear the field to empty
  const [flatStock, setFlatStock] = useState<string>(
    product && !product.sizes ? String(product.stock ?? 0) : '',
  );
  const [sizeStock, setSizeStock] = useState<Record<string, string>>(() => {
    if (!product?.sizes) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(product.sizes)) out[k] = String(v);
    return out;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const needsSizes = mode === 'shoes' || mode === 'clothing';
  const sizeOptions = useMemo(
    () => (mode === 'shoes' ? SHOE_SIZES : mode === 'clothing' ? CLOTHING_SIZES : []),
    [mode],
  );

  // When mode changes on a fresh form, reset size stock; don't reset on edit loading
  const [modeDirty, setModeDirty] = useState(false);
  useEffect(() => {
    if (!modeDirty) return;
    setSizeStock({});
    setFlatStock('');
  }, [mode, modeDirty]);

  const toggleSize = (size: string) => {
    setSizeStock((prev) => {
      const next = { ...prev };
      if (size in next) {
        delete next[size];
      } else {
        next[size] = '';
      }
      return next;
    });
  };

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const picked: PickedImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedExistingImages((prev) => [...prev, url]);
  };

  const totalImageCount = existingImages.length + newImages.length;

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter a product name.';
    if (!description.trim()) return 'Please enter a short description.';
    if (!price.trim()) return 'Please enter a price.';
    if (totalImageCount === 0) return 'Please add at least one image.';
    if (needsSizes && Object.keys(sizeStock).length === 0) {
      return 'Please select at least one size.';
    }
    return null;
  };

  const formattedPrice = () => {
    const cleaned = price.trim();
    if (cleaned.startsWith('$')) return cleaned;
    const num = parseFloat(cleaned);
    if (isNaN(num)) return cleaned;
    return `$${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const id =
        product?.id ??
        `${slugify(name) || 'product'}-${Date.now().toString(36)}`;

      // Upload new images
      const newUrls = await Promise.all(
        newImages.map((img, idx) =>
          uploadProductImage(img.file, id, existingImages.length + idx),
        ),
      );
      const finalImages = [...existingImages, ...newUrls];

      // Remove images the user took out during edit
      await Promise.all(
        removedExistingImages.map((url) =>
          deleteProductImage(url).catch(() => undefined),
        ),
      );

      const sizesForSave = needsSizes
        ? Object.fromEntries(
            Object.entries(sizeStock).map(([k, v]) => [k, parseInt(v || '0', 10) || 0]),
          )
        : undefined;

      const stockForSave = needsSizes ? undefined : parseInt(flatStock || '0', 10) || 0;

      await saveProduct({
        id,
        name: name.trim(),
        price: formattedPrice(),
        sku: sku.trim() || undefined,
        category: MODE_CATEGORY[mode],
        description: description.trim(),
        details: details.trim() || undefined,
        images: finalImages,
        sizes: sizesForSave,
        stock: stockForSave,
      });

      setSuccess(true);
      setTimeout(() => onSaved(), 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bfab-50/40 flex items-center justify-center py-20 px-6">
        <div className="bg-white border border-bfab-200 rounded-2xl p-12 text-center shadow-soft max-w-md w-full">
          <CheckCircle2 className="w-14 h-14 text-bfab-600 mx-auto mb-5" strokeWidth={1.5} />
          <h2 className="font-display text-3xl text-black mb-2">
            {isEdit ? 'Product updated!' : 'Product saved!'}
          </h2>
          <p className="text-black/60 font-light">Back to your boutique…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bfab-50/40 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-bfab-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All products
        </button>

        <div className="mb-10">
          <span className="eyebrow mb-3">{isEdit ? 'Editing' : 'New Product'}</span>
          <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-3">
            {isEdit ? (
              <>
                Edit <span className="italic text-bfab-600">{product!.name}</span>
              </>
            ) : (
              <>
                Add a <span className="italic text-bfab-600">Product</span>
              </>
            )}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-black mb-4">Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setModeDirty(true);
                  }}
                  className={`py-3 rounded-lg border-2 font-medium transition-all ${
                    mode === m
                      ? 'border-bfab-600 bg-bfab-50 text-bfab-600'
                      : 'border-black/10 text-black hover:border-black/30'
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 space-y-5">
            <h2 className="text-xl font-semibold text-black">Basics</h2>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Purple Crown Heels"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Short description *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A one-line hook that appears above the details."
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Materials, craftsmanship, what makes it special…"
                className="input-base resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Price (USD) *</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 170 or $170"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  SKU (optional)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. 01-001-M-WL"
                  className="input-base"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-black mb-4">Images *</h2>
            <p className="text-sm text-black/60 mb-4">
              First image is the cover. Add 2+ for the hover-swap effect on the shop grid.
            </p>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black/20 hover:border-bfab-600 rounded-lg p-8 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-bfab-600" />
              <span className="text-sm font-medium text-black">Click to upload images</span>
              <span className="text-xs text-black/50">PNG / JPG / WEBP — up to 5MB each</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChosen}
                className="hidden"
              />
            </label>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {existingImages.map((url, idx) => (
                  <div
                    key={url}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-black/10"
                  >
                    <img
                      src={url}
                      alt={`existing-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && newImages.length === 0 && (
                      <span className="absolute bottom-1 left-1 bg-bfab-600 text-white text-[10px] px-2 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                  </div>
                ))}
                {newImages.map((img, idx) => (
                  <div
                    key={`${img.preview}-${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-black/10"
                  >
                    <img
                      src={img.preview}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {existingImages.length === 0 && idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-bfab-600 text-white text-[10px] px-2 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-white/90 text-bfab-700 text-[10px] px-2 py-0.5 rounded font-medium">
                      NEW
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-black mb-4">Inventory</h2>

            {needsSizes ? (
              <>
                <p className="text-sm text-black/60 mb-4">
                  Pick which sizes to show. Only selected sizes appear on the product page.
                  Enter how many units you have per size.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {sizeOptions.map((size) => {
                    const active = size in sizeStock;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          active
                            ? 'border-bfab-600 bg-bfab-50 text-bfab-600'
                            : 'border-black/10 text-black hover:border-black/30'
                        }`}
                      >
                        {mode === 'shoes' ? `US ${size}` : size}
                      </button>
                    );
                  })}
                </div>

                {Object.keys(sizeStock).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {sortSizes(Object.keys(sizeStock)).map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-black w-14">
                          {mode === 'shoes' ? `US ${size}` : size}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={sizeStock[size]}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setSizeStock((prev) => ({ ...prev, [size]: val }));
                          }}
                          placeholder="0"
                          className="flex-1 min-w-0 px-2 py-1 border border-black/10 rounded text-black text-center"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSize(size)}
                          className="text-bfab-600 hover:text-bfab-700"
                          aria-label="Remove size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Amount in stock
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={flatStock}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFlatStock(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="input-base w-full md:w-48"
                />
              </div>
            )}
          </section>

          {error && (
            <div className="bg-bfab-50 border border-bfab-200 rounded-lg p-4 text-bfab-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-black/15 rounded-lg font-medium text-black hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-bfab-600 text-white rounded-lg font-semibold hover:bg-bfab-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving…
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
