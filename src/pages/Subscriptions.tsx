import { useState, useEffect } from "react";
import { CreditCard, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  user_id: string;
}

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const fetchSubscriptions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      const activeCount = (data || []).filter(
        (s) => s.status === "active",
      ).length;
      setStats({ total: data?.length || 0, active: activeCount });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plans
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <CreditCard size={18} />
            <span className="text-sm">Total Subscriptions</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Users size={18} />
            <span className="text-sm">Active Plans</span>
          </div>
          <p className="text-2xl font-bold text-success">{stats.active}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Plan Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {sub.plan_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${sub.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
