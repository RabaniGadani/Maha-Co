# Maha LPG Co Shop Management System Constitution

## Core Principles

### I. Data Integrity & Calculation
Data accuracy is paramount. All financial calculations, especially profit, must be derived directly from input values and maintained consistently.
-   **Kg:** Must be a numeric value representing item weight.
-   **Buy Price:** Numeric value for item acquisition cost.
-   **Sell Price:** Numeric value for item sale price.
-   **Profit:** Automatically calculated as `Sell Price - Buy Price`. This is a derived field and should not be manually editable.
-   **Item Name:** Textual identifier for the LPG product.

### II. User-Centric Design
The system must be user-friendly, intuitive, and responsive across various devices. Simplicity and ease of use for shop owners are key.

### III. Scalable Management
The system will support efficient management of product collections (inventory), sales, and purchases, ensuring accurate stock tracking and historical data.

### IV. Supabase-First Development
All data persistence and authentication will leverage Supabase. This includes data storage, user authentication, and row-level security policies.

### V. Reporting & Analytics
The system will provide robust reporting capabilities (daily, monthly) to enable informed business decisions, with export options for further analysis.

## Project Scope

### In Scope:
-   LPG item (product) catalog management (name, weight, buy price, sell price, stock).
-   Sales transaction recording (linking to items, quantities).
-   Purchase (inventory intake) recording.
-   Automatic profit calculation per item and overall.
-   Stock level tracking and adjustments.
-   User authentication (login, logout).
-   Role-based access control (Admin, Regular User).
-   Exportable daily and monthly profit reports.
-   User-friendly and responsive web interface.

### Out of Scope:
-   Complex customer relationship management (CRM) beyond basic tracking.
-   Advanced supply chain management features (e.g., supplier ordering automation).
-   Payment gateway integrations.
-   Offline functionality.

## Technical Stack

-   **Frontend:** Next.js, React, Tailwind CSS.
-   **Backend/Database:** Supabase (PostgreSQL, Auth, RLS).

## Governance
This constitution serves as the guiding document for the Maha LPG Co Shop Management System. All development decisions and implementations must align with these principles. Amendments require documented review and approval.

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
