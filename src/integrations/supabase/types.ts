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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          boarding_time: string | null
          created_at: string
          flight_id: string
          gate: string | null
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string | null
          seat_number: string
          status: string
          total_price: number
          tracking_code: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          boarding_time?: string | null
          created_at?: string
          flight_id: string
          gate?: string | null
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone?: string | null
          seat_number: string
          status?: string
          total_price: number
          tracking_code: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          boarding_time?: string | null
          created_at?: string
          flight_id?: string
          gate?: string | null
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string | null
          seat_number?: string
          status?: string
          total_price?: number
          tracking_code?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_updates: {
        Row: {
          created_at: string
          flight_id: string
          id: string
          message: string
          new_value: string | null
          old_value: string | null
          update_type: string
        }
        Insert: {
          created_at?: string
          flight_id: string
          id?: string
          message: string
          new_value?: string | null
          old_value?: string | null
          update_type: string
        }
        Update: {
          created_at?: string
          flight_id?: string
          id?: string
          message?: string
          new_value?: string | null
          old_value?: string | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_updates_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft_type: string
          airline: string
          arrival_time: string
          available_seats: number
          created_at: string
          delay_minutes: number | null
          departure_time: string
          destination: string
          destination_code: string
          flight_number: string
          gate: string | null
          id: string
          origin: string
          origin_code: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          aircraft_type?: string
          airline: string
          arrival_time: string
          available_seats?: number
          created_at?: string
          delay_minutes?: number | null
          departure_time: string
          destination: string
          destination_code: string
          flight_number: string
          gate?: string | null
          id?: string
          origin: string
          origin_code: string
          price: number
          status?: string
          updated_at?: string
        }
        Update: {
          aircraft_type?: string
          airline?: string
          arrival_time?: string
          available_seats?: number
          created_at?: string
          delay_minutes?: number | null
          departure_time?: string
          destination?: string
          destination_code?: string
          flight_number?: string
          gate?: string | null
          id?: string
          origin?: string
          origin_code?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          booking_id: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_map: {
        Row: {
          created_at: string
          flight_id: string
          id: string
          is_aisle: boolean
          is_available: boolean
          is_exit_row: boolean
          is_window: boolean
          price_modifier: number
          seat_class: string
          seat_number: string
        }
        Insert: {
          created_at?: string
          flight_id: string
          id?: string
          is_aisle?: boolean
          is_available?: boolean
          is_exit_row?: boolean
          is_window?: boolean
          price_modifier?: number
          seat_class?: string
          seat_number: string
        }
        Update: {
          created_at?: string
          flight_id?: string
          id?: string
          is_aisle?: boolean
          is_available?: boolean
          is_exit_row?: boolean
          is_window?: boolean
          price_modifier?: number
          seat_class?: string
          seat_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_map_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
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
    Enums: {},
  },
} as const
