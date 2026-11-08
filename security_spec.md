# Security Specification - sonnetmdp

## Data Invariants
1. A `UserLibrary` must belong to a valid authenticated user.
2. A `Playlist` must be linked to a `userId` who is the owner.
3. Users can only read and write their own library and playlists.
4. `createdAt` and `userId` fields are immutable once set.
5. All IDs must be valid alphanumeric strings under 128 characters.

## The "Dirty Dozen" Payloads (Unauthorized Access Attempts)

1. **Identity Spoofing**: Attempting to create a library for another user's UID.
2. **Library Theft**: User B attempting to read User A's `user_libraries` document.
3. **Playlist Hijack**: User B attempting to update User A's playlist metadata.
4. **Shadow Update**: Adding a `isAdmin` field to a user profile document.
5. **Resource Poisoning**: Document ID with malicious characters (e.g. `../etc/passwd`).
6. **Immortal Field Bypass**: Attempting to change `createdAt` on an existing playlist.
7. **Size Attack**: A track title string that is 1MB in size.
8. **Orphaned Record**: Creating a playlist with a non-existent `userId`.
9. **Blanket Read**: Querying `/playlists` without a `where('userId', '==', uid)` clause.
10. **Terminal State Break**: (N/A for this app yet, but relevant for future status fields).
11. **Type Poisoning**: Sending a boolean where a list of track IDs is expected.
12. **Unverified Email**: Accessing data with an account that has `email_verified: false`.

## Test Plan
Tests will verify that every one of these malicious payloads is rejected with `PERMISSION_DENIED`.
