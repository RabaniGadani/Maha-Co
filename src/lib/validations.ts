import { z } from 'zod';
import { MIN_SOURCE_YEAR, CURRENT_YEAR } from './constants';

// Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupInput = z.infer<typeof signupSchema>;

// Source Schemas (APA Format)
export const sourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.array(z.string().min(1)).min(1, 'At least one author is required'),
  year: z
    .number()
    .int()
    .min(MIN_SOURCE_YEAR, `Sources must be from ${MIN_SOURCE_YEAR} or later`)
    .max(CURRENT_YEAR, 'Year cannot be in the future'),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  is_peer_reviewed: z.boolean().default(true),
  recency_override_reason: z.string().optional(),
});

export type SourceInput = z.infer<typeof sourceSchema>;

// Source with recency override validation
export const sourceWithOverrideSchema = sourceSchema.refine(
  (data) => {
    // If year is older than allowed, require override reason
    if (data.year < MIN_SOURCE_YEAR && !data.recency_override_reason) {
      return false;
    }
    return true;
  },
  {
    message: `Sources older than ${MIN_SOURCE_YEAR} require a justification`,
    path: ['recency_override_reason'],
  }
);

// Research Paper Schemas
export const paperSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
});

export type PaperInput = z.infer<typeof paperSchema>;

// Section Schemas
export const sectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  content: z.string().min(1, 'Content is required'),
  order_index: z.number().int().min(0).default(0),
});

export type SectionInput = z.infer<typeof sectionSchema>;

// Claim Schemas
export const claimSchema = z.object({
  text: z.string().min(1, 'Claim text is required'),
  source_ids: z.array(z.string().uuid()).min(1, 'At least one source is required'),
});

export type ClaimInput = z.infer<typeof claimSchema>;

// Invoice Schemas
export const invoiceSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_address: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  tax_rate: z.number().min(0).max(100).default(0),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// Invoice Item Schemas
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().positive('Unit price must be positive'),
  order_index: z.number().int().min(0).default(0),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
