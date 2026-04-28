import { useState, useEffect } from 'react';
import { Plus, Shield, Edit, Trash2, Save, Search, Ban, Eye, X, Grid, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  full_name: string;
  user_id: string;
  specialty: string | null;
  status: string;
  created_at: string;
  phone: string | null;
}

const ALL_PERMISSIONS = [
  { key: 'client_management', label: 'Client Management', desc: 'View and manage client records' },
  { key: 'diet_management', label: 'Diet Management', desc: 'Create and manage diet plan templates' },
  { key: 'prescriptions', label: 'Prescriptions', desc: 'Review and approve prescriptions' },
  { key: 'subscriptions', label: 'Subscriptions', desc: 'Manage subscription plans and billing' },
  { key: 'provider_management', label: 'Provider Management', desc: 'Manage provider accounts' },
];

const AdminManagement = () => {
  const { role } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: '' });
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);

  const fetchAdmins = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'admin');
    if (!roles || roles.length === 0) { setAdmins([]); return; }
    const userIds = roles.map(r => r.user_id);
    const [profileRes, permRes] = await Promise.all([
      supabase.from('profiles').select('*').in('user_id', userIds),
      supabase.from('admin_permissions').select('*').in('admin_user_id', userIds),
    ]);
    if (profileRes.data) setAdmins(profileRes.data);
    if (permRes.data) {
      const perms: Record<string, string[]> = {};
      permRes.data.forEach(p => {
        if (!perms[p.admin_user_id]) perms[p.admin_user_id] = [];
        perms[p.admin_user_id].push(p.permission);
      });
      setPermissions(perms);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const activeCount = admins.filter(a => a.status === 'active').length;

  const filtered = admins.filter(a => {
    const matchSearch = a.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-provider', {
        body: {
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
          role: 'admin',
          permissions: createPermissions,
        },
      });
      if (response.error) throw new Error(response.error.message);
      toast({ title: 'Admin created successfully' });
      setShowCreate(false);
      setCreateForm({ full_name: '', email: '', password: '' });
      setCreatePermissions([]);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleCreatePermission = (key: string) => {
    setCreatePermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const togglePermission = (userId: string, perm: string) => {
    setPermissions(prev => {
      const current = prev[userId] || [];
      const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
      return { ...prev, [userId]: updated };
    });
  };

  const savePermissions = async (userId: string) => {
    const userPerms = permissions[userId] || [];
    await supabase.from('admin_permissions').delete().eq('admin_user_id', userId);
    if (userPerms.length > 0) {
      await supabase.from('admin_permissions').insert(userPerms.map(p => ({ admin_user_id: userId, permission: p })));
    }
    toast({ title: 'Permissions saved' });
    setEditingAdmin(null);
  };

  const handleSuspend = async (admin: Admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    await supabase.from('profiles').update({ status: newStatus }).eq('user_id', admin.user_id);
    toast({ title: `Admin ${newStatus}` });
    fetchAdmins();
  };

  const handleDelete = async (admin: Admin) => {
    await supabase.from('admin_permissions').delete().eq('admin_user_id', admin.user_id);
    await supabase.from('user_roles').delete().eq('user_id', admin.user_id);
    toast({ title: 'Admin removed' });
    fetchAdmins();
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-success/10 text-success';
    if (s === 'suspended') return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Admin Management</h1>
          <p className="text-sm text-muted-foreground">{admins.length} admins · {activeCount} active</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus size={18} /> Create Admin
        </button>
      </div>

      {/* Search, Filter, View */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="flex rounded-lg border border-border">
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'} rounded-l-lg`}><List size={18} /></button>
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'} rounded-r-lg`}><Grid size={18} /></button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Status</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Permissions</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No admins found</td></tr>
            ) : filtered.map(admin => {
              const permCount = (permissions[admin.user_id] || []).length;
              return (
                <tr key={admin.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{admin.full_name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{admin.full_name}</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(admin.status)}`}>{admin.status}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{permCount}/{ALL_PERMISSIONS.length} modules</td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelectedAdmin(admin); setShowDetail(true); }} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Eye size={16} /></button>
                      <button onClick={() => setEditingAdmin(editingAdmin === admin.user_id ? null : admin.user_id)} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Edit size={16} /></button>
                      <button onClick={() => handleSuspend(admin)} className="rounded p-1.5 text-warning hover:bg-warning/10"><Ban size={16} /></button>
                      <button onClick={() => handleDelete(admin)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inline permissions editor */}
      {editingAdmin && (
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Edit Permissions — {admins.find(a => a.user_id === editingAdmin)?.full_name}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PERMISSIONS.map(perm => {
              const isActive = (permissions[editingAdmin] || []).includes(perm.key);
              return (
                <label key={perm.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="checkbox" checked={isActive} onChange={() => togglePermission(editingAdmin, perm.key)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <button onClick={() => savePermissions(editingAdmin)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Save size={14} /> Save Permissions
          </button>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Create Admin</h3>
                <p className="text-sm text-muted-foreground">Set up a new admin account with permissions.</p>
              </div>
              <button onClick={() => setShowCreate(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Full Name</label>
                <input type="text" placeholder="e.g. Jane Doe" value={createForm.full_name} onChange={e => setCreateForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input type="email" placeholder="admin@dietpadi.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
                <input type="password" placeholder="Minimum 8 characters" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Permissions</label>
                <div className="space-y-2">
                  {ALL_PERMISSIONS.map(perm => {
                    const isActive = createPermissions.includes(perm.key);
                    return (
                      <label key={perm.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <input type="checkbox" checked={isActive} onChange={() => toggleCreatePermission(perm.key)}
                          className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{perm.label}</p>
                          <p className="text-xs text-muted-foreground">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Admin Details</h3>
              <button onClick={() => setShowDetail(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><Shield size={24} className="text-primary" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{selectedAdmin.full_name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor(selectedAdmin.status)}`}>{selectedAdmin.status}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Permissions</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(permissions[selectedAdmin.user_id] || []).length === 0
                    ? <p className="text-sm text-muted-foreground">No permissions assigned</p>
                    : (permissions[selectedAdmin.user_id] || []).map(p => (
                      <span key={p} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary capitalize">{p.replace('_', ' ')}</span>
                    ))
                  }
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium text-foreground">{new Date(selectedAdmin.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <button onClick={() => setShowDetail(false)} className="mt-6 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
