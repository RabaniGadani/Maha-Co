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
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'researcher' | 'reviewer' | 'finance'
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'researcher' | 'reviewer' | 'finance'
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'researcher' | 'reviewer' | 'finance'
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_assigned_by_fkey'
            columns: ['assigned_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      role_permissions: {
        Row: {
          id: string
          role: 'admin' | 'researcher' | 'reviewer' | 'finance'
          permission: string
          created_at: string
        }
        Insert: {
          id?: string
          role: 'admin' | 'researcher' | 'reviewer' | 'finance'
          permission: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'researcher' | 'reviewer' | 'finance'
          permission?: string
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      sources: {
        Row: {
          id: string
          user_id: string
          title: string
          authors: string[]
          year: number
          source_type: 'journal' | 'book' | 'conference' | 'website' | 'other'
          journal_name: string | null
          volume: string | null
          issue: string | null
          pages: string | null
          doi: string | null
          url: string | null
          publisher: string | null
          is_peer_reviewed: boolean
          apa_citation: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          authors: string[]
          year: number
          source_type: 'journal' | 'book' | 'conference' | 'website' | 'other'
          journal_name?: string | null
          volume?: string | null
          issue?: string | null
          pages?: string | null
          doi?: string | null
          url?: string | null
          publisher?: string | null
          is_peer_reviewed?: boolean
          apa_citation: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          authors?: string[]
          year?: number
          source_type?: 'journal' | 'book' | 'conference' | 'website' | 'other'
          journal_name?: string | null
          volume?: string | null
          issue?: string | null
          pages?: string | null
          doi?: string | null
          url?: string | null
          publisher?: string | null
          is_peer_reviewed?: boolean
          apa_citation?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sources_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      research_papers: {
        Row: {
          id: string
          user_id: string
          title: string
          abstract: string | null
          status: 'draft' | 'in_review' | 'revision' | 'approved' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          abstract?: string | null
          status?: 'draft' | 'in_review' | 'revision' | 'approved' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          abstract?: string | null
          status?: 'draft' | 'in_review' | 'revision' | 'approved' | 'published'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'research_papers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      sections: {
        Row: {
          id: string
          paper_id: string
          title: string
          content: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paper_id: string
          title: string
          content?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paper_id?: string
          title?: string
          content?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sections_paper_id_fkey'
            columns: ['paper_id']
            isOneToOne: false
            referencedRelation: 'research_papers'
            referencedColumns: ['id']
          }
        ]
      }
      claims: {
        Row: {
          id: string
          section_id: string
          claim_text: string
          verification_status: 'unverified' | 'verified' | 'disputed'
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          claim_text: string
          verification_status?: 'unverified' | 'verified' | 'disputed'
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          claim_text?: string
          verification_status?: 'unverified' | 'verified' | 'disputed'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'claims_section_id_fkey'
            columns: ['section_id']
            isOneToOne: false
            referencedRelation: 'sections'
            referencedColumns: ['id']
          }
        ]
      }
      claim_sources: {
        Row: {
          id: string
          claim_id: string
          source_id: string
          page_reference: string | null
          quote: string | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          source_id: string
          page_reference?: string | null
          quote?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          source_id?: string
          page_reference?: string | null
          quote?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'claim_sources_claim_id_fkey'
            columns: ['claim_id']
            isOneToOne: false
            referencedRelation: 'claims'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'claim_sources_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'sources'
            referencedColumns: ['id']
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          client_name: string
          client_email: string | null
          status: 'draft' | 'issued' | 'paid' | 'cancelled'
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          issued_at: string | null
          due_date: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          client_name: string
          client_email?: string | null
          status?: 'draft' | 'issued' | 'paid' | 'cancelled'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          issued_at?: string | null
          due_date?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_number?: string
          client_name?: string
          client_email?: string | null
          status?: 'draft' | 'issued' | 'paid' | 'cancelled'
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          issued_at?: string | null
          due_date?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invoices_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          line_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey'
            columns: ['invoice_id']
            isOneToOne: false
            referencedRelation: 'invoices'
            referencedColumns: ['id']
          }
        ]
      }
      lpg_items: {
        Row: {
          id: number
          name: string
          weight_kg: number
          buy_price: number
          sell_price: number
          created_at: string
          user_id: string
          stock: number
        }
        Insert: {
          id?: number
          name: string
          weight_kg: number
          buy_price: number
          sell_price: number
          created_at?: string
          user_id: string
          stock?: number
        }
        Update: {
          id?: number
          name?: string
          weight_kg?: number
          buy_price?: number
          sell_price?: number
          created_at?: string
          user_id?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "lpg_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          address: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lpg_sales: {
        Row: {
          id: number
          sale_date: string
          customer_id: string | null
          total_amount: number
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: number
          sale_date?: string
          customer_id?: string | null
          total_amount: number
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: number
          sale_date?: string
          customer_id?: string | null
          total_amount?: number
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lpg_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lpg_sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lpg_sale_items: {
        Row: {
          id: number
          sale_id: number
          item_id: number
          quantity: number
          price_at_sale: number
        }
        Insert: {
          id?: number
          sale_id: number
          item_id: number
          quantity: number
          price_at_sale: number
        }
        Update: {
          id?: number
          sale_id?: number
          item_id?: number
          quantity?: number
          price_at_sale?: number
        }
        Relationships: [
          {
            foreignKeyName: "lpg_sale_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "lpg_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lpg_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "lpg_sales"
            referencedColumns: ["id"]
          }
        ]
      }
      lpg_transactions: {
        Row: {
          id: number
          date: string
          product_name: string
          weight_kg: number
          buy_price_per_kg: number
          sell_price_per_kg: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date?: string
          product_name: string
          weight_kg: number
          buy_price_per_kg: number
          sell_price_per_kg: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: string
          product_name?: string
          weight_kg?: number
          buy_price_per_kg?: number
          sell_price_per_kg?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lpg_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_permission: {
        Args: { user_uuid: string; required_permission: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'admin' | 'researcher' | 'reviewer' | 'finance'
      paper_status: 'draft' | 'in_review' | 'revision' | 'approved' | 'published'
      invoice_status: 'draft' | 'issued' | 'paid' | 'cancelled'
      verification_status: 'unverified' | 'verified' | 'disputed'
      source_type: 'journal' | 'book' | 'conference' | 'website' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type UserRole = Tables<'user_roles'>
export type RolePermission = Tables<'role_permissions'>
export type AuditLog = Tables<'audit_logs'>
export type Source = Tables<'sources'>
export type ResearchPaper = Tables<'research_papers'>
export type Section = Tables<'sections'>
export type Claim = Tables<'claims'>
export type ClaimSource = Tables<'claim_sources'>
export type Invoice = Tables<'invoices'>
export type InvoiceItem = Tables<'invoice_items'>
export type LpgItem = Tables<'lpg_items'>
export type Customer = Tables<'customers'>
export type LpgSale = Tables<'lpg_sales'>
export type LpgSaleItem = Tables<'lpg_sale_items'>
export type LpgTransaction = Tables<'lpg_transactions'>

// Enum types
export type Role = Database['public']['Enums']['user_role']
export type PaperStatus = Database['public']['Enums']['paper_status']
export type InvoiceStatus = Database['public']['Enums']['invoice_status']
export type VerificationStatus = Database['public']['Enums']['verification_status']
export type SourceType = Database['public']['Enums']['source_type']

