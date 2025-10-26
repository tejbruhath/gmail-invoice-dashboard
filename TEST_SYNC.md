# 🧪 Test Sync Button

## Try this now:

1. **Open the browser console** (F12 → Console tab)
2. **Click the "Sync" button** in the dashboard
3. **Watch for:**
   - Console logs starting with 🔄
   - An alert popup with Job ID
   - Any error messages

## What you should see:

### ✅ Success case:
```
🔄 Starting sync...
✅ Sync started: {jobId: "123", status: "processing"}
[Alert] Sync started! Job ID: 123
🔄 Refreshing dashboard data...
```

### ❌ Error case:
```
❌ Sync failed: [error details]
[Alert] Sync failed: [error message]
```

## Backend logs to check:

After clicking sync, the backend terminal should show:
```
📨 Invoice fetch request received
User ID: [your user id]
User email: [your email]
Max results: 50
✅ Job queued with ID: [job id]
🚀 Starting invoice fetch for user: [user id]
📧 Found X messages matching query
📬 FIRST EMAIL DETAILS: [email info]
```

Let me know what you see!
