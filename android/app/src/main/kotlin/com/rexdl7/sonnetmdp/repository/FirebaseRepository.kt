package com.rexdl7.sonnetmdp.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.rexdl7.sonnetmdp.data.Track
import com.rexdl7.sonnetmdp.data.Playlist
import kotlinx.coroutines.tasks.await
import java.util.UUID

class FirebaseRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun getCurrentUser() = auth.currentUser

    suspend fun getLikedTracks(): List<String> {
        val userId = auth.currentUser?.uid ?: return emptyList()
        val doc = db.collection("user_libraries").document(userId).get().await()
        return doc.get("likedTrackIds") as? List<String> ?: emptyList()
    }

    suspend fun getUserPlaylists(): List<Playlist> {
        val userId = auth.currentUser?.uid ?: return emptyList()
        val snapshot = db.collection("playlists")
            .whereEqualTo("userId", userId)
            .get()
            .await()
        
        return snapshot.documents.map { doc ->
            Playlist(
                id = doc.id,
                name = doc.getString("name") ?: "Unnamed",
                description = doc.getString("description") ?: "",
                userId = doc.getString("userId") ?: "",
                createdAt = doc.getString("createdAt")
            )
        }
    }
}
