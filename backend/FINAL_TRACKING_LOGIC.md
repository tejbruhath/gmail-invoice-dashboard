# ✅ Final Tracking Logic - Based on Your Examples

## ✅ TRACKED (Valid Purchases)

### 1. Simpl "charged via" Emails
**Subject:** "₹130.05 on Zepto. charged via Simpl"
```
✅ Has purchase indicator: "charged via"
✅ Amount from subject: ₹130.05
✅ Merchant: Zepto
✅ Category: Groceries
→ TRACKED
```

**Subject:** "₹163.0 on blinkit charged via Simpl"
```
✅ Has purchase indicator: "charged via"
✅ Amount from subject: ₹163.0
✅ Merchant: Blinkit
✅ Category: Groceries
→ TRACKED
```

### 2. LazyPay "has paid" Emails
**Subject:** "LazyPay Transaction Details - AIRTEL"
**Body:** "LazyPay has paid AIRTEL on your behalf ₹649.00"
```
✅ Has purchase indicator: "has paid"
✅ Amount: ₹649.00
✅ Merchant: Airtel
✅ Category: Bills
→ TRACKED
```

**Subject:** "LazyPay Transaction Details - Swiggy"
**Body:** "LazyPay has paid Swiggy on your behalf ₹138.00"
```
✅ Has purchase indicator: "has paid"
✅ Amount: ₹138.00
✅ Merchant: Swiggy
✅ Category: Food
→ TRACKED
```

## ❌ SKIPPED (Not Purchases)

### 1. Payment Schedule Complete
**Subject:** "All scheduled Pay in 3 payments complete for your purchase of Rs.1014.04 on Zepto"
```
⏭️  SKIPPED: Payment schedule complete (you paid back)
Reason: You finished paying back the BNPL in 3 installments
→ NOT TRACKED
```

### 2. Installment Payment Reminders
**Subject:** "Pay-in-3 second payment of ₹691.66 has been added to your Simpl Bill"
```
⏭️  SKIPPED: Installment payment reminder
Reason: This is an installment reminder, not the original purchase
→ NOT TRACKED
```

### 3. Dues/Bill Summary
**Subject:** "Your LazyPay Dues"
```
⏭️  SKIPPED: Dues/bill summary email
Reason: Total bill summary, not individual purchase
→ NOT TRACKED
```

### 4. Payment Received (Repayment)
**Subject:** "Payment Received"
```
⏭️  SKIPPED: Repayment confirmation
Reason: You paying back BNPL
→ NOT TRACKED
```

### 5. Promotional Emails
**Subject:** "Flat ₹100 off on Instamart with Simpl"
```
⏭️  SKIPPED: Promotional email
Reason: Promo/marketing, not a purchase
→ NOT TRACKED
```

## 🎯 Key Rules

### MUST Have (to be tracked):
1. **Purchase indicator** in subject or body:
   - "charged via"
   - "has paid"
   - "added to bill" (original, not installment)
   - "purchase of"
   - "payment successful on"

2. **Valid merchant name** detected

3. **Amount** extracted from subject (preferred) or body

### MUST NOT Have (will be skipped):
1. "all scheduled payments complete"
2. "pay-in-3 X payment of" (installment reminders)
3. "your LazyPay/Simpl dues"
4. "payment received" (without merchant context)
5. "flat X off" (promotions)
6. "account activated"

## 📊 Amount Extraction Priority

1. **Subject line** (most accurate)
   - "₹130.05 on Zepto" → Extract ₹130.05

2. **Email body** (fallback)
   - "LazyPay has paid Swiggy ₹138.00" → Extract ₹138.00

3. **Ignore:**
   - "Total Due: ₹5101.12" in "ONE BILL SUMMARY" section
   - Payment schedule amounts

## 🔄 Duplicate Prevention

Same merchant + same amount + same date (±1 day) = Duplicate

**Example:**
```
Email 1: Swiggy ₹138 on Oct 1
Email 2: Swiggy ₹138 on Oct 1
→ Email 2 SKIPPED (duplicate)
```

## 🚀 Final Result

### What You'll See
- ✅ Only ACTUAL purchases when BNPL paid the merchant
- ✅ Correct amounts from subject line
- ✅ No installment reminders
- ✅ No payment completion confirmations
- ✅ No bill summaries
- ✅ No duplicates

### Dashboard Will Show
```
Zepto - ₹130.05 (Groceries)
Blinkit - ₹163.0 (Groceries)
Airtel - ₹649.00 (Bills)
Swiggy - ₹138.00 (Food)
```

**100% accurate spending tracking!** 🎉
