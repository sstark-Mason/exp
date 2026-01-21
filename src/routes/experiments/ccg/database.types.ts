export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      game_rounds: {
        Row: {
          choice_option_1: string
          choice_option_2: string
          choice_payoff_1: number
          choice_payoff_2: number
          completed_at_time: string | null
          created_at_time: string
          matched_rid: number | null
          player_1_avatar: string
          player_1_chose: string
          player_1_payoff: number | null
          player_1_uid: string
          player_2_avatar: string
          player_2_chose: string | null
          rid: number
        }
        Insert: {
          choice_option_1: string
          choice_option_2: string
          choice_payoff_1: number
          choice_payoff_2: number
          completed_at_time?: string | null
          created_at_time?: string
          matched_rid?: number | null
          player_1_avatar: string
          player_1_chose: string
          player_1_payoff?: number | null
          player_1_uid: string
          player_2_avatar: string
          player_2_chose?: string | null
          rid?: never
        }
        Update: {
          choice_option_1?: string
          choice_option_2?: string
          choice_payoff_1?: number
          choice_payoff_2?: number
          completed_at_time?: string | null
          created_at_time?: string
          matched_rid?: number | null
          player_1_avatar?: string
          player_1_chose?: string
          player_1_payoff?: number | null
          player_1_uid?: string
          player_2_avatar?: string
          player_2_chose?: string | null
          rid?: never
        }
        Relationships: [
          {
            foreignKeyName: "game_rounds_player_1_uid_fkey"
            columns: ["player_1_uid"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["uid"]
          },
        ]
      }
      payoffs: {
        Row: {
          bonus_payoff: number | null
          cq_payoff: number | null
          game_payoff: number | null
          id: number
          participation_payoff: number | null
          total_payoff: number | null
          uid: string
        }
        Insert: {
          bonus_payoff?: number | null
          cq_payoff?: number | null
          game_payoff?: number | null
          id?: never
          participation_payoff?: number | null
          total_payoff?: number | null
          uid: string
        }
        Update: {
          bonus_payoff?: number | null
          cq_payoff?: number | null
          game_payoff?: number | null
          id?: never
          participation_payoff?: number | null
          total_payoff?: number | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "payoffs_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["uid"]
          },
        ]
      }
      subjects: {
        Row: {
          cq_game_1: number[] | null
          cq_game_2: number[] | null
          end_time: string | null
          id: number
          pid: string | null
          screening_passed: boolean | null
          start_time: string
          uid: string
        }
        Insert: {
          cq_game_1?: number[] | null
          cq_game_2?: number[] | null
          end_time?: string | null
          id?: never
          pid?: string | null
          screening_passed?: boolean | null
          start_time?: string
          uid?: string
        }
        Update: {
          cq_game_1?: number[] | null
          cq_game_2?: number[] | null
          end_time?: string | null
          id?: never
          pid?: string | null
          screening_passed?: boolean | null
          start_time?: string
          uid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_bonus_payoffs: { Args: { uid: string }; Returns: number }
      calculate_cq_payoffs: { Args: { uid: string }; Returns: number }
      calculate_cq_score: { Args: { cq_selections: number[] }; Returns: number }
      calculate_game_payoffs: { Args: { uid: string }; Returns: number }
      calculate_payoffs: { Args: { uid: string }; Returns: undefined }
      complete_game_round: {
        Args: { this: Database["public"]["Tables"]["game_rounds"]["Row"] }
        Returns: {
          choice_option_1: string
          choice_option_2: string
          choice_payoff_1: number
          choice_payoff_2: number
          completed_at_time: string | null
          created_at_time: string
          matched_rid: number | null
          player_1_avatar: string
          player_1_chose: string
          player_1_payoff: number | null
          player_1_uid: string
          player_2_avatar: string
          player_2_chose: string | null
          rid: number
        }
        SetofOptions: {
          from: "game_rounds"
          to: "game_rounds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      find_matching_round: {
        Args: { unmatched: Database["public"]["Tables"]["game_rounds"]["Row"] }
        Returns: {
          player_1_chose: string
          player_1_uid: string
          rid: number
        }[]
      }
      retry_unmatched_rounds: { Args: never; Returns: undefined }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

