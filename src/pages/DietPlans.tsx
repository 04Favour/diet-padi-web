import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Clock, Zap, Utensils, CheckSquare, ArrowLeft, X, PlusCircle, Eye, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DietPlan {
  id: string;
  plan_name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  client_id: string | null;
  clients?: { full_name: string } | null;
  meals?: any;
}

interface CuratedPlan {
  id: string;
  plan_name: string;
  description: string | null;
  plan_type: string;
  duration: string | null;
  calories: string | null;
  total_meals: number | null;
  tags: string[];
  features: string[];
  image_url: string | null;
  status: string;
}

type Tab = 'curated' | 'client';
type View = 'list' | 'request';

const DietPlans = () => {
  const { user, role } = useAuth();
  const [tab, setTab] = useState<Tab>('curated');
  const [view, setView] = useState<View>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [curatedPlans, setCuratedPlans] = useState<CuratedPlan[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string; gender: string | null; date_of_birth: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurated, setSelectedCurated] = useState<CuratedPlan | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignClient, setAssignClient] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const deleteTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  // Request form state
  const [reqClient, setReqClient] = useState('');
  const [reqPlanType, setReqPlanType] = useState('');
  const [reqDuration, setReqDuration] = useState('');
  const [reqCalories, setReqCalories] = useState('');
  const [reqDietary, setReqDietary] = useState('');
  const [reqAllergies, setReqAllergies] = useState('');
  const [reqMeals, setReqMeals] = useState<string[]>([]);
  const [reqOtherMeal, setReqOtherMeal] = useState('');
  const [reqNote, setReqNote] = useState('');

  const fetchData = async () => {
    if (!user) return;
    const [planRes, clientRes, curatedRes] = await Promise.all([
      supabase.from('diet_plans').select('*, clients(full_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, full_name, gender, date_of_birth'),
      supabase.from('curated_diet_plans').select('*').eq('status', 'Active').order('created_at', { ascending: false }),
    ]);
    if (planRes.data) setPlans(planRes.data);
    if (clientRes.data) setClients(clientRes.data);
    if (curatedRes.data) setCuratedPlans(curatedRes.data as any);
  };

  useEffect(() => { fetchData(); }, [user]);

  const allTags = [...new Set(curatedPlans.flatMap(p => p.tags || []))];

  const filteredPlans = plans.filter(p => {
    if (pendingDeletes.has(p.id)) return false;
    const matchSearch = p.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clients?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All Statuses' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCurated = curatedPlans.filter(p => {
    const matchSearch = p.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'All Types' || p.plan_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = async (id: string) => {
    setPendingDeletes(prev => new Set(prev).add(id));
    const toastInstance = toast({
      title: 'Diet plan deleted',
      description: 'Undo this action within 10 seconds.',
      action: (
        <button onClick={() => {
          clearTimeout(deleteTimerRef.current[id]);
          delete deleteTimerRef.current[id];
          setPendingDeletes(prev => { const n = new Set(prev); n.delete(id); return n; });
          toast({ title: 'Deletion cancelled' });
        }} className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          <Undo2 size={12} /> Undo
        </button>
      ),
    });
    deleteTimerRef.current[id] = setTimeout(async () => {
      await supabase.from('diet_plans').delete().eq('id', id);
      setPendingDeletes(prev => { const n = new Set(prev); n.delete(id); return n; });
      delete deleteTimerRef.current[id];
      fetchData();
    }, 10000);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    setLoading(true);
    const { error } = await supabase.from('diet_plans').update({
      plan_name: editName,
      description: editDesc || null,
      start_date: editStart || null,
      end_date: editEnd || null,
    }).eq('id', editingPlan.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Diet plan updated!' });
      setEditingPlan(null);
      fetchData();
    }
  };

  const openEdit = (plan: DietPlan) => {
    setEditingPlan(plan);
    setEditName(plan.plan_name);
    setEditDesc(plan.description || '');
    setEditStart(plan.start_date || '');
    setEditEnd(plan.end_date || '');
  };

  const toggleMeal = (meal: string) => {
    setReqMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
  };

  const handleAddOtherMeal = () => {
    if (reqOtherMeal.trim() && !reqMeals.includes(reqOtherMeal.trim())) {
      setReqMeals(prev => [...prev, reqOtherMeal.trim()]);
      setReqOtherMeal('');
    }
  };

  const handleAssignPlan = async () => {
    if (!user || !assignClient || !selectedCurated) return;
    setLoading(true);
    const { error } = await supabase.from('diet_plans').insert({
      plan_name: selectedCurated.plan_name,
      description: selectedCurated.description,
      client_id: assignClient,
      provider_id: user.id,
      status: 'Pending',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Plan submitted for approval!', description: 'The super admin will review and approve the plan.' });
      // Notify super admin
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').in('role', ['super_admin']);
      const client = clients.find(c => c.id === assignClient);
      if (adminRoles) {
        await supabase.from('notifications').insert(
          adminRoles.map(r => ({
            user_id: r.user_id,
            title: 'Diet Plan Awaiting Approval',
            message: `A provider assigned "${selectedCurated.plan_name}" to ${client?.full_name || 'a client'}. Please review.`,
            type: 'info',
          }))
        );
      }
      setShowAssign(false);
      setAssignClient('');
      setSelectedCurated(null);
      fetchData();
    }
    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (!user || !reqClient) return;
    setLoading(true);
    const client = clients.find(c => c.id === reqClient);
    const { error } = await supabase.from('diet_plans').insert({
      plan_name: reqPlanType || 'Custom Diet Plan',
      description: [reqDietary, reqAllergies, `Meals: ${reqMeals.join(', ')}`, reqNote].filter(Boolean).join(' | '),
      client_id: reqClient,
      provider_id: user.id,
      status: 'Pending',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Diet plan request submitted!' });
      const { data: adminRoles } = await supabase.from('user_roles').select('user_id').in('role', ['super_admin', 'admin']);
      if (adminRoles) {
        await supabase.from('notifications').insert(
          adminRoles.map(r => ({
            user_id: r.user_id,
            title: 'New Diet Plan Request',
            message: `A provider requested a custom diet plan for ${client?.full_name || 'a client'}.`,
            type: 'info',
          }))
        );
      }
      setView('list');
      setReqClient(''); setReqPlanType(''); setReqDuration(''); setReqCalories('');
      setReqDietary(''); setReqAllergies(''); setReqMeals([]); setReqOtherMeal(''); setReqNote('');
      fetchData();
    }
    setLoading(false);
  };

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  // View Details Modal
  if (selectedCurated && !showAssign) {
    return (
      <div>
        <button onClick={() => setSelectedCurated(null)} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to Diet Plans
        </button>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4 mb-6">
            {selectedCurated.image_url ? (
              <img src={selectedCurated.image_url} alt={selectedCurated.plan_name} className="h-20 w-20 rounded-lg object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10">
                <Utensils size={32} className="text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{selectedCurated.plan_name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{selectedCurated.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedCurated.tags?.map((tag, i) => (
                  <span key={i} className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-accent" />
              <p className="text-sm font-semibold text-foreground">{selectedCurated.duration || '—'}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <Zap size={20} className="mx-auto mb-2 text-accent" />
              <p className="text-sm font-semibold text-foreground">{selectedCurated.calories || '—'}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <Utensils size={20} className="mx-auto mb-2 text-accent" />
              <p className="text-sm font-semibold text-foreground">{selectedCurated.total_meals || 0}</p>
              <p className="text-xs text-muted-foreground">Total Meals</p>
            </div>
          </div>

          {selectedCurated.features && selectedCurated.features.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-foreground">What's Included</h3>
              <div className="space-y-2">
                {selectedCurated.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckSquare size={16} className="text-primary" /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setShowAssign(true)}
            className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground">
            Assign Plan to Client
          </button>
        </div>
      </div>
    );
  }

  // Assign Plan Modal
  if (showAssign && selectedCurated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Assign Plan</h2>
            <button onClick={() => { setShowAssign(false); setSelectedCurated(null); }}><X size={20} className="text-muted-foreground" /></button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Assign <span className="font-medium text-foreground">{selectedCurated.plan_name}</span> to a client:</p>
          <select value={assignClient} onChange={e => setAssignClient(e.target.value)}
            className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
            <option value="">Choose a client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
          <div className="flex gap-3">
            <button onClick={() => { setShowAssign(false); setSelectedCurated(null); }}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
            <button onClick={handleAssignPlan} disabled={loading || !assignClient}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'request') {
    return (
      <div>
        <div className="mb-6">
          <button onClick={() => setView('list')} className="mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-2xl font-bold text-primary">Request Custom Diet Plan</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to request a personalised diet plan for your client</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Select Client</label>
              <select value={reqClient} onChange={e => setReqClient(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                <option value="">Choose a client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Plan Type</label>
              <input type="text" value={reqPlanType} onChange={e => setReqPlanType(e.target.value)} placeholder="Select type"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Duration</label>
              <select value={reqDuration} onChange={e => setReqDuration(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
                <option value="">Select duration</option>
                {['2 Weeks', '4 Weeks', '6 Weeks', '8 Weeks', '12 Weeks', '14 Weeks'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Total Calories</label>
              <input type="text" value={reqCalories} onChange={e => setReqCalories(e.target.value)} placeholder="Total calories required"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Dietary Considerations</label>
              <input type="text" value={reqDietary} onChange={e => setReqDietary(e.target.value)} placeholder="E.g, Vegetarian, Gluten-free, Vegan"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Allergies</label>
              <input type="text" value={reqAllergies} onChange={e => setReqAllergies(e.target.value)} placeholder="E.g, Groundnuts, Catfish, Pepper"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Daily Meal Options</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(meal => (
                  <button key={meal} type="button" onClick={() => toggleMeal(meal)}
                    className={`rounded-lg border px-6 py-3 text-sm font-medium transition-colors ${reqMeals.includes(meal) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted'}`}>
                    {meal}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={reqOtherMeal} onChange={e => setReqOtherMeal(e.target.value)}
                  placeholder="Others" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOtherMeal())}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <button type="button" onClick={handleAddOtherMeal} className="rounded-lg p-2.5 text-accent hover:bg-muted">
                  <PlusCircle size={20} />
                </button>
              </div>
              {reqMeals.filter(m => !['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(m)).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {reqMeals.filter(m => !['Breakfast', 'Lunch', 'Dinner', 'Snacks'].includes(m)).map(m => (
                    <span key={m} className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {m} <button onClick={() => setReqMeals(prev => prev.filter(x => x !== m))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Additional Note</label>
              <textarea value={reqNote} onChange={e => setReqNote(e.target.value)} placeholder="Describe the diet plan"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" rows={4} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmitRequest} disabled={loading || !reqClient}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Diet Plan Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage personalized diet plans for your clients</p>
        </div>
        <button onClick={() => setView('request')}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          Request Custom Diet Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-border">
        <button onClick={() => setTab('curated')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${tab === 'curated' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
          Curated Diet Plans
        </button>
        <button onClick={() => setTab('client')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${tab === 'client' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}>
          Client Diet Plans
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        {tab === 'curated' && (
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
            <option>All Types</option>
            {[...new Set(curatedPlans.map(p => p.plan_type))].map(t => <option key={t}>{t}</option>)}
          </select>
        )}
        {tab === 'client' && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none">
            {['All Statuses', 'Pending', 'Active', 'Approved', 'Rejected', 'Completed'].map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {tab === 'curated' ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Available Diet Packages</h2>
              <p className="text-sm text-muted-foreground">Pre-designed packages to assign to clients</p>
            </div>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setSearchQuery(searchQuery === tag ? '' : tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${searchQuery === tag ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {tag}
                </button>
              ))}
            </div>
          )}

          {filteredCurated.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No curated diet plans available yet. They will be added by the admin.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredCurated.map(plan => (
                <div key={plan.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-start gap-4">
                    {plan.image_url ? (
                      <img src={plan.image_url} alt={plan.plan_name} className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                        <Utensils size={24} className="text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground">{plan.plan_name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {plan.tags?.map((tag, i) => (
                          <span key={i} className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={14} /> {plan.duration || '—'}</span>
                    <span className="flex items-center gap-1"><Zap size={14} /> {plan.calories || '—'}</span>
                    <span className="flex items-center gap-1"><Utensils size={14} /> {plan.total_meals || 0} meals</span>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-semibold text-foreground">What's Included</h4>
                      <div className="space-y-1.5">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckSquare size={14} className="text-primary" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setSelectedCurated(plan)}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Client Diet Plans</h2>
          {filteredPlans.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No client diet plans found. Request a custom plan!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map(plan => {
                const client = clients.find(c => c.id === plan.client_id);
                const age = client ? getAge(client.date_of_birth) : null;
                return (
                  <div key={plan.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {plan.clients?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{plan.clients?.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">
                            {client?.gender || ''}{age ? ` | ${age} years old` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        plan.status === 'Active' || plan.status === 'Approved' ? 'bg-success/10 text-success' :
                        plan.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                        plan.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                      }`}>{plan.status}</span>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-base font-semibold text-foreground">{plan.plan_name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description || 'No description'}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={14} /> {plan.start_date || '—'} → {plan.end_date || '—'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(plan)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(plan.id)}
                          className="flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                      <button onClick={() => setSelectedPlan(plan)} className="flex items-center gap-1 rounded-lg border border-primary px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
                        <Eye size={12} /> View Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View Plan Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Diet Plan Details</h3>
              <button onClick={() => setSelectedPlan(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              selectedPlan.status === 'Active' || selectedPlan.status === 'Approved' ? 'bg-success/10 text-success' :
              selectedPlan.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
              selectedPlan.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
            }`}>{selectedPlan.status}</span>
            <h2 className="mt-3 text-xl font-bold text-foreground">{selectedPlan.plan_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedPlan.description || 'No description'}</p>
            <div className="mt-6 space-y-3">
              <div><p className="text-xs text-muted-foreground">Client</p><p className="text-sm font-medium text-foreground">{selectedPlan.clients?.full_name || '—'}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium text-foreground">{selectedPlan.start_date || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm font-medium text-foreground">{selectedPlan.end_date || '—'}</p></div>
              </div>
            </div>
            <button onClick={() => setSelectedPlan(null)} className="mt-6 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted">Close</button>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Edit Diet Plan</h3>
              <button onClick={() => setEditingPlan(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Plan Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Start Date</label>
                  <input type="date" value={editStart} onChange={e => setEditStart(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">End Date</label>
                  <input type="date" value={editEnd} onChange={e => setEditEnd(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditingPlan(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSaveEdit} disabled={loading || !editName.trim()}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlans;
