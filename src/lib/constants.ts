// Application Constants

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  RESEARCHER: 'researcher',
  REVIEWER: 'reviewer',
  FINANCE: 'finance',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Role Display Names
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.RESEARCHER]: 'Researcher',
  [ROLES.REVIEWER]: 'Reviewer',
  [ROLES.FINANCE]: 'Finance',
};

// Permissions
export const PERMISSIONS = {
  // Content permissions
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  // Source permissions
  SOURCES_VIEW: 'sources.view',
  SOURCES_CREATE: 'sources.create',
  SOURCES_EDIT: 'sources.edit',
  SOURCES_DELETE: 'sources.delete',
  // Claim permissions
  CLAIMS_VERIFY: 'claims.verify',
  // Invoice permissions
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_ISSUE: 'invoices.issue',
  // Report permissions
  REPORTS_VIEW: 'reports.view',
  // Admin permissions
  USERS_MANAGE: 'users.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Paper Status
export const PAPER_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in_review',
  PUBLISHED: 'published',
} as const;

export type PaperStatus = (typeof PAPER_STATUS)[keyof typeof PAPER_STATUS];

// Invoice Status
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PAID: 'paid',
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

// Claim Verification Status
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// Source recency constraint (years)
export const SOURCE_MAX_AGE_YEARS = 10;

// Current year for validation
export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_SOURCE_YEAR = CURRENT_YEAR - SOURCE_MAX_AGE_YEARS;
