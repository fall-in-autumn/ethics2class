# Security Migration Checklist

## 1) Remove client-side admin secret
- Delete any `ADMIN_CODE` constant from frontend code.
- Do not validate admin code in browser JavaScript.

## 2) Never write role from client profile sync
- In `syncProfileToDatabase()`, only write safe fields like `name`, `checklist`, `updatedAt`.
- Do not write `role` from client state.

## 3) Trust role from Firestore only
- During login/session restore, read role from:
  - `artifacts/{appId}/users/{uid}.role`
- Fallback to `student` when no document/role exists.

## 4) Promote admin on server only
- Use `functions/promoteAdmin` endpoint.
- Validate admin code using environment variable `ADMIN_PROMOTION_CODE`.
- Server writes `role: "admin"` to the user doc.

## 5) Enforce Firestore role lock
- `firestore.rules` already blocks non-admin role changes:
  - user can create self doc only with `role == 'student'`
  - user can update self doc only when `role` is unchanged

## Deployment notes
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Deploy function: `firebase deploy --only functions:promoteAdmin`
3. Set environment variable for function runtime:
   - `ADMIN_PROMOTION_CODE`
