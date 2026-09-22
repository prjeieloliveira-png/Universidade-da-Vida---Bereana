export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'coordinator' | 'secretary' | 'network_leader' | 'viewer';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          network_id: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          network_id?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          network_id?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
      networks: {
        Row: {
          id: string;
          name: string;
          pastor_id: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          pastor_id?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pastor_id?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          gender: string;
          marital_status: string;
          phone: string;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date: string;
          gender: string;
          marital_status: string;
          phone: string;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string;
          gender?: string;
          marital_status?: string;
          phone?: string;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_records: {
        Row: {
          id: string;
          person_id: string;
          has_condition: boolean;
          condition_description: string | null;
          medication_schedule: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          has_condition?: boolean;
          condition_description?: string | null;
          medication_schedule?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          has_condition?: boolean;
          condition_description?: string | null;
          medication_schedule?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      editions: {
        Row: {
          id: string;
          name: string;
          year: number;
          start_date: string;
          end_date: string;
          registration_fee_cents: number;
          total_lessons: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          start_date: string;
          end_date: string;
          registration_fee_cents: number;
          total_lessons?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          start_date?: string;
          end_date?: string;
          registration_fee_cents?: number;
          total_lessons?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          edition_id: string;
          session_number: number;
          title: string;
          session_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          session_number: number;
          title: string;
          session_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          session_number?: number;
          title?: string;
          session_date?: string | null;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          person_id: string;
          edition_id: string;
          network_id: string | null;
          leader_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          edition_id: string;
          network_id?: string | null;
          leader_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          edition_id?: string;
          network_id?: string | null;
          leader_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendances: {
        Row: {
          id: string;
          registration_id: string;
          lesson_id: string;
          present: boolean;
          marked_at: string;
          marked_by: string | null;
        };
        Insert: {
          id?: string;
          registration_id: string;
          lesson_id: string;
          present?: boolean;
          marked_at?: string;
          marked_by?: string | null;
        };
        Update: {
          id?: string;
          registration_id?: string;
          lesson_id?: string;
          present?: boolean;
          marked_at?: string;
          marked_by?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          registration_id: string;
          amount_cents: number;
          payment_method: string;
          payment_date: string;
          receipt_url: string | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          amount_cents: number;
          payment_method: string;
          payment_date?: string;
          receipt_url?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          registration_id?: string;
          amount_cents?: number;
          payment_method?: string;
          payment_date?: string;
          receipt_url?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          edition_id: string;
          type: string;
          category: string;
          amount_cents: number;
          payment_method: string;
          description: string;
          transaction_date: string;
          receipt_url: string | null;
          registration_id: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          type: string;
          category: string;
          amount_cents: number;
          payment_method: string;
          description: string;
          transaction_date?: string;
          receipt_url?: string | null;
          registration_id?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          edition_id?: string;
          type?: string;
          category?: string;
          amount_cents?: number;
          payment_method?: string;
          description?: string;
          transaction_date?: string;
          receipt_url?: string | null;
          registration_id?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          performed_by: string | null;
          performed_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          performed_by?: string | null;
          performed_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          performed_by?: string | null;
          performed_at?: string;
        };
      };
    };
    Views: {
      v_registration_payment_status: {
        Row: {
          registration_id: string;
          edition_id: string;
          person_id: string;
          total_paid_cents: number;
          registration_fee_cents: number;
          balance_due_cents: number;
          payment_status: 'pending' | 'partially_paid' | 'paid';
        };
      };
      v_registration_attendance_summary: {
        Row: {
          registration_id: string;
          edition_id: string;
          person_id: string;
          attended_lessons: number;
          total_lessons: number;
          attendance_percentage: number;
        };
      };
      v_edition_financial_summary: {
        Row: {
          edition_id: string;
          total_revenue_cents: number;
          total_expense_cents: number;
          net_balance_cents: number;
          confirmed_registrations_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
}
