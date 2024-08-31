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
      notion_info: {
        Row: {
          access_token: string | null
          created_at: string
          database_id: string | null
          database_name: string | null
          deleted_at: string | null
          id: string
          timer_id: string
          token_type: string | null
          updated_at: string | null
          workspace_id: string | null
          workspace_name: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          database_id?: string | null
          database_name?: string | null
          deleted_at?: string | null
          id?: string
          timer_id: string
          token_type?: string | null
          updated_at?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          database_id?: string | null
          database_name?: string | null
          deleted_at?: string | null
          id?: string
          timer_id?: string
          token_type?: string | null
          updated_at?: string | null
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notion_info_timer_id_fkey"
            columns: ["timer_id"]
            isOneToOne: false
            referencedRelation: "timers"
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
      timers: {
        Row: {
          alarm_sound_id: string | null
          alarm_sound_volume: number
          breaktime: number | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          time_zone: string | null
          updated_at: string | null
          user_id: string
          worktime: number | null
        }
        Insert: {
          alarm_sound_id?: string | null
          alarm_sound_volume?: number
          breaktime?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          time_zone?: string | null
          updated_at?: string | null
          user_id: string
          worktime?: number | null
        }
        Update: {
          alarm_sound_id?: string | null
          alarm_sound_volume?: number
          breaktime?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          time_zone?: string | null
          updated_at?: string | null
          user_id?: string
          worktime?: number | null
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
