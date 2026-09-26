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
      attendances: {
        Row: {
          id: string
          lesson_id: string
          marked_at: string | null
          marked_by: string | null
          note: string | null
          present: boolean
          registration_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
          marked_at?: string | null
          marked_by?: string | null
          note?: string | null
          present?: boolean
          registration_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
          marked_at?: string | null
          marked_by?: string | null
          note?: string | null
          present?: boolean
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "attendances_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_absence_count"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "attendances_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_attendance_summary"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "attendances_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_payment_status"
            referencedColumns: ["registration_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_at: string | null
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      cash_categories: {
        Row: {
          id: string
          name: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      cell_leaders: {
        Row: {
          active: boolean
          created_at: string | null
          g12_id: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          g12_id: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          g12_id?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cell_leaders_g12_id_fkey"
            columns: ["g12_id"]
            isOneToOne: false
            referencedRelation: "g12_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      edition_leaders: {
        Row: {
          cell_leader_id: string
          created_at: string | null
          edition_id: string
          id: string
        }
        Insert: {
          cell_leader_id: string
          created_at?: string | null
          edition_id: string
          id?: string
        }
        Update: {
          cell_leader_id?: string
          created_at?: string | null
          edition_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_leaders_cell_leader_id_fkey"
            columns: ["cell_leader_id"]
            isOneToOne: false
            referencedRelation: "cell_leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edition_leaders_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edition_leaders_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "edition_leaders_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      editions: {
        Row: {
          code: string | null
          created_at: string | null
          encounter_date: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          registration_fee_cents: number
          start_date: string
          status: string
          target_students: number | null
          total_lessons: number
          year: number
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          encounter_date?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          registration_fee_cents: number
          start_date: string
          status?: string
          target_students?: number | null
          total_lessons?: number
          year: number
        }
        Update: {
          code?: string | null
          created_at?: string | null
          encounter_date?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          registration_fee_cents?: number
          start_date?: string
          status?: string
          target_students?: number | null
          total_lessons?: number
          year?: number
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount_cents: number
          category: string
          created_at: string | null
          description: string
          edition_id: string
          id: string
          payment_method: string
          receipt_url: string | null
          recorded_by: string | null
          registration_id: string | null
          transaction_date: string
          type: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string | null
          description: string
          edition_id: string
          id?: string
          payment_method: string
          receipt_url?: string | null
          recorded_by?: string | null
          registration_id?: string | null
          transaction_date?: string
          type: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string | null
          description?: string
          edition_id?: string
          id?: string
          payment_method?: string
          receipt_url?: string | null
          recorded_by?: string | null
          registration_id?: string | null
          transaction_date?: string
          type?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "financial_transactions_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "financial_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "financial_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_absence_count"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "financial_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_attendance_summary"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "financial_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_payment_status"
            referencedColumns: ["registration_id"]
          },
        ]
      }
      g12_leaders: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          name: string
          pastor_id: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          name: string
          pastor_id: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          name?: string
          pastor_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "g12_leaders_pastor_id_fkey"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "pastors"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          condition_description: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          has_condition: boolean
          id: string
          medication_schedule: string | null
          notes: string | null
          person_id: string
          updated_at: string | null
        }
        Insert: {
          condition_description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          has_condition?: boolean
          id?: string
          medication_schedule?: string | null
          notes?: string | null
          person_id: string
          updated_at?: string | null
        }
        Update: {
          condition_description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          has_condition?: boolean
          id?: string
          medication_schedule?: string | null
          notes?: string | null
          person_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          edition_id: string
          id: string
          session_date: string | null
          session_date_label: string | null
          session_number: number
          theme: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          edition_id: string
          id?: string
          session_date?: string | null
          session_date_label?: string | null
          session_number: number
          theme?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          edition_id?: string
          id?: string
          session_date?: string | null
          session_date_label?: string | null
          session_number?: number
          theme?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "lessons_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      networks: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          pastor_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          pastor_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pastor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_networks_pastor"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pastors: {
        Row: {
          active: boolean
          category: string
          created_at: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_url: string | null
          recorded_by: string | null
          registration_id: string
          source: string | null
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          receipt_url?: string | null
          recorded_by?: string | null
          registration_id: string
          source?: string | null
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_url?: string | null
          recorded_by?: string | null
          registration_id?: string
          source?: string | null
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_absence_count"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_attendance_summary"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_registration_payment_status"
            referencedColumns: ["registration_id"]
          },
        ]
      }
      people: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          full_name: string
          gender: string | null
          id: string
          marital_status: string | null
          phone: string
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name: string
          gender?: string | null
          id?: string
          marital_status?: string | null
          phone: string
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          marital_status?: string | null
          phone?: string
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          network_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          network_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          network_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "networks"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          cell_leader: string | null
          cell_leader_id: string | null
          created_at: string | null
          edition_id: string
          g12_leader: string | null
          id: string
          leader_id: string | null
          network_id: string | null
          pastor_name: string | null
          person_id: string
          shirt_size: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          cell_leader?: string | null
          cell_leader_id?: string | null
          created_at?: string | null
          edition_id: string
          g12_leader?: string | null
          id?: string
          leader_id?: string | null
          network_id?: string | null
          pastor_name?: string | null
          person_id: string
          shirt_size?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          cell_leader?: string | null
          cell_leader_id?: string | null
          created_at?: string | null
          edition_id?: string
          g12_leader?: string | null
          id?: string
          leader_id?: string | null
          network_id?: string | null
          pastor_name?: string | null
          person_id?: string
          shirt_size?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_cell_leader_id_fkey"
            columns: ["cell_leader_id"]
            isOneToOne: false
            referencedRelation: "cell_leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
        ]
      }
      team_meeting_attendances: {
        Row: {
          id: string
          marked_at: string | null
          marked_by: string | null
          meeting_id: string
          present: boolean
          team_member_id: string
        }
        Insert: {
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          meeting_id: string
          present?: boolean
          team_member_id: string
        }
        Update: {
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          meeting_id?: string
          present?: boolean
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_meeting_attendances_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "team_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_meeting_attendances_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_meeting_attendances_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "v_team_member_attendance"
            referencedColumns: ["team_member_id"]
          },
          {
            foreignKeyName: "team_meeting_attendances_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "v_team_member_payment_status"
            referencedColumns: ["team_member_id"]
          },
        ]
      }
      team_meeting_roles: {
        Row: {
          meeting_id: string
          team_role_id: string
        }
        Insert: {
          meeting_id: string
          team_role_id: string
        }
        Update: {
          meeting_id?: string
          team_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_meeting_roles_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "team_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_meeting_roles_team_role_id_fkey"
            columns: ["team_role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_meetings: {
        Row: {
          created_at: string
          created_by: string | null
          edition_id: string
          id: string
          meeting_date: string
          notes: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          edition_id: string
          id?: string
          meeting_date: string
          notes?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          edition_id?: string
          id?: string
          meeting_date?: string
          notes?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_meetings_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_meetings_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_meetings_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      team_member_payments: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          edition_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          team_member_id: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          edition_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          team_member_id: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          edition_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          team_member_id?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_payments_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_payments_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_member_payments_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_member_payments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_payments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "v_team_member_attendance"
            referencedColumns: ["team_member_id"]
          },
          {
            foreignKeyName: "team_member_payments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "v_team_member_payment_status"
            referencedColumns: ["team_member_id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean
          created_at: string
          edition_id: string
          id: string
          notes: string | null
          person_id: string
          team_role_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          edition_id: string
          id?: string
          notes?: string | null
          person_id: string
          team_role_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          edition_id?: string
          id?: string
          notes?: string | null
          person_id?: string
          team_role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "team_members_team_role_id_fkey"
            columns: ["team_role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_roles: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          name: string
          sort_order: number
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      v_cash_flow: {
        Row: {
          amount_cents: number | null
          category: string | null
          date: string | null
          edition_id: string | null
          flow_type: string | null
          payment_method: string | null
          person_name: string | null
          registration_id: string | null
          source: string | null
          transaction_id: string | null
        }
        Relationships: []
      }
      v_cash_summary: {
        Row: {
          edition_id: string | null
          net_balance_cents: number | null
          paid_count: number | null
          partial_count: number | null
          pending_count: number | null
          team_paid_count: number | null
          team_partial_count: number | null
          team_pending_count: number | null
          total_in_cents: number | null
          total_manual_in_cents: number | null
          total_manual_out_cents: number | null
          total_out_cents: number | null
          total_payment_in_cents: number | null
          total_receivable_cents: number | null
          total_registration_goal_cents: number | null
          total_registration_paid_cents: number | null
          total_registrations: number | null
          total_team_goal_cents: number | null
          total_team_members: number | null
          total_team_paid_cents: number | null
          total_team_receivable_cents: number | null
        }
        Relationships: []
      }
      v_edition_attendance_matrix: {
        Row: {
          birth_date: string | null
          edition_id: string | null
          full_name: string | null
          person_id: string | null
          registration_id: string | null
          s1: boolean | null
          s2: boolean | null
          s3: boolean | null
          s4: boolean | null
          s5: boolean | null
          s6: boolean | null
          s7: boolean | null
          s8: boolean | null
          s9: boolean | null
          total_present: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      v_edition_financial_summary: {
        Row: {
          confirmed_registrations_count: number | null
          edition_id: string | null
          net_balance_cents: number | null
          total_expense_cents: number | null
          total_revenue_cents: number | null
        }
        Relationships: []
      }
      v_leadership_hierarchy: {
        Row: {
          active: boolean | null
          created_at: string | null
          g12_id: string | null
          g12_name: string | null
          id: string | null
          name: string | null
          pastor_category: string | null
          pastor_id: string | null
          pastor_name: string | null
          phone: string | null
          role: string | null
          role_label: string | null
        }
        Relationships: []
      }
      v_registration_absence_count: {
        Row: {
          absence_count: number | null
          edition_id: string | null
          registration_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
        ]
      }
      v_registration_attendance_summary: {
        Row: {
          attendance_percentage: number | null
          attended_lessons: number | null
          edition_id: string | null
          person_id: string | null
          registration_id: string | null
          total_lessons: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
        ]
      }
      v_registration_payment_status: {
        Row: {
          edition_id: string | null
          last_payment_at: string | null
          outstanding_cents: number | null
          payment_count: number | null
          person_id: string | null
          registration_fee_cents: number | null
          registration_id: string | null
          status: string | null
          total_paid_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
        ]
      }
      v_team_member_attendance: {
        Row: {
          active: boolean | null
          attendance_fraction: string | null
          attendance_percentage: number | null
          attended_meetings: number | null
          edition_id: string | null
          person_id: string | null
          team_member_id: string | null
          team_role_id: string | null
          total_called_meetings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "team_members_team_role_id_fkey"
            columns: ["team_role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_team_member_payment_status: {
        Row: {
          active: boolean | null
          edition_id: string | null
          last_payment_at: string | null
          outstanding_cents: number | null
          payment_count: number | null
          person_id: string | null
          registration_fee_cents: number | null
          status: string | null
          team_member_id: string | null
          team_role_id: string | null
          total_paid_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_cash_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "v_edition_financial_summary"
            referencedColumns: ["edition_id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_edition_attendance_matrix"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "team_members_team_role_id_fkey"
            columns: ["team_role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_user_network_id: { Args: never; Returns: string }
      auth_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      delete_registration: {
        Args: { p_registration_id: string }
        Returns: Json
      }
      import_legacy_payments: { Args: { p_data: Json }; Returns: Json }
      import_local_data: { Args: { p_snapshot: Json }; Returns: Json }
      is_coord_or_sec: { Args: never; Returns: boolean }
      mark_attendance_batch: { Args: { p_records: Json }; Returns: undefined }
      mark_team_attendance_batch: {
        Args: { p_meeting_id: string; p_records: Json }
        Returns: undefined
      }
      normalize_payment_method: { Args: { raw: string }; Returns: string }
      record_attendance_rpc: {
        Args: {
          p_birth_date: string
          p_edition_id: string
          p_full_name: string
          p_note?: string
          p_present: boolean
          p_session_number: number
        }
        Returns: Json
      }
      register_payment: {
        Args: {
          amt: number
          meth: string
          pay_date: string
          pay_notes?: string
          reg_id: string
        }
        Returns: string
      }
      register_team_member_payment: {
        Args: {
          p_amount_cents: number
          p_date: string
          p_edition_id: string
          p_method: string
          p_notes?: string
          p_team_member_id: string
        }
        Returns: string
      }
      sync_attendances_rpc: {
        Args: { p_edition_id: string; p_items: Json }
        Returns: Json
      }
      sync_students_from_local: {
        Args: { p_data: Json; p_edition_id: string }
        Returns: Json
      }
      upsert_registration: { Args: { p_data: Json }; Returns: string }
      upsert_student_registration: {
        Args: {
          p_address?: string
          p_birth_date: string
          p_cell_leader?: string
          p_condition_description?: string
          p_edition_id: string
          p_full_name: string
          p_g12_leader?: string
          p_gender: string
          p_has_condition?: boolean
          p_marital_status: string
          p_medication_schedule?: string
          p_pastor_name?: string
          p_person_id?: string
          p_phone: string
          p_photo_url?: string
          p_registration_id?: string
          p_shirt_size?: string
          p_status?: string
        }
        Returns: Json
      }
      void_financial_transaction: {
        Args: { reason?: string; tx_id: string }
        Returns: undefined
      }
      void_payment: {
        Args: { payment_id: string; reason?: string }
        Returns: undefined
      }
      void_team_member_payment: {
        Args: { p_payment_id: string; p_reason?: string }
        Returns: undefined
      }
    }
    Enums: {
      payment_method: "pix" | "debit" | "credit" | "cash"
      user_role: "coordinator" | "secretary" | "network_leader" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          lifecycle_configuration: Json | null
          lifecycle_configuration_generation: string | null
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
          versioning_status: string
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          lifecycle_configuration?: Json | null
          lifecycle_configuration_generation?: string | null
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          lifecycle_configuration?: Json | null
          lifecycle_configuration_generation?: string | null
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          archived_at: string | null
          bucket_id: string | null
          created_at: string | null
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: { delete_markers?: string; noncurrent_versions?: string }
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
          raw_prefix_param?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delete_markers?: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          next_token_archived_at?: string
          next_token_version?: string
          noncurrent_versions?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          archived_at: string
          created_at: string
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
          version: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          delete_markers?: string
          levels?: number
          limits?: number
          noncurrent_versions?: string
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          archived_at: string
          created_at: string
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
          version: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          delete_markers?: string
          noncurrent_versions?: string
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
          p_start_after_version?: string
        }
        Returns: {
          archived_at: string
          created_at: string
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
          version: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          delete_markers?: string
          levels?: number
          limits?: number
          noncurrent_versions?: string
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
          start_after_archived_at?: string
          start_after_is_continuation?: boolean
          start_after_version?: string
        }
        Returns: {
          archived_at: string
          created_at: string
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
          version: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      payment_method: ["pix", "debit", "credit", "cash"],
      user_role: ["coordinator", "secretary", "network_leader", "viewer"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
