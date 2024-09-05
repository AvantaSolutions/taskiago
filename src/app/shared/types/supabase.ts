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
      tb_household_members: {
        Row: {
          household_id: number
          user_id: string
        }
        Insert: {
          household_id: number
          user_id?: string
        }
        Update: {
          household_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tb_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tb_households: {
        Row: {
          created_at: string
          created_by: string | null
          household_id: number
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          household_id?: number
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          household_id?: number
          name?: string
        }
        Relationships: []
      }
      tb_items: {
        Row: {
          completed: string | null
          created_at: string
          created_by: string
          frequency: number | null
          item_id: number
          label: string
          tag_id: number
        }
        Insert: {
          completed?: string | null
          created_at?: string
          created_by?: string
          frequency?: number | null
          item_id?: number
          label: string
          tag_id: number
        }
        Update: {
          completed?: string | null
          created_at?: string
          created_by?: string
          frequency?: number | null
          item_id?: number
          label?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tb_items_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tb_tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      tb_profiles: {
        Row: {
          avatar_img: string | null
          display_name: string | null
          email: string | null
          user_id: string
        }
        Insert: {
          avatar_img?: string | null
          display_name?: string | null
          email?: string | null
          user_id?: string
        }
        Update: {
          avatar_img?: string | null
          display_name?: string | null
          email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tb_tags: {
        Row: {
          color: string
          created_at: string
          created_by: string
          households: number[] | null
          name: string
          tag_id: number
        }
        Insert: {
          color: string
          created_at?: string
          created_by?: string
          households?: number[] | null
          name: string
          tag_id?: number
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string
          households?: number[] | null
          name?: string
          tag_id?: number
        }
        Relationships: []
      }
      tb_user_items: {
        Row: {
          id: number
          item_id: number
          user_id: string
        }
        Insert: {
          id?: number
          item_id: number
          user_id?: string
        }
        Update: {
          id?: number
          item_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tb_user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "tb_items"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "tb_user_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      get_household_for_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: number[]
      }
      get_items_for_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: number[]
      }
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
