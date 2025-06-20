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
      mastra_evals: {
        Row: {
          agent_name: string
          created_at: string
          createdAt: string | null
          global_run_id: string
          input: string
          instructions: string
          metric_name: string
          output: string
          result: Json
          run_id: string
          test_info: Json | null
        }
        Insert: {
          agent_name: string
          created_at: string
          createdAt?: string | null
          global_run_id: string
          input: string
          instructions: string
          metric_name: string
          output: string
          result: Json
          run_id: string
          test_info?: Json | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          createdAt?: string | null
          global_run_id?: string
          input?: string
          instructions?: string
          metric_name?: string
          output?: string
          result?: Json
          run_id?: string
          test_info?: Json | null
        }
        Relationships: []
      }
      mastra_messages: {
        Row: {
          content: string
          createdAt: string
          id: string
          resourceId: string | null
          role: string
          thread_id: string
          type: string
        }
        Insert: {
          content: string
          createdAt: string
          id: string
          resourceId?: string | null
          role: string
          thread_id: string
          type: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          resourceId?: string | null
          role?: string
          thread_id?: string
          type?: string
        }
        Relationships: []
      }
      mastra_threads: {
        Row: {
          createdAt: string
          id: string
          metadata: string | null
          resourceId: string
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          id: string
          metadata?: string | null
          resourceId: string
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          metadata?: string | null
          resourceId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      mastra_traces: {
        Row: {
          attributes: Json | null
          createdAt: string
          endTime: number
          events: Json | null
          id: string
          kind: number
          links: Json | null
          name: string
          other: string | null
          parentSpanId: string | null
          scope: string
          startTime: number
          status: Json | null
          traceId: string
        }
        Insert: {
          attributes?: Json | null
          createdAt: string
          endTime: number
          events?: Json | null
          id: string
          kind: number
          links?: Json | null
          name: string
          other?: string | null
          parentSpanId?: string | null
          scope: string
          startTime: number
          status?: Json | null
          traceId: string
        }
        Update: {
          attributes?: Json | null
          createdAt?: string
          endTime?: number
          events?: Json | null
          id?: string
          kind?: number
          links?: Json | null
          name?: string
          other?: string | null
          parentSpanId?: string | null
          scope?: string
          startTime?: number
          status?: Json | null
          traceId?: string
        }
        Relationships: []
      }
      mastra_workflow_snapshot: {
        Row: {
          createdAt: string
          resourceId: string | null
          run_id: string
          snapshot: string
          updatedAt: string
          workflow_name: string
        }
        Insert: {
          createdAt: string
          resourceId?: string | null
          run_id: string
          snapshot: string
          updatedAt: string
          workflow_name: string
        }
        Update: {
          createdAt?: string
          resourceId?: string | null
          run_id?: string
          snapshot?: string
          updatedAt?: string
          workflow_name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
