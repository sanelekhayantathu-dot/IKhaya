# Security Specification

## 1. Data Invariants
1. **User Profile Isolation**: A user (`/users/{userId}`) can only write to their own profile. A student cannot modify admin roles or access another user's personal documents.
2. **Landlord Property Ownership**: Only verified landlords or admins can create/update `/accommodations/{accommodationId}`. Landlords can only edit listings where `resource.data.landlordId == request.auth.uid`.
3. **Application Privacy**: A `/applications/{applicationId}` record can only be read by the applicant student (`studentId == request.auth.uid`), the listing landlord (`landlordId == request.auth.uid`), or an admin.
4. **Conversation Secrecy**: Direct messaging threads in `/conversations/{conversationId}` and `/conversations/{conversationId}/messages/{messageId}` can only be accessed by the participating student (`studentId`) or landlord (`landlordId`).
5. **Vault Document Privacy**: Encrypted rental documents in `/studentDocuments/{documentId}` are only accessible by the owner student (`studentId == request.auth.uid`) or verified staff admins.
6. **Default Deny**: All unmapped collections or unauthorized routes return `PERMISSION_DENIED`.

## 2. The "Dirty Dozen" Malicious Payloads
1. Student attempts to update another student's document vault status to `Verified`.
2. Anonymous user attempts to write to `/accommodations/acc-1`.
3. Landlord attempts to approve their own unaccredited property without Admin status.
4. User attempts to inject a 10MB string payload into a chat message text field.
5. Student attempts to read another student's private booking application.
6. Attacker attempts to forge `userId` during user profile registration.
7. Unauthenticated user attempts to list all conversations across the platform.
8. Student attempts to delete a landlord's active accommodation listing.
9. Malicious actor attempts to escalate their role to `admin` in `/users/{userId}`.
10. Attacker attempts to inject unauthorized path variables in `/conversations/`.
11. User attempts to modify immutable creation timestamp fields.
12. Attacker attempts to read `/studentDocuments/` without being the document owner or an admin.
