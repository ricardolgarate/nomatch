import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Inbox,
  Search,
  Trash2,
  Mail,
  Phone,
  Copy,
  Users,
  MessagesSquare,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  ContactMessage,
  ContactStatus,
  deleteContactMessage,
  deleteSubscriber,
  getAllContactMessages,
  getAllSubscribers,
  Subscriber,
  updateContactStatus,
} from '../firebase/customers';

type Tab = 'subscribers' | 'messages';

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_STYLES: Record<ContactStatus, string> = {
  new: 'bg-bfab-100 text-bfab-800',
  read: 'bg-bfab-50 text-bfab-700 border border-bfab-200',
  replied: 'bg-bfab-600 text-white',
  archived: 'bg-black/10 text-black/60',
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

export default function Customers() {
  const [tab, setTab] = useState<Tab>('subscribers');

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, msgs] = await Promise.all([
        getAllSubscribers(),
        getAllContactMessages(),
      ]);
      setSubscribers(subs);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      setError('Could not load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q),
    );
  }, [subscribers, search]);

  const filteredMsgs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return [
        m.name,
        m.email,
        m.phone || '',
        m.message,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [messages, search, statusFilter]);

  const stats = useMemo(() => {
    const msgCounts: Record<ContactStatus | 'all', number> = {
      all: messages.length,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
    for (const m of messages) msgCounts[m.status]++;
    return {
      totalSubs: subscribers.length,
      msgCounts,
    };
  }, [messages, subscribers]);

  const copyAllEmails = async () => {
    const emails = filteredSubs.map((s) => s.email).join(', ');
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Could not copy to clipboard.');
    }
  };

  const exportCSV = () => {
    const rows: string[] = [];
    if (tab === 'subscribers') {
      rows.push('email,source,signed_up_at');
      for (const s of filteredSubs) {
        rows.push(
          [s.email, s.source, s.createdAt ? s.createdAt.toISOString() : '']
            .map(csvEscape)
            .join(','),
        );
      }
    } else {
      rows.push('name,email,phone,status,message,submitted_at');
      for (const m of filteredMsgs) {
        rows.push(
          [
            m.name,
            m.email,
            m.phone || '',
            m.status,
            m.message,
            m.createdAt ? m.createdAt.toISOString() : '',
          ]
            .map(csvEscape)
            .join(','),
        );
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bfab-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSub = async (s: Subscriber) => {
    if (!confirm(`Remove ${s.email} from the list?`)) return;
    setSubscribers((prev) => prev.filter((x) => x.id !== s.id));
    try {
      await deleteSubscriber(s.id);
    } catch (err) {
      console.error(err);
      await refresh();
    }
  };

  const handleDeleteMsg = async (m: ContactMessage) => {
    if (!confirm(`Delete message from ${m.name || m.email}?`)) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    try {
      await deleteContactMessage(m.id);
    } catch (err) {
      console.error(err);
      await refresh();
    }
  };

  const handleStatus = async (id: string, status: ContactStatus) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    );
    try {
      await updateContactStatus(id, status);
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
              Your <span className="italic text-bfab-600">Customers</span>
            </h1>
            <p className="text-black/60 font-light mt-2">
              Newsletter signups and messages from the contact form.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/add"
              className="inline-flex items-center gap-2 px-5 py-3 text-black/70 hover:text-bfab-600 font-medium"
            >
              Products
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-5 py-3 text-black/70 hover:text-bfab-600 font-medium"
            >
              Orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Subscribers"
            value={String(stats.totalSubs)}
            accent={tab === 'subscribers'}
          />
          <StatCard label="New messages" value={String(stats.msgCounts.new)} />
          <StatCard label="Replied" value={String(stats.msgCounts.replied)} />
          <StatCard label="Total messages" value={String(stats.msgCounts.all)} />
        </div>

        <div className="flex items-center gap-1 mb-4 border-b border-black/10">
          <TabButton
            active={tab === 'subscribers'}
            onClick={() => {
              setTab('subscribers');
              setSearch('');
            }}
          >
            <Users className="w-4 h-4" />
            Subscribers
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                tab === 'subscribers'
                  ? 'bg-bfab-600 text-white'
                  : 'bg-black/10 text-black/60'
              }`}
            >
              {stats.totalSubs}
            </span>
          </TabButton>
          <TabButton
            active={tab === 'messages'}
            onClick={() => {
              setTab('messages');
              setSearch('');
            }}
          >
            <MessagesSquare className="w-4 h-4" />
            Messages
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                tab === 'messages'
                  ? 'bg-bfab-600 text-white'
                  : 'bg-black/10 text-black/60'
              }`}
            >
              {stats.msgCounts.all}
            </span>
          </TabButton>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === 'subscribers'
                  ? 'Search by email…'
                  : 'Search name, email, phone, message…'
              }
              className="input-base pl-11"
            />
          </div>
          {tab === 'messages' && (
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="input-base md:w-48"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            {tab === 'subscribers' && filteredSubs.length > 0 && (
              <button
                onClick={copyAllEmails}
                className="inline-flex items-center gap-2 px-4 py-3 border border-black/15 rounded-lg font-medium text-black hover:bg-black/5 transition-colors whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy emails'}
              </button>
            )}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-3 border border-black/15 rounded-lg font-medium text-black hover:bg-black/5 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
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
            Loading customers…
          </div>
        ) : tab === 'subscribers' ? (
          filteredSubs.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12 text-bfab-300 mx-auto mb-4" />}
              title={
                subscribers.length === 0
                  ? 'No subscribers yet'
                  : 'No subscribers match that search'
              }
              copy={
                subscribers.length === 0
                  ? 'Newsletter signups from the home page will appear here.'
                  : 'Try a different email or clear the search.'
              }
            />
          ) : (
            <div className="bg-white border border-black/5 rounded-2xl shadow-card overflow-hidden">
              <div className="divide-y divide-black/5">
                {filteredSubs.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 p-4 md:p-5 hover:bg-bfab-50/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-bfab-100 text-bfab-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`mailto:${s.email}`}
                        className="block font-medium text-black hover:text-bfab-600 truncate"
                      >
                        {s.email}
                      </a>
                      <p className="text-xs text-black/50">
                        {s.source} · {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSub(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-bfab-700 hover:bg-bfab-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : filteredMsgs.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-12 h-12 text-bfab-300 mx-auto mb-4" />}
            title={
              messages.length === 0
                ? 'No messages yet'
                : 'No messages match those filters'
            }
            copy={
              messages.length === 0
                ? 'Messages from the Contact form will land here.'
                : 'Try a different status or clear the search.'
            }
          />
        ) : (
          <div className="bg-white border border-black/5 rounded-2xl shadow-card overflow-hidden">
            <div className="divide-y divide-black/5">
              {filteredMsgs.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  expanded={expandedId === m.id}
                  onToggle={() =>
                    setExpandedId(expandedId === m.id ? null : m.id)
                  }
                  onStatus={(status) => handleStatus(m.id, status)}
                  onDelete={() => handleDeleteMsg(m)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function csvEscape(value: string | number | undefined): string {
  const str = value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium tracking-wide transition-colors ${
        active ? 'text-bfab-700' : 'text-black/60 hover:text-black'
      }`}
    >
      {children}
      <span
        className={`absolute left-0 right-0 -bottom-px h-[2px] bg-bfab-600 transition-transform ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </button>
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

function EmptyState({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl p-16 text-center shadow-card">
      {icon}
      <h2 className="font-display text-2xl text-black mb-2">{title}</h2>
      <p className="text-black/60 font-light">{copy}</p>
    </div>
  );
}

function MessageRow({
  message,
  expanded,
  onToggle,
  onStatus,
  onDelete,
}: {
  message: ContactMessage;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: ContactStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div>
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
            <p className="font-medium text-black truncate">
              {message.name || 'Anonymous'}
            </p>
            <p className="text-xs text-black/50 truncate">{message.email}</p>
          </div>
          <div className="md:col-span-5 text-sm text-black/70 truncate">
            {message.message.slice(0, 80)}
            {message.message.length > 80 ? '…' : ''}
          </div>
          <div className="md:col-span-2 text-xs text-black/50">
            {formatDate(message.createdAt)}
          </div>
          <div className="md:col-span-1 flex md:justify-end">
            <span
              className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded-full font-semibold ${STATUS_STYLES[message.status]}`}
            >
              {message.status}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 md:px-5 pb-6 md:pb-7 space-y-5 border-t border-black/5 bg-bfab-50/20">
          <div className="flex flex-wrap items-center gap-3 pt-5">
            <select
              value={message.status}
              onChange={(e) => onStatus(e.target.value as ContactStatus)}
              className="text-sm border border-black/10 rounded-lg px-3 py-1.5 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Mark as {s.label}
                </option>
              ))}
            </select>
            <a
              href={`mailto:${message.email}?subject=Re:%20your%20message%20to%20Beauty%20For%20Ashes%20Boutique`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-bfab-700 hover:bg-bfab-50 rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Reply via email
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-bfab-700 hover:bg-bfab-50 rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {message.phone}
              </a>
            )}
            <div className="flex-1" />
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-bfab-700 hover:bg-bfab-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <div className="rounded-xl border border-black/5 bg-white p-5 whitespace-pre-wrap text-black/80 leading-relaxed">
            {message.message}
          </div>
        </div>
      )}
    </div>
  );
}
