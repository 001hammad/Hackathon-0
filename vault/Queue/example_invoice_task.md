---
type: task
priority: high
status: example
---

# Example Task: Create Invoice for New Client

**From:** Manual Task Creation
**Created:** 2026-02-23
**Priority:** High

## Task Description

Create an invoice for a new client who has completed their first project.

## Client Details

- **Name:** Acme Corporation
- **Email:** billing@acme-corp.com
- **Project:** Website Redesign - Phase 1
- **Amount:** $5,000.00

## Requirements

1. Create customer/partner in Odoo if not exists
2. Generate invoice draft with line items:
   - Website Design: $2,500
   - Frontend Development: $1,500
   - Backend Integration: $1,000
3. Review invoice before sending
4. Send invoice to client

## Expected Outcome

- Invoice draft created in Odoo
- Invoice number assigned
- Ready for review and approval

## AI Employee Actions

When processed by the AI Employee:
1. Detect "invoice" keyword
2. Extract client details and amount
3. Call Odoo MCP: `POST /create_invoice`
4. Verify invoice creation
5. Log result
6. Move task to Done/

## Notes

This is an example task demonstrating the invoice creation workflow. The AI Employee will automatically process tasks like this when they appear in Needs_Action/ folder.
