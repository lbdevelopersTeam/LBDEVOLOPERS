import { useCallback, useEffect, useState } from 'react';
import { Edit3, Save, Trash2, UserPlus, Shield, Sparkles } from 'lucide-react';
import { fetchJson } from '../../lib/content';
import { cn } from '../../lib/utils';
import { ConfirmModal } from './AdminModal';

type Role = 'super_admin' | 'admin' | 'editor' | 'team_member';
interface UserRecord {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  displayName?: string;
  role: Role;
  is_active?: boolean;
  isActive?: boolean;
  team_member_id?: string | null;
  teamMemberId?: string | null;
  last_login_at?: string | null;
}
interface TeamOption {
  id: string;
  name: string;
  role: string;
}

const emptyForm = {
  username: '',
  email: '',
  displayName: '',
  password: '',
  role: 'editor' as Role,
  teamMemberId: '',
  isActive: true,
};
const fieldClass =
  'w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const labelClass = 'block text-[9px] font-black uppercase tracking-[0.24em] text-white/40';

export default function AccountManager() {
  const [items, setItems] = useState<UserRecord[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [users, team] = await Promise.all([
        fetchJson<{ items: UserRecord[] }>('/api/v2/admin/users'),
        fetchJson<{ items: TeamOption[] }>('/api/v2/admin/team?limit=100'),
      ]);
      setItems(users.items);
      setTeamOptions(team.items);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice('');
    setError('');
    try {
      const payload: Record<string, string | boolean | null> = {
        username: form.username,
        email: form.email,
        displayName: form.displayName,
        role: form.role,
        teamMemberId: form.teamMemberId || null,
        isActive: form.isActive,
      };
      if (form.password) payload.password = form.password;
      await fetchJson(`/api/v2/admin/users${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNotice(`Account ${editingId ? 'updated' : 'created'} successfully.`);
      setEditingId('');
      setForm(emptyForm);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save account.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetchJson(`/api/v2/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      setNotice(`Account @${deleteTarget.username} deleted and sessions revoked.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to delete account.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const edit = (item: UserRecord) => {
    setEditingId(item.id);
    setForm({
      username: item.username,
      email: item.email,
      displayName: item.displayName || item.display_name || '',
      password: '',
      role: item.role,
      teamMemberId: item.teamMemberId || item.team_member_id || '',
      isActive: item.isActive ?? item.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
          <Shield className="h-4 w-4" /> Security & Access Control
        </div>
        <h3 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">Administrator Accounts</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Create least-privilege accounts and link team-member logins to specific portfolio profiles. Password updates or role changes revoke all active sessions immediately.
        </p>
      </div>

      {(notice || error) && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between rounded-2xl border px-5 py-4 text-sm backdrop-blur-xl',
            error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          )}
        >
          <span>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setNotice('');
              setError('');
            }}
            className="text-xs uppercase tracking-wider opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Form */}
        <form
          onSubmit={save}
          className="h-fit space-y-4 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-3 border-b border-white/[0.07] pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <UserPlus className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-black uppercase text-white">
              {editingId ? 'Edit Account' : 'New Account'}
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Username</label>
            <input
              required
              minLength={3}
              maxLength={64}
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className={fieldClass}
              placeholder="e.g. john_doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className={fieldClass}
              placeholder="admin@lbdevelopers.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Display Name</label>
            <input
              required
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
              className={fieldClass}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>{editingId ? 'New Password (Optional)' : 'Password (12+ characters)'}</label>
            <input
              required={!editingId}
              minLength={12}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className={fieldClass}
              placeholder={editingId ? 'Leave blank to keep current' : 'Min 12 characters'}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Role & Permissions</label>
            <select
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value as Role,
                  teamMemberId: event.target.value === 'team_member' ? form.teamMemberId : '',
                })
              }
              className={fieldClass}
            >
              {(['super_admin', 'admin', 'editor', 'team_member'] as Role[]).map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {form.role === 'team_member' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Linked Team Profile</label>
              <select
                required
                value={form.teamMemberId}
                onChange={(event) => setForm({ ...form, teamMemberId: event.target.value })}
                className={fieldClass}
              >
                <option value="">Select a team profile...</option>
                {teamOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {member.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              className="h-4 w-4 rounded accent-brand-primary"
            />
            Active Account
          </label>

          <div className="flex gap-3 pt-2">
            <button
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(61,90,254,0.3)] transition hover:bg-brand-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save Account
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId('');
                  setForm(emptyForm);
                }}
                className="rounded-xl border border-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* User list */}
        <div className="space-y-3">
          {items.map((item) => {
            const isActive = item.isActive ?? item.is_active ?? true;
            return (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/80 p-5 shadow-lg transition-all duration-200 hover:border-white/15 hover:bg-[#10121e] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="truncate font-display text-base font-bold text-white">
                      {item.displayName || item.display_name}
                    </h4>
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
                        item.role === 'super_admin'
                          ? 'border border-brand-purple/30 bg-brand-purple/10 text-brand-purple'
                          : 'border border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                      )}
                    >
                      {item.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="truncate text-xs font-semibold text-white/60">@{item.username} · {item.email}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-white/35">
                    <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-red-400')} />
                    <span>{isActive ? 'Active status' : 'Suspended'}</span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                    aria-label={`Edit ${item.username}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400"
                    aria-label={`Delete ${item.username}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Custom Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Administrator Account"
        message={`Are you sure you want to delete the account for @${deleteTarget?.username}? All active sessions and access will be revoked immediately.`}
        confirmText="Delete Account"
        tone="danger"
      />
    </div>
  );
}
