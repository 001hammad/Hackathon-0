---
type: workflow_guide
---

# Approval Workflow

For sensitive actions (payments, sends to new contacts, etc.):

## Process

1. **Create approval request** in `Pending_Approval/` folder
   - Filename format: `[ACTION_TYPE]_[identifier]_[date].md`
   - Example: `PAYMENT_invoice123_2026-02-16.md`

2. **File format**:
```markdown
---
action: send_email
to: someone@example.com
subject: Invoice Payment
amount: $75
reason: Monthly service invoice
requested_by: AI Employee
requested_at: 2026-02-16T16:45:00
---

# Approval Request

## Action Details
- Type: Email with payment link
- Recipient: someone@example.com
- Amount: $75.00
- Purpose: Monthly service invoice for January 2026

## Context
Customer requested invoice via email on 2026-02-15.
Payment is overdue by 3 days.

## Proposed Action
Send email with invoice attached and payment link.

## Risk Assessment
- Low risk: existing customer
- Standard amount within normal range
- No sensitive data exposure
```

3. **Human review**:
   - Move file to `Approved/` → System executes action
   - Move file to `Rejected/` → System cancels and logs

4. **Post-execution**:
   - System moves from `Approved/` to `Done/`
   - Logs action completion in `vault/Logs/`

## Approval Thresholds

Always require approval for:
- **Payments over $50**
- **Emails to new contacts**
- **Calendar changes affecting others**
- **File deletions**
- **External API calls with side effects**
- **Code deployments**

## Example Scenarios

### Payment Approval
```
PAYMENT_vendor_2026-02-16.md in Pending_Approval/
→ Human reviews and moves to Approved/
→ System processes payment via MCP
→ Moves to Done/ with confirmation
```

### Email to New Contact
```
EMAIL_newclient_2026-02-16.md in Pending_Approval/
→ Human reviews draft and moves to Approved/
→ System sends email via Gmail MCP
→ Moves to Done/ with sent confirmation
```

### Rejected Action
```
PAYMENT_suspicious_2026-02-16.md in Pending_Approval/
→ Human identifies issue and moves to Rejected/
→ System logs rejection reason
→ No action taken
```

---

*This workflow ensures human oversight for all sensitive operations while maintaining audit trail.*
