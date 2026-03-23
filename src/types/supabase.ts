export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      TeamChatMessage: {
        Row: {
          id: string
          workspace_id: string | null
          project_id: string | null
          user_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id?: string | null
          project_id?: string | null
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string | null
          project_id?: string | null
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "TeamChatMessage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TeamChatMessage_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TeamChatMessage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TeamChatMessage_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "TeamChatMessage"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          dismissed: boolean
          snoozed_until: string | null
          data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          dismissed?: boolean
          snoozed_until?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          dismissed?: boolean
          snoozed_until?: string | null
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          project_activity_enabled: boolean
          project_activity_comments: boolean
          project_activity_mentions: boolean
          project_activity_changes: boolean
          project_activity_shared: boolean
          collaboration_enabled: boolean
          collaboration_new_collaborator: boolean
          collaboration_permission_changes: boolean
          collaboration_comments_resolved: boolean
          collaboration_real_time: boolean
          collaboration_request_enabled: boolean
          collaboration_request_collaborator_request: boolean
          ai_features_enabled: boolean
          ai_features_plagiarism_complete: boolean
          ai_features_ai_limit: boolean
          ai_features_new_features: boolean
          ai_features_weekly_summary: boolean
          account_billing_enabled: boolean
          account_billing_payment_success: boolean
          account_billing_payment_failed: boolean
          account_billing_subscription_renewed: boolean
          account_billing_subscription_expiring: boolean
          account_billing_security_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_activity_enabled?: boolean
          project_activity_comments?: boolean
          project_activity_mentions?: boolean
          project_activity_changes?: boolean
          project_activity_shared?: boolean
          collaboration_enabled?: boolean
          collaboration_new_collaborator?: boolean
          collaboration_permission_changes?: boolean
          collaboration_comments_resolved?: boolean
          collaboration_real_time?: boolean
          collaboration_request_enabled?: boolean
          collaboration_request_collaborator_request?: boolean
          ai_features_enabled?: boolean
          ai_features_plagiarism_complete?: boolean
          ai_features_ai_limit?: boolean
          ai_features_new_features?: boolean
          ai_features_weekly_summary?: boolean
          account_billing_enabled?: boolean
          account_billing_payment_success?: boolean
          account_billing_payment_failed?: boolean
          account_billing_subscription_renewed?: boolean
          account_billing_subscription_expiring?: boolean
          account_billing_security_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_activity_enabled?: boolean
          project_activity_comments?: boolean
          project_activity_mentions?: boolean
          project_activity_changes?: boolean
          project_activity_shared?: boolean
          collaboration_enabled?: boolean
          collaboration_new_collaborator?: boolean
          collaboration_permission_changes?: boolean
          collaboration_comments_resolved?: boolean
          collaboration_real_time?: boolean
          collaboration_request_enabled?: boolean
          collaboration_request_collaborator_request?: boolean
          ai_features_enabled?: boolean
          ai_features_plagiarism_complete?: boolean
          ai_features_ai_limit?: boolean
          ai_features_new_features?: boolean
          ai_features_weekly_summary?: boolean
          account_billing_enabled?: boolean
          account_billing_payment_success?: boolean
          account_billing_payment_failed?: boolean
          account_billing_subscription_renewed?: boolean
          account_billing_subscription_expiring?: boolean
          account_billing_security_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
