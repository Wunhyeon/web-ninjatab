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
      alarm_sound: {
        Row: {
          created_at: string
          id: string
          name: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          url?: string | null
        }
        Relationships: []
      }
      notion_database_info: {
        Row: {
          created_at: string
          database_id: string
          database_name: string
          deleted_at: string | null
          id: string
          notion_info_id: string
          timer_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          database_id: string
          database_name: string
          deleted_at?: string | null
          id?: string
          notion_info_id: string
          timer_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          database_id?: string
          database_name?: string
          deleted_at?: string | null
          id?: string
          notion_info_id?: string
          timer_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notion_database_info_notion_info_id_fkey"
            columns: ["notion_info_id"]
            isOneToOne: false
            referencedRelation: "notion_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notion_database_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notion_info_timer_id_fkey"
            columns: ["timer_id"]
            isOneToOne: false
            referencedRelation: "timers"
            referencedColumns: ["id"]
          },
        ]
      }
      notion_info: {
        Row: {
          access_token: string
          bot_id: string
          created_at: string
          deleted_at: string | null
          id: string
          token_type: string
          updated_at: string | null
          user_id: string
          workspace_id: string
          workspace_name: string
        }
        Insert: {
          access_token: string
          bot_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          token_type: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
          workspace_name: string
        }
        Update: {
          access_token?: string
          bot_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          token_type?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
          workspace_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "notion_info_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      timers: {
        Row: {
          alarm_sound_id: string | null
          alarm_sound_volume: number
          breaktime: number
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          time_zone: string | null
          updated_at: string | null
          user_id: string
          worktime: number
        }
        Insert: {
          alarm_sound_id?: string | null
          alarm_sound_volume?: number
          breaktime?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          time_zone?: string | null
          updated_at?: string | null
          user_id: string
          worktime?: number
        }
        Update: {
          alarm_sound_id?: string | null
          alarm_sound_volume?: number
          breaktime?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          time_zone?: string | null
          updated_at?: string | null
          user_id?: string
          worktime?: number
        }
        Relationships: [
          {
            foreignKeyName: "timers_alarm_sound_id_fkey"
            columns: ["alarm_sound_id"]
            isOneToOne: false
            referencedRelation: "alarm_sound"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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
