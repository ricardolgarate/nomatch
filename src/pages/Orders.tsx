import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Inbox,
  Search,
  Trash2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  deleteOrder,
  getAllOrders,
  Order,
  OrderStatus,
  updateOrderStatus,
} from '../firebase/orders';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'bg-bfab-100 text-bfab-800',
  processing: 'bg-bfab-50 text-bfab-700 border border-bfab-200',
  shipped: 'bg-black text-white',
  delivered: 'bg-bfab-600 text-white',
  cancelled: 'bg-black/10 text-black/60 line-through',
};

function formatDate(d?: Date): string {
  if (!d) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function currency(cents: number): string {
  return `$${cents.toFixed(2)}`;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllOrders();
      setOrders(all);
    } catch (err) {
      console.error(err);
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      const fields = [
        o.orderNumber,
        `${o.customer.firstName} ${o.customer.lastName}`,
        o.customer.email,
        o.customer.phone || '',
        o.customer.city,
      ].join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [orders, statusFilter, search]);

  const stats = useMemo(() => {
    const counts: Record<OrderStatus | 'all', number> = {
      all: orders.length,
      new: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) counts[o.status]++;
    return counts;
  }, [orders]);

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0),
    [orders],
  );

  const handleStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      console.error(err);
      await refresh();
    }
  };

  const handleDelete = async (order: Order) => {
    const ok = confirm(
      `Delete order ${order.orderNumber}? This cannot be undone.`,
    );
    if (!ok) return;
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    try {
      await deleteOrder(order.id);
    } catch (err) {
      console.error(err);
      await refresh();
    }
  };

  return (
    <div className="min-h-screen bg-bfab-50/40 py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow mb-3">Admin</span>
            <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-3">
              Your <span className="italic text-bfab-600">Orders</span>
            </h1>
            <p className="text-black/60 font-light mt-2">
              Every order placed through the site, with status and customer info.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/add"
              className="inline-flex items-center gap-2 px-5 py-3 text-black/70 hover:text-bfab-600 font-medium"
            >
              Manage products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={String(stats.all)} />
          <StatCard label="New" value={String(stats.new)} />
          <StatCard label="Processing" value={String(stats.processing)} />
          <StatCard label="Shipped" value={String(stats.shipped)} />
          <StatCard label="Revenue" value={currency(revenue)} accent />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, name, email, phone…"
              className="input-base pl-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="input-base md:w-48"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-bfab-50 border border-bfab-200 text-sm text-bfab-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-black/50">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-2xl p-16 text-center shadow-card">
            <Inbox className="w-12 h-12 text-bfab-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-black mb-2">
              {orders.length === 0 ? 'No orders yet' : 'Nothing matches those filters'}
            </h2>
            <p className="text-black/60 font-light">
              {orders.length === 0
                ? 'Orders placed on the site will appear here.'
                : 'Try clearing the search or choosing a different status.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded-2xl shadow-card overflow-hidden">
            <div className="divide-y divide-black/5">
              {filtered.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  expanded={expandedId === o.id}
                  onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  onStatus={(status) => handleStatus(o.id, status)}
                  onDelete={() => handleDelete(o)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        accent
          ? 'bg-bfab-600 border-bfab-600 text-white'
          : 'bg-white border-black/5'
      }`}
    >
      <p
        className={`text-[10px] tracking-[0.25em] uppercase font-semibold ${
          accent ? 'text-white/70' : 'text-black/50'
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display text-2xl md:text-3xl mt-1 ${
          accent ? 'text-white' : 'text-black'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatus,
  onDelete,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: OrderStatus) => void;
  onDelete: () => void;
}) {
  const fullName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const itemCount = order.items.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-bfab-50/40 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-black/40 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-black/40 shrink-0" />
        )}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 items-center gap-2">
          <div className="md:col-span-4 min-w-0">
            <p className="font-medium text-black truncate">{fullName || 'Guest'}</p>
            <p className="text-xs text-black/50 truncate">{order.customer.email}</p>
          </div>
          <div className="md:col-span-3 text-sm text-black/70 truncate">
            #{order.orderNumber}
          </div>
          <div className="md:col-span-2 text-xs text-black/50">
            {formatDate(order.createdAt)}
          </div>
          <div className="md:col-span-1 text-sm text-black/70">
            {itemCount} pc
          </div>
          <div className="md:col-span-2 text-sm font-semibold text-bfab-600 md:text-right">
            {currency(order.total)}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 md:px-5 pb-6 md:pb-8 space-y-6 border-t border-black/5 bg-bfab-50/20">
          <div className="flex flex-wrap items-center gap-3 pt-5">
            <span
              className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => onStatus(e.target.value as OrderStatus)}
              className="text-sm border border-black/10 rounded-lg px-3 py-1.5 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Mark as {s.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-black/50">
              Payment: <span className="font-medium">{order.paymentStatus}</span>
            </span>
            <div className="flex-1" />
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-bfab-700 hover:bg-bfab-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-black/5 bg-white p-5">
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold text-bfab-700 mb-3">
                Customer
              </p>
              <p className="font-medium text-black mb-3">{fullName || 'Guest'}</p>
              <div className="space-y-2 text-sm">
                <a
                  href={`mailto:${order.customer.email}`}
                  className="flex items-center gap-2 text-black/80 hover:text-bfab-600"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="break-all">{order.customer.email}</span>
                </a>
                {order.customer.phone && (
                  <a
                    href={`tel:${order.customer.phone.replace(/[^\d+]/g, '')}`}
                    className="flex items-center gap-2 text-black/80 hover:text-bfab-600"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    {order.customer.phone}
                  </a>
                )}
                <div className="flex items-start gap-2 text-black/80">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p>{order.customer.address}</p>
                    {order.customer.apartment && <p>{order.customer.apartment}</p>}
                    <p>
                      {order.customer.city}, {order.customer.state}{' '}
                      {order.customer.zipCode}
                    </p>
                    <p>{order.customer.country}</p>
                  </div>
                </div>
                {order.customer.orderNote && (
                  <div className="mt-3 p-3 rounded-lg bg-bfab-50 border border-bfab-100 text-xs text-black/70">
                    <span className="font-semibold block mb-1 text-bfab-700 uppercase tracking-widest text-[9px]">
                      Note from customer
                    </span>
                    {order.customer.orderNote}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-black/5 bg-white p-5">
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold text-bfab-700 mb-3">
                Items
              </p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.id}-${item.size || idx}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-bfab-50 border border-black/5 shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/30">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-black/50">
                        {item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-bfab-600 font-medium">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-black/5 text-sm space-y-1.5">
                <div className="flex justify-between text-black/70">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">
                    {currency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-black/70">
                  <span>Shipping</span>
                  <span className="font-medium text-black">
                    {order.shipping === 0 ? 'FREE' : currency(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/10 text-base font-semibold">
                  <span className="text-black">Total</span>
                  <span className="text-bfab-600">{currency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
