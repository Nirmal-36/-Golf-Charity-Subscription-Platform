# Golf Charity Subscription Platform - Subscription Workflow Guide

## Complete End-to-End Subscription Management

---

## TABLE OF CONTENTS
1. Subscriber Journey
2. Payment Processor Flow (Stripe)
3. Charity Partner Flow
4. Admin Control Panel
5. Financial Flow & Distribution
6. Subscription Lifecycle States
7. Monthly Transaction Cycle
8. Edge Cases & Handling

---

## 1. SUBSCRIBER JOURNEY

### Phase 1: Discovery & Purchase

**Step 1: Browse Plans**
- User visits landing page or dashboard
- Sees two plan options:
  - **Monthly Plan**: $9.99/month (flexible, cancel anytime)
  - **Yearly Plan**: $99/year (2 months savings, 17% discount)
- Feature comparison displayed with transparency

**Step 2: Select Charity**
- User must choose a charity before payment
- Minimum contribution: 10% of subscription fee
- Optional: Increase charity percentage (15%, 20%, 25%+)
- Charity profile includes:
  - Organization description
  - Impact metrics
  - Upcoming events (e.g., golf charity days)
  - Contact & donation history

**Step 3: Payment via Stripe**
- Click "Subscribe" → Stripe-hosted checkout
- Card information entered securely
- Real-time validation of card details
- 3D Secure authentication if required
- No card data stored on platform (PCI compliance)

**Step 4: Subscription Activated**
- Confirmation email sent immediately
- Access granted to:
  - User dashboard
  - Score entry interface
  - Community features
  - Charity profile page
- Welcome email with quick start guide

### Phase 2: Active Subscription

**Step 5: Enter Golf Scores**
- User enters last 5 Stableford scores
- Each score includes date and 1-45 point range
- Rolling system: New score replaces oldest automatically
- Edit/delete scores within 7 days of entry
- View score history and trends

**Step 6: Auto-Enrollment in Monthly Draw**
- Automatic enrollment when subscription is active
- No additional action needed
- User can view upcoming draw date
- See odds and prize pool estimate

### Phase 3: Monthly Draw Cycle

**Step 7a: NO WIN PATH**
- Draw results published on draw date
- User receives notification (email + dashboard)
- Score not matched → no prize this month
- Subscription continues automatically
- Eligible for next month's draw

**Step 7b: WINNER PATH**
- User receives notification with prize amount
- Status shows "WINNER - Pending Verification"
- Action required: Upload proof of score
  - Screenshot of golf platform with scores
  - Admin verification required
  - Timeline: 24-48 hours typical

**Step 8: Pending Payment**
- Admin reviews uploaded proof
- Verifies score authenticity
- Status: "Pending" → "Approved" or "Rejected"
- If rejected: notification with reason, appeal option

**Step 9: Prize Received**
- Status: "Paid" ✓
- Prize transferred to user's registered payment method
- Email confirmation sent
- Charity donation processed automatically
- User can see transaction in dashboard

### Phase 4: Ongoing Subscription Management

**Monthly Auto-Renewal**
- 3 days before renewal: Reminder email sent
- On renewal date: Automatic charge via Stripe
- Confirmation email sent post-charge
- Funds allocated to:
  - Prize pool (40%)
  - Charity donation (10%+)
  - Platform operations (50%)

**Subscriber Can:**
- Update charity selection
- Increase/decrease charity percentage
- Upgrade to yearly plan
- Pause subscription (temporary)
- Cancel subscription (anytime, no penalty)
- View billing history & invoices
- Download tax receipts for charity donations

---

## 2. PAYMENT PROCESSOR FLOW (STRIPE)

### Initial Subscription Setup

**Process Initial Payment**
1. Redirect to Stripe Checkout
2. User enters card details
3. Stripe validates card (fraud checks)
4. Charge processed in subscriber's currency
5. Payment confirmed immediately

**Transaction Recorded**
- Transaction ID generated
- Subscription ID linked to customer
- Renewal date set (monthly or yearly)
- Card token stored securely (tokenized)
- No sensitive data stored locally

### Recurring Billing System

**Monthly Recurring Charge**
- **Timing**: On subscription anniversary date
- **Attempt Logic**:
  - Primary attempt: 1st attempt at scheduled time
  - Retry 1: If declined, retry after 3 days
  - Retry 2: If still declined, retry after 5 days
  - Final attempt: After 10 days, mark failed
- **Failure Handling**:
  - Card expired → Notify subscriber, request update
  - Insufficient funds → Retry automatically
  - Lost card → Send email alert

**Validate & Confirm**
- Successful charge confirmed
- Confirmation email sent to subscriber
- Receipt generated with itemized breakdown
- Invoice shows:
  - Subscription amount
  - Charity donation amount
  - Charity name & receipt URL
  - Tax information (if applicable)

**Allocate Funds**
Once charge successful, three-way split:
1. **Prize Pool (40%)**: Held in escrow
   - Monthly draw allocations:
     - 5-number match: 40% of pool
     - 4-number match: 35% of pool
     - 3-number match: 25% of pool
   - Rollover: 5-match unclaimed amount carries to next month
2. **Charity Donation (10%+)**: Immediate transfer
   - Minimum: 10% of subscription
   - User can increase percentage
   - Direct bank transfer to charity
   - Tax receipt generated
3. **Platform Revenue (50%)**: Operations budget
   - Server & infrastructure
   - Payment processing fees
   - Support & development
   - Marketing & community

**Payout Winners**
- Prize verified & approved by admin
- Funds released from prize pool
- Transfer via Stripe Connect to winner
- Typical timeline: 1-2 business days
- Winner confirmation sent

### Failed Payment Handling

**Payment Failure Flow**:
1. **Initial Failure**: Email sent to subscriber
2. **Auto-Retry Schedule**:
   - Day 1 (immediate): 1st retry
   - Day 4: 2nd retry
   - Day 9: 3rd retry
3. **After 3 Failures**: 
   - Subscription marked "Past Due"
   - Access to features restricted (can still view scores)
   - Email sent: "Action Required - Update Payment"
   - 14-day grace period to update card
4. **After 14 Days**:
   - Subscription suspended
   - All features disabled
   - Email: "Subscription Suspended"
   - Can reactivate with payment update
5. **After 30 Days**:
   - Subscription cancelled
   - Account marked inactive
   - Data preserved for potential reactivation
   - Can manually resubscribe anytime

---

## 3. CHARITY PARTNER FLOW

### Charity Onboarding

**Approval Process**:
1. Charity submits application
2. Admin verifies:
   - Registered 501(c)(3) or equivalent
   - Valid tax ID
   - Bank account details
   - Nonprofit status
3. Profile published on platform

### Monthly Donation Cycle

**Receive Donation**
- Automatic transfer on 1st of month
- Minimum: 10% of all subscriptions
- Total = sum of all subscriber percentages
- Example:
  - 100 subscribers @ $9.99/month
  - Average charity %: 15%
  - Monthly donation: ~$150

**Update Profile & Share Impact**
- Charity can post:
  - Event announcements (golf charity days)
  - Success stories & testimonials
  - Financial transparency reports
  - Photos & media
  - Program updates
- Content visible to all donors on platform

**Donor Sees Impact**
- Subscriber dashboard shows:
  - Total donated to chosen charity
  - Year-to-date donation amount
  - Charity's recent impact
  - Upcoming events
- Creates emotional connection & retention

**Tax Documentation**
- Monthly donation report generated
- Yearly tax receipt issued
- Shows aggregate donation amount
- Compliant with IRS requirements
- Downloadable from subscriber dashboard

### Charity Portal Access

**Charity Dashboard**:
- View donor list (anonymized or detailed)
- See donation history
- Check payout schedule
- Update profile content
- Monitor subscriber count
- Track donation trends
- Access marketing materials

---

## 4. ADMIN CONTROL PANEL

### Subscription Management

**Monitor Subscriptions**
- Real-time subscription status dashboard
- Metrics displayed:
  - Total active subscriptions
  - Monthly recurring revenue (MRR)
  - Churn rate
  - Lifetime value per subscriber
  - Upgrade/downgrade rate
- Filter by:
  - Status (active, renewing, lapsed, cancelled)
  - Plan type (monthly vs yearly)
  - Charity selected
  - Signup date
  - Payment status

**Subscription Actions**:
- Manually adjust renewal date
- Pause subscription (temporary)
- Cancel subscription (with reason)
- Refund transaction (full or partial)
- Upgrade/downgrade user plan
- Change charity assignment
- View payment history

### Draw Management

**Configure Draws**
- Set draw date (default: last day of month)
- Choose draw type:
  - **Random**: Standard lottery-style
  - **Algorithmic**: Weighted by frequency
    - Most frequent scores (higher chance)
    - Least frequent scores (lower chance)
    - Balanced algorithm (equal weight)
- Set prize pool allocations:
  - 5-number match: 40% (default)
  - 4-number match: 35% (default)
  - 3-number match: 25% (default)

**Simulation & Testing**
- Pre-draw simulation available
- Run draw on test data
- Preview results
- Verify calculations
- Check for edge cases

**Run & Publish Draws**
- Execute draw algorithm
- System calculates:
  - Winning number combinations
  - Winners per tier
  - Prize amounts per winner
  - Rollover to next month (if no 5-match)
- Publish results:
  - Winner list (private, verified winners only)
  - Anonymized results (public)
  - Prize breakdowns
  - Notification emails sent

### Winner Verification

**Review Submissions**
- View all "Pending Verification" winners
- Check uploaded proof:
  - Screenshot of platform scores
  - Date & accuracy verification
  - Clear visibility of winning numbers
  - Authenticity check
- Decision options:
  - Approve: Release payout
  - Reject: Request new proof
  - Request Update: Send message to winner

**Approve/Reject Logic**:
- Approval: Status → "Verified", payout released
- Rejection: Status → "Needs Resubmission", email sent
- Resubmit: Winner has 7 days to resubmit
- Failure to resubmit: Prize forfeited to next tier

**Payout Tracking**
- View payout status for all winners
- Pending → Processing → Completed
- See transaction ID & amount
- Verify fund transfers

### Analytics & Reports

**Reports Available**:
1. **Revenue Report**:
   - Total subscription revenue
   - MRR / ARR
   - Breakdown by plan type
   - Charity donations summary
   - Platform revenue

2. **User Report**:
   - Total users
   - Active subscriptions
   - Churn rate (monthly)
   - Cohort analysis
   - Retention curves

3. **Draw Statistics**:
   - Winners per month
   - Prize pool utilization
   - Average prize payout
   - Most/least frequent scores
   - Draw participation rate

4. **Charity Report**:
   - Total donations by charity
   - Top charities (by donor count)
   - Donation trends
   - Charity performance metrics

---

## 5. FINANCIAL FLOW & DISTRIBUTION

### Monthly Subscription Breakdown

**Subscriber Pays**: $9.99 (monthly) or $99 (yearly = $8.25/month)

#### Distribution Model:
```
$9.99 per subscriber per month (100% = $9.99)
├─ Prize Pool: 40% ($3.996/subscriber)
│  └─ Held in escrow, distributed monthly to winners
├─ Charity Donation: 10%+ ($0.999+/subscriber)
│  └─ User can increase to 15%, 20%, 25%+
│  └─ Direct transfer to charity selected
└─ Platform Revenue: 50% ($4.995/subscriber)
   └─ Operations, maintenance, development, support
```

### Example: 1,000 Subscribers

**Monthly Revenue**: $9,990

**Distribution**:
- Prize Pool: $3,996
  - Distributed to winners (5/4/3-match)
  - Example: 50 winners averaging $80 prize
- Charity Donations: $999+ (at 10% minimum)
  - Split among selected charities
  - Example: 10 charities average $100 each
- Platform: $4,995
  - Covers operational costs

### Annual Projections

**Year 1 (Starting 1,000 subscribers)**:
- Total Annual Revenue: $119,880
- Prize Distributed: $47,952
- Charity Funded: $11,988
- Platform Operations: $59,940

**Year 2 (Projected 5,000 subscribers)**:
- Total Annual Revenue: $599,400
- Prize Distributed: $239,760
- Charity Funded: $59,940
- Platform Operations: $299,700

---

## 6. SUBSCRIPTION LIFECYCLE STATES

### State Diagram

```
BROWSING
   ↓
ACTIVE (Subscription Active)
   ├─ Full access to all features
   ├─ Automatic renewal enabled
   └─ Can enter scores, participate in draws
   ↓
RENEWING (7 days before renewal)
   ├─ Reminder email sent
   ├─ Can update payment method
   └─ Auto-renewal scheduled
   ↓
RENEWED (After successful renewal)
   ├─ Back to ACTIVE
   ├─ New renewal date set
   └─ Funds allocated
   
ACTIVE ←→ PAYMENT_FAILED
   ├─ Retry attempts: 3 (days 1, 4, 9)
   ├─ Grace period: 14 days
   ├─ Can update card anytime
   └─ If resolved → back to ACTIVE

PAYMENT_FAILED (After 14 days)
   ↓
SUSPENDED
   ├─ Cannot participate in draws
   ├─ Can view scores (read-only)
   ├─ Email: "Subscription Suspended"
   └─ 30-day reactivation window
   ↓
CANCELLED
   ├─ Manual cancellation
   ├─ After 30-day suspension
   └─ Data preserved for reactivation
   ↓
LAPSED
   ├─ Can reactivate anytime
   ├─ Previous scores preserved
   ├─ Charity setting remembered
   └─ New subscription date starts
```

### State Transitions

**ACTIVE → RENEWING**
- Trigger: 7 days before renewal date
- Action: Send reminder email
- User can: Update payment, upgrade plan, cancel

**RENEWING → RENEWED**
- Trigger: Renewal date, charge succeeds
- Action: Funds allocated, confirmation sent
- Result: Back to ACTIVE

**ACTIVE → PAYMENT_FAILED**
- Trigger: Charge declined
- Action: Auto-retry 3 times
- Result: Stays ACTIVE if retry succeeds

**PAYMENT_FAILED → SUSPENDED**
- Trigger: 3 failures + 14-day grace period
- Action: Disable features, send alert
- Result: Features restricted (view-only)

**SUSPENDED → LAPSED**
- Trigger: 30 days from suspension
- Action: Cancel subscription
- Result: Can reactivate manually

**CANCELLED → LAPSED**
- Trigger: User manual cancellation
- Action: Send retention email
- Result: Can reactivate anytime

---

## 7. MONTHLY TRANSACTION CYCLE

### Complete Flow (30-Day Month)

**Day 1-7: Pre-Renewal Period**
```
Day 1:  → Check renewals due in 7 days
Day 2:  → Send reminder emails to subscribers
Day 5:  → Final payment method validation
Day 7:  → Send 1-day reminder emails
```

**Day 8-10: Renewal & Payment**
```
Day 8:  → Execute scheduled charges (daily batches)
         → Stripe processes 95%+ immediately
         → Declined cards enter retry queue
Day 9:  → First retry attempt (declined from Day 8)
Day 10: → Confirmation emails sent
         → Reconcile with Stripe API
         → Log all transactions
```

**Day 11-20: Fund Allocation**
```
Day 11: → Prize pool calculated (40% of revenue)
        → Charity donations calculated (10%+)
        → Platform revenue recorded (50%)
Day 12: → Transfer charity donations to partners
        → Notify charities of deposits
        → Generate charity receipts
Day 15: → Prize pool consolidated
        → Verify no double-counting
        → Report to admin
```

**Day 21-25: Monthly Draw**
```
Day 21: → Admin confirms draw configuration
        → System generates winning numbers
        → Match winners in database
Day 22: → Announce winners (email + dashboard)
        → Publish results anonymously
        → Request proof from winners
Day 23-24: → Winners upload proofs
            → Admin reviews submissions
            → Verify score authenticity
Day 25: → Approve verified winners
        → Release payout funds
        → Send payment confirmation
```

**Day 26-30: Cleanup & Next Month Prep**
```
Day 26: → Reconcile all transactions
        → Check for failed payments
        → Initiate retry attempts (failed Day 9+)
Day 27: → Generate monthly reports
        → Update analytics dashboard
        → Alert on anomalies
Day 28: → Archive monthly data
        → Prepare for next draw
Day 30: → Month-end reconciliation
        → Verify charity transfers
        → Plan for Day 1 of next month
```

---

## 8. EDGE CASES & HANDLING

### Payment Edge Cases

**1. Duplicate Charge**
- Issue: Same subscriber charged twice
- Detection: Automated duplicate check
- Resolution: Refund issued within 24 hours
- Prevention: Idempotency keys on all charges

**2. Partial Payment Success**
- Issue: System records charge, card network declines
- Detection: Stripe webhook monitoring
- Resolution: Retry on next cycle
- Prevention: Continuous reconciliation

**3. Currency Issues**
- Issue: User in different country, currency conversion
- Detection: Stripe handles automatically
- Resolution: Stripe applies fair exchange rate
- Prevention: Display converted amount before charge

**4. Card Expires During Month**
- Issue: Renewal date arrives, card expired
- Detection: Stripe rejects charge
- Resolution: Entered retry queue, sent update email
- Prevention: 30-day early warning email

### Draw Edge Cases

**1. No Winners in Tier**
- Issue: No one matches 5-number combination
- Resolution: 40% prize rolls to next month
- Example: $100 unclaimed → next month has $140 pool

**2. Multiple Winners Same Tier**
- Issue: 3 people match 4-number combination
- Resolution: Prize split equally
- Example: $200 prize pool ÷ 3 winners = $66.67 each

**3. Winner Cannot Be Verified**
- Issue: Proof screenshot unclear or suspicious
- Resolution: Rejection, 7 days to resubmit
- If expired: Prize forfeited to platform (anti-fraud)

**4. Invalid Score Entry**
- Issue: Subscriber enters score of 50 (max is 45)
- Detection: Input validation catches immediately
- Resolution: Error message, prompt to correct
- Prevention: Input validation on frontend & backend

### Subscription Edge Cases

**1. Subscriber Upgrades Mid-Cycle**
- Issue: Monthly subscriber upgrades to yearly
- Resolution: 
  - Refund prorated portion of monthly (unused days)
  - Charge yearly amount
  - New renewal date: 1 year from upgrade
- Example: Upgraded on day 10 of 30-day month
  - Refund: $9.99 × (20/30) = $6.66
  - New charge: $99.00
  - Net additional: $92.34

**2. Subscriber Changes Charity Mid-Month**
- Issue: Subscription active, wants different charity
- Resolution:
  - Change takes effect next renewal cycle
  - Current cycle funds go to original charity
  - Email confirmation sent
- Prevention: Clear messaging about change timing

**3. Subscriber Pauses During Month**
- Issue: User needs temporary break
- Resolution:
  - Pause for 1-3 months (user selects)
  - No charges during pause
  - Score entry disabled
  - Cannot participate in draws
  - Account preserved with all data
  - Auto-resume on resume date
  - Or manual reactivation

**4. Charity Partner Closes/Merges**
- Issue: User's selected charity no longer exists
- Resolution:
  - Admin notified by charity or user
  - Provide 30-day transition period
  - Offer alternative charities
  - Automatic reassignment to similar cause
  - All historical data preserved
  - No refunds (funds already transferred)

### Refund Policies

**1. Full Refund (Within 7 Days)**
- User requested: Within 7 days of signup
- Reason: Changed mind, no draws yet
- Process: Full refund to original card
- No questions asked

**2. Partial Refund (Monthly Plans)**
- Subscription active: No refund on used days
- Cancellation mid-month: Can resume for free until renewal
- Unused portion: No prorated refund

**3. Partial Refund (Yearly Plans)**
- Cancellation after 30 days: Prorated refund for unused months
- Formula: ($99 / 12) × unused months
- Example: Cancel after 3 months = $99 × 9/12 = $74.25 refund

**4. Prize Dispute Refund**
- User claims prize was unfairly rejected
- Process: Admin review + escalation
- Timeline: 7-14 days
- Resolution: Refund to account credit (can withdraw or reuse)

---

## COMPLIANCE & SECURITY

### PCI Compliance
- No card data stored locally
- All charges processed via Stripe
- Encrypted payment tokens only
- Regular security audits
- SSL/TLS on all transactions

### Tax Compliance
- Monthly tax receipts generated
- State sales tax calculated (US)
- International VAT/GST handled
- Charity donation receipts compliant with IRS
- Annual 1099 reporting for charities

### Fraud Prevention
- Real-time transaction monitoring
- Stripe radar for suspicious activity
- Manual review of unusual patterns
- AVS/CVV verification
- Velocity checks (multiple charges in short time)

### Data Retention
- Transaction history: 7 years (tax/legal)
- Subscription records: Duration + 2 years
- User scores: Indefinite (unless deleted)
- Payout records: Indefinite (audit trail)

---

## MONITORING & ALERTS

### Automated Alerts
- Charge failures: Real-time
- High refund rate: Daily
- Charity transfer failures: Same-day
- Draw anomalies: Day-of
- Revenue drops: Daily

### Dashboard Metrics
- MRR trend (weekly)
- Churn rate (monthly)
- Customer acquisition cost (monthly)
- Lifetime value (monthly)
- Prize pool utilization (per draw)
- Charity funding (monthly)

---

## DISASTER RECOVERY

### Backup Procedures
- Daily database backups (encrypted)
- Weekly offsite backup copies
- Monthly full system test
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour

### Incident Response
- Payment system fails: Manual processing via Stripe API
- Database corruption: Restore from latest backup
- Security breach: Immediate user notification, credit monitoring
- Draw failure: Automatic retry, manual admin override

### Subscriber Communication
- Service status page (public)
- Email notifications for all issues
- Slack alerts to internal team
- SLA: 99.5% uptime target

---

## CONCLUSION

This subscription workflow ensures:
- **Transparency**: Subscribers understand their charges
- **Reliability**: Automated processes with manual overrides
- **Charity Impact**: Real, trackable donations
- **Security**: PCI-compliant, fraud-resistant
- **Scalability**: Handles thousands of subscribers
- **User Control**: Easy to manage subscriptions & charities

The platform balances business sustainability (50% platform revenue) with charitable impact (10%+ donations) and subscriber value (40% prize pool).

