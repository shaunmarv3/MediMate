# 🔒 Firestore Security Rules - AI Insights

## Issue Fixed

**Error:** `FirebaseError: Missing or insufficient permissions`

**Cause:** New collections (`aiInsights` and `aiInsightsHistory`) didn't have security rules defined.

**Solution:** Added proper security rules and deployed to Firebase.

---

## ✅ Rules Added

### 1. AI Insights Cache

```javascript
match /aiInsights/{userId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}
```

**What it does:**
- Users can only read/write their own cached insights
- Must be authenticated (logged in)
- `userId` in path must match `request.auth.uid`

**Collections protected:**
- `aiInsights/{userId}` - Cached insights (7-day cache)

---

### 2. AI Insights History

```javascript
match /aiInsightsHistory/{userId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
  
  match /snapshots/{snapshotId} {
    allow read, write: if isAuthenticated() && isOwner(userId);
  }
}
```

**What it does:**
- Users can only access their own historical snapshots
- Must be authenticated
- `userId` in path must match logged-in user
- Applies to both parent document and subcollection

**Collections protected:**
- `aiInsightsHistory/{userId}` - History parent document
- `aiInsightsHistory/{userId}/snapshots/{weekId}` - Weekly snapshots

---

## 🚀 Deployment

Rules were deployed using:

```bash
firebase deploy --only firestore:rules
```

**Status:** ✅ **Successfully deployed**

**Project:** medimate-c0138

---

## 📊 Complete Rule Structure

```
aiInsights/
  {userId}                          ← Read/Write: Owner only
    └─ (cached insights document)

aiInsightsHistory/
  {userId}                          ← Read/Write: Owner only
    └─ snapshots/
         {weekId}                   ← Read/Write: Owner only
           └─ (weekly snapshot)
```

---

## 🧪 Testing Security

### Valid Request (Should Work)

```javascript
// User abc123 accessing their own insights
const insights = await getDoc(doc(db, 'aiInsights', 'abc123'));
// ✅ Allowed: request.auth.uid === 'abc123'
```

### Invalid Request (Should Fail)

```javascript
// User abc123 trying to access xyz456's insights
const insights = await getDoc(doc(db, 'aiInsights', 'xyz456'));
// ❌ Denied: request.auth.uid !== 'xyz456'
```

---

## 🔍 Verification

After deployment, the dashboard should:

1. ✅ Load cached insights without permission errors
2. ✅ Save new insights to cache
3. ✅ Load insights history (past weeks)
4. ✅ Save weekly snapshots

**No more "Missing or insufficient permissions" errors!**

---

## 📝 Full Rules File

Location: `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // AI Insights Cache
    match /aiInsights/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
    
    // AI Insights History
    match /aiInsightsHistory/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      
      match /snapshots/{snapshotId} {
        allow read, write: if isAuthenticated() && isOwner(userId);
      }
    }
    
    // ... other rules ...
  }
}
```

---

## 🛡️ Security Features

✅ **Authentication Required** - Must be logged in  
✅ **Owner-Only Access** - Can't access other users' data  
✅ **Subcollection Protected** - Snapshots inherit security  
✅ **Read & Write** - Full CRUD permissions for owners  

---

## ⚠️ Important Notes

1. **Cache collection** (`aiInsights/{userId}`) stores current insights
2. **History collection** (`aiInsightsHistory/{userId}`) stores weekly archives
3. **Both require authentication** and owner verification
4. **Rules are deployed** and active in production
5. **Changes take effect immediately** after deployment

---

## 🔄 Future Rule Updates

If you add more collections, remember to:

1. Add rules to `firestore.rules`
2. Deploy with `firebase deploy --only firestore:rules`
3. Test in browser console
4. Verify no permission errors

---

**Issue Resolved! ✅**

The dashboard should now work without permission errors.
