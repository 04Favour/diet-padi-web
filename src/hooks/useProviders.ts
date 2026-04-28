import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ProviderRow,
  formatDate,
  makeRatingFromId,
  normalizeStatus,
} from "@/components/provider-utils";

export const useProviders = () => {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const [roleRes, clientRes, appointmentRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "provider"),
        supabase.from("clients").select("provider_id"),
        supabase.from("appointments").select("provider_id"),
      ]);

      if (roleRes.error) throw roleRes.error;

      const providerIds = roleRes.data?.map((role) => role.user_id) || [];
      if (!providerIds.length) {
        setProviders([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", providerIds)
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      const clientCounts = new Map<string, number>();
      clientRes.data?.forEach((client) => {
        const key = client.provider_id;
        if (!key) return;
        clientCounts.set(key, (clientCounts.get(key) ?? 0) + 1);
      });

      const appointmentCounts = new Map<string, number>();
      appointmentRes.data?.forEach((appt) => {
        const key = appt.provider_id;
        if (!key) return;
        appointmentCounts.set(key, (appointmentCounts.get(key) ?? 0) + 1);
      });

      setProviders(
        (profiles || []).map((profile) => ({
          id: profile.user_id,
          user_id: profile.user_id,
          name: profile.full_name,
          avatar:
            profile.avatar_url ||
            `https://i.pravatar.cc/150?u=${profile.user_id}`,
          specialty: profile.specialty || "Provider",
          status: normalizeStatus(profile.status || "active"),
          email: "Not available",
          phone: profile.phone || "N/A",
          location: profile.clinic || "N/A",
          bio: "No additional bio available.",
          licenseNumber: profile.license_number || "N/A",
          joined: formatDate(profile.created_at),
          appointmentCount: appointmentCounts.get(profile.user_id) ?? 0,
          clientCount: clientCounts.get(profile.user_id) ?? 0,
          rating: makeRatingFromId(profile.user_id),
        })),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Unable to load providers",
        description: message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return { providers, loading, refetch: fetchProviders };
};
