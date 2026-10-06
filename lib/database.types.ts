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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          crop_cycle_id: string
          description: string | null
          farm_id: string
          id: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          crop_cycle_id: string
          description?: string | null
          farm_id: string
          id?: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          crop_cycle_id?: string
          description?: string | null
          farm_id?: string
          id?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_cycles: {
        Row: {
          actual_harvest_date: string | null
          area_unit: string
          created_at: string
          crop_id: string
          expected_harvest_date: string | null
          farm_id: string
          field_id: string
          id: string
          notes: string | null
          planted_area: number
          sowing_date: string
          status: string
          updated_at: string
          variety_id: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          area_unit?: string
          created_at?: string
          crop_id: string
          expected_harvest_date?: string | null
          farm_id: string
          field_id: string
          id?: string
          notes?: string | null
          planted_area: number
          sowing_date: string
          status?: string
          updated_at?: string
          variety_id?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          area_unit?: string
          created_at?: string
          crop_id?: string
          expected_harvest_date?: string | null
          farm_id?: string
          field_id?: string
          id?: string
          notes?: string | null
          planted_area?: number
          sowing_date?: string
          status?: string
          updated_at?: string
          variety_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_cycles_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_crop_id_variety_id_fkey"
            columns: ["crop_id", "variety_id"]
            isOneToOne: false
            referencedRelation: "crop_varieties"
            referencedColumns: ["crop_id", "id"]
          },
          {
            foreignKeyName: "crop_cycles_farm_id_field_id_fkey"
            columns: ["farm_id", "field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["farm_id", "id"]
          },
          {
            foreignKeyName: "crop_cycles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_varieties: {
        Row: {
          created_at: string
          crop_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          crop_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          crop_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_varieties_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          crop_cycle_id: string
          description: string | null
          expense_date: string
          farm_id: string
          id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          crop_cycle_id: string
          description?: string | null
          expense_date?: string
          farm_id: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          crop_cycle_id?: string
          description?: string | null
          expense_date?: string
          farm_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_unit: string
          created_at: string
          currency: string
          id: string
          location: string | null
          name: string
          owner_id: string
          total_area: number | null
          updated_at: string
        }
        Insert: {
          area_unit?: string
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          name: string
          owner_id: string
          total_area?: number | null
          updated_at?: string
        }
        Update: {
          area_unit?: string
          created_at?: string
          currency?: string
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          total_area?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fields: {
        Row: {
          area: number
          area_unit: string
          created_at: string
          farm_id: string
          id: string
          irrigation_type: string | null
          name: string
          notes: string | null
          soil_type: string | null
          updated_at: string
        }
        Insert: {
          area: number
          area_unit?: string
          created_at?: string
          farm_id: string
          id?: string
          irrigation_type?: string | null
          name: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
        }
        Update: {
          area?: number
          area_unit?: string
          created_at?: string
          farm_id?: string
          id?: string
          irrigation_type?: string | null
          name?: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fields_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      harvests: {
        Row: {
          created_at: string
          crop_cycle_id: string
          farm_id: string
          grade: string | null
          harvest_date: string
          id: string
          notes: string | null
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string
          crop_cycle_id: string
          farm_id: string
          grade?: string | null
          harvest_date: string
          id?: string
          notes?: string | null
          quantity: number
          unit: string
        }
        Update: {
          created_at?: string
          crop_cycle_id?: string
          farm_id?: string
          grade?: string | null
          harvest_date?: string
          id?: string
          notes?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvests_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          buyer_id: string | null
          created_at: string
          crop_cycle_id: string
          farm_id: string
          id: string
          notes: string | null
          payment_status: string
          quantity: number
          rate_per_unit: number
          sale_date: string
          total_amount: number | null
          unit: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          crop_cycle_id: string
          farm_id: string
          id?: string
          notes?: string | null
          payment_status?: string
          quantity: number
          rate_per_unit: number
          sale_date?: string
          total_amount?: number | null
          unit: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          crop_cycle_id?: string
          farm_id?: string
          id?: string
          notes?: string | null
          payment_status?: string
          quantity?: number
          rate_per_unit?: number
          sale_date?: string
          total_amount?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          crop_cycle_id: string
          due_date: string | null
          farm_id: string
          id: string
          notes: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          crop_cycle_id: string
          due_date?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          crop_cycle_id?: string
          due_date?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
