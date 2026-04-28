export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          permission: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          permission: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          permission?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string | null
          created_at: string
          date: string
          id: string
          mode: string
          notes: string | null
          provider_id: string
          status: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date: string
          id?: string
          mode?: string
          notes?: string | null
          provider_id: string
          status?: string
          time: string
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date?: string
          id?: string
          mode?: string
          notes?: string | null
          provider_id?: string
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          avatar_url: string | null
          blood_type: string | null
          bmi: number | null
          condition: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          height: string | null
          id: string
          marital_status: string | null
          occupation: string | null
          phone: string | null
          provider_id: string
          status: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          bmi?: number | null
          condition?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          height?: string | null
          id?: string
          marital_status?: string | null
          occupation?: string | null
          phone?: string | null
          provider_id: string
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          bmi?: number | null
          condition?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          height?: string | null
          id?: string
          marital_status?: string | null
          occupation?: string | null
          phone?: string | null
          provider_id?: string
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      curated_diet_plans: {
        Row: {
          calories: string | null
          created_at: string
          created_by: string
          description: string | null
          duration: string | null
          features: string[] | null
          id: string
          image_url: string | null
          plan_name: string
          plan_type: string
          status: string
          tags: string[] | null
          total_meals: number | null
          updated_at: string
        }
        Insert: {
          calories?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          plan_name: string
          plan_type?: string
          status?: string
          tags?: string[] | null
          total_meals?: number | null
          updated_at?: string
        }
        Update: {
          calories?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          plan_name?: string
          plan_type?: string
          status?: string
          tags?: string[] | null
          total_meals?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          meals: Json | null
          plan_name: string
          provider_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          meals?: Json | null
          plan_name: string
          provider_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          meals?: Json | null
          plan_name?: string
          provider_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          client_id: string | null
          created_at: string
          date: string
          dosage: string | null
          id: string
          instructions: string | null
          medication: string
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          medication: string
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date?: string
          dosage?: string | null
          id?: string
          instructions?: string | null
          medication?: string
          provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic: string | null
          created_at: string
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          specialty: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          clinic?: string | null
          created_at?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          specialty?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          clinic?: string | null
          created_at?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          specialty?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string
          currency: string
          features: Json | null
          id: string
          max_clients: number | null
          name: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          billing_period?: string
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          max_clients?: number | null
          name: string
          price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          max_clients?: number | null
          name?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "provider"],
    },
  },
} as const
