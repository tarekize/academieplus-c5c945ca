import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;

export interface AdminUser extends ProfileRow {
  // Computed fields from user_roles join
  roles?: string[];
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: any;
  ip_address: string | null;
  created_at: string | null;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface AdminStats {
  totalUsers: number;
  students: number;
  parents: number;
  admins: number;
  newUsersThisWeek: number;
  activeUsers: number;
}

export function useAdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    students: 0,
    parents: 0,
    admins: 0,
    newUsersThisWeek: 0,
    activeUsers: 0,
  });

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for all users
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Map roles to users
      const usersWithRoles = (data || []).map(profile => {
        const userRoles = rolesData?.filter(r => r.user_id === profile.id).map(r => r.role) || [];
        return { ...profile, roles: userRoles };
      });

      setUsers(usersWithRoles);

      // Calculate stats based on roles
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const roleCount = (role: string) => 
        usersWithRoles.filter(u => u.roles?.includes(role as any)).length;

      setStats({
        totalUsers: usersWithRoles.length,
        students: roleCount("student"),
        parents: roleCount("parent"),
        admins: roleCount("admin"),
        newUsersThisWeek:
          usersWithRoles.filter((u) => new Date(u.created_at || "") > oneWeekAgo).length,
        activeUsers: usersWithRoles.filter((u) => u.is_active).length,
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: active })
        .eq("id", userId);

      if (error) throw error;

      await supabase.rpc("log_activity", {
        _user_id: user?.id,
        _action: active ? "user_activated" : "user_deactivated",
        _details: { target_user_id: userId },
      });

      await fetchUsers();
      toast.success(active ? "Compte activé" : "Compte désactivé");
      return true;
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast.error("Erreur lors de la modification du statut");
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Use Edge Function to delete user from Auth and all related data
      const response = await supabase.functions.invoke("admin-delete-user", {
        body: { userId },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erreur lors de la suppression");
      }

      await supabase.rpc("log_activity", {
        _user_id: user?.id,
        _action: "user_deleted",
        _details: { target_user_id: userId },
      });

      await fetchUsers();
      toast.success("Utilisateur supprimé définitivement");
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Erreur lors de la suppression");
      return false;
    }
  };

  return {
    users,
    stats,
    loading,
    toggleUserStatus,
    deleteUser,
    refetch: fetchUsers,
  };
}

export function useActivityLogs(limit: number = 50) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          user:profiles(
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs((data as any[]) || []);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
