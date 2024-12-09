export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          interval: string | null
          interval_count: number | null
          is_usage_based: boolean | null
          name: string
          price: string
          product_id: number
          product_name: string | null
          sort: number | null
          trial_interval: string | null
          trial_interval_count: number | null
          variant_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          is_usage_based?: boolean | null
          name: string
          price: string
          product_id: number
          product_name?: string | null
          sort?: number | null
          trial_interval?: string | null
          trial_interval_count?: number | null
          variant_id: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          is_usage_based?: boolean | null
          name?: string
          price?: string
          product_id?: number
          product_name?: string | null
          sort?: number | null
          trial_interval?: string | null
          trial_interval_count?: number | null
          variant_id?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          email: string
          ends_at: string | null
          id: string
          is_paused: boolean | null
          is_usage_based: boolean | null
          lemon_squeezy_id: string
          name: string
          order_id: number
          price: string
          renews_at: string | null
          status: string
          status_format: string
          subscription_item_id: number
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          ends_at?: string | null
          id?: string
          is_paused?: boolean | null
          is_usage_based?: boolean | null
          lemon_squeezy_id: string
          name: string
          order_id: number
          price: string
          renews_at?: string | null
          status: string
          status_format: string
          subscription_item_id?: number
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          ends_at?: string | null
          id?: string
          is_paused?: boolean | null
          is_usage_based?: boolean | null
          lemon_squeezy_id?: string
          name?: string
          order_id?: number
          price?: string
          renews_at?: string | null
          status?: string
          status_format?: string
          subscription_item_id?: number
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_event: {
        Row: {
          body: Json
          created_at: string
          event_name: string
          id: string
          processed: boolean | null
          processing_error: string | null
        }
        Insert: {
          body: Json
          created_at?: string
          event_name: string
          id?: string
          processed?: boolean | null
          processing_error?: string | null
        }
        Update: {
          body?: Json
          created_at?: string
          event_name?: string
          id?: string
          processed?: boolean | null
          processing_error?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never