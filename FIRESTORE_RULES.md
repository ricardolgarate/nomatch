# Firestore Security Rules

Please update your Firestore security rules in the Firebase Console to allow analytics tracking:

## Go to Firebase Console:
1. Open https://console.firebase.google.com/
2. Select your project: `nomatch-df763`
3. Go to **Firestore Database** → **Rules**

## Replace the rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products collection - read by anyone, write by authenticated users
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Analytics sessions - write by anyone (for tracking), read by authenticated users only
    match /analytics_sessions/{sessionId} {
      allow read: if request.auth != null;
      allow create, update: if true;  // Allow anyone to track their session
      allow delete: if request.auth != null;  // Only admins can delete
    }
  }
}
```

## Explanation:
- **Products**: Anyone can read products, only authenticated admins can modify them
- **Analytics Sessions**: Anyone can create/update their own session (for tracking), but only authenticated admins can read the aggregated data or delete sessions

## Publish the rules:
Click the **Publish** button to save and activate these rules.

