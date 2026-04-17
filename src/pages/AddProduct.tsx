import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Loader2, CheckCircle2, X } from 'lucide-react';
import { saveProduct, ProductCategory } from '../firebase/inventory';
import { uploadProductImage } from '../firebase/storage';

const SHOE_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type Mode = 'shoes' | 'clothing' | 'accessories' | 'other';

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface PickedImage {
  file: File;
  preview: string;
}

export default function AddProduct() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('shoes');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);

  const [flatStock, setFlatStock] = useState<number>(0);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const needsSizes = mode === 'shoes' || mode === 'clothing';
  const sizeOptions = mode === 'shoes' ? SHOE_SIZES : mode === 'clothing' ? CLOTHING_SIZES : [];

  const toggleSize = (size: string) => {
    setSizeStock((prev) => {
      const next = { ...prev };
      if (size in next) {
        delete next[size];
      } else {
        next[size] = 0;
      }
      return next;
    });
  };

  const updateSizeStock = (size: string, value: number) => {
    setSizeStock((prev) => ({ ...prev, [size]: Math.max(0, value) }));
  };

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const picked: PickedImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter a product name.';
    if (!description.trim()) return 'Please enter a short description.';
    if (!price.trim()) return 'Please enter a price.';
    if (images.length === 0) return 'Please add at least one image.';
    if (needsSizes) {
      const sizeKeys = Object.keys(sizeStock);
      if (sizeKeys.length === 0) return 'Please select at least one size.';
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
      const id = `${slugify(name)}-${Date.now().toString(36)}`;

      const imageUrls = await Promise.all(
        images.map((img, idx) => uploadProductImage(img.file, id, idx))
      );

      await saveProduct({
        id,
        name: name.trim(),
        price: formattedPrice(),
        sku: sku.trim() || undefined,
        category: MODE_CATEGORY[mode],
        description: description.trim(),
        details: details.trim() || undefined,
        images: imageUrls,
        sizes: needsSizes ? sizeStock : undefined,
        stock: needsSizes ? undefined : flatStock,
      });

      setSuccess(true);
      setTimeout(() => navigate(`/product/${id}`), 900);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bfab-50/40 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12 text-center">
          <span className="eyebrow mb-3">Admin</span>
          <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-3">
            Add a <span className="italic text-bfab-600">Product</span>
          </h1>
          <p className="text-black/60 font-light">
            Fill out the form below to publish a new piece to the boutique.
          </p>
        </div>

        {success ? (
          <div className="bg-white border border-bfab-200 rounded-2xl p-12 text-center shadow-soft">
            <CheckCircle2 className="w-14 h-14 text-bfab-600 mx-auto mb-5" strokeWidth={1.5} />
            <h2 className="font-display text-3xl text-black mb-2">Product saved!</h2>
            <p className="text-black/60 font-light">Redirecting you to the product page…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-white border border-black/10 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-black mb-4">Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setSizeStock({});
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

            <section className="bg-white border border-black/10 rounded-2xl p-8 space-y-5">
              <h2 className="text-xl font-semibold text-black">Basics</h2>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Purple Crown Heels"
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Short description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A one-line hook that appears above the details."
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Materials, craftsmanship, what makes it special…"
                  className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
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
                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">SKU (optional)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. 01-001-M-WL"
                    className="w-full px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-black/10 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-black mb-4">Images *</h2>
              <p className="text-sm text-black/60 mb-4">
                The first image becomes the main/cover image. Add 2+ to get the hover-swap effect used
                on the shop grid.
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

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-black/10">
                      <img src={img.preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-bfab-600 text-white text-[10px] px-2 py-0.5 rounded">
                          COVER
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-black/10 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-black mb-4">Inventory</h2>

              {needsSizes ? (
                <>
                  <p className="text-sm text-black/60 mb-4">
                    Pick which sizes to show. Only sizes you select will appear on the product page.
                    Enter per-size stock counts.
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
                      {Object.keys(sizeStock)
                        .sort((a, b) => {
                          const na = parseFloat(a);
                          const nb = parseFloat(b);
                          if (!isNaN(na) && !isNaN(nb)) return na - nb;
                          return CLOTHING_SIZES.indexOf(a) - CLOTHING_SIZES.indexOf(b);
                        })
                        .map((size) => (
                          <div
                            key={size}
                            className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm font-medium text-black w-14">
                              {mode === 'shoes' ? `US ${size}` : size}
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={sizeStock[size]}
                              onChange={(e) =>
                                updateSizeStock(size, parseInt(e.target.value || '0', 10))
                              }
                              className="flex-1 min-w-0 px-2 py-1 border border-black/10 rounded text-black"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSize(size)}
                              className="text-bfab-600 hover:text-bfab-700"
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
                  <label className="block text-sm font-medium text-black mb-1">Amount in stock</label>
                  <input
                    type="number"
                    min={0}
                    value={flatStock}
                    onChange={(e) => setFlatStock(parseInt(e.target.value || '0', 10))}
                    className="w-full md:w-48 px-4 py-3 border border-black/20 rounded-lg focus:ring-2 focus:ring-bfab-500 focus:border-transparent text-black"
                  />
                </div>
              )}
            </section>

            {error && (
              <div className="bg-bfab-50 border border-bfab-200 rounded-lg p-4 text-bfab-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-6 py-3 border border-black/20 rounded-lg font-medium text-black hover:bg-black/5 transition-colors"
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
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Save Product
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
