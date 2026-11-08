package com.rexdl7.sonnetmdp.data

data class Track(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Long, // in seconds
    val thumbnailUrl: String,
    val source: String, // youtube, stream, local, curated
    val mediaUrl: String,
    val youtubeId: String? = null,
    val videoUrl: String? = null,
    val lyrics: String? = null,
    val genre: String? = null,
    val year: Int? = null,
    val fileSize: String? = null,
    val channelTitle: String? = null,
    val viewCount: String? = null,
    val publishedAt: String? = null,
    val mediaCategory: String? = null
)

data class Playlist(
    val id: String,
    val userId: String,
    val title: String? = null,
    val name: String? = null,
    val description: String,
    val coverUrl: String? = null,
    val trackIds: List<String>? = null,
    val tracks: List<Track>? = null,
    val isCustom: Boolean = false,
    val createdAt: String? = null
)

data class UserAuthProfile(
    val uid: String,
    val displayName: String? = null,
    val email: String? = null,
    val photoURL: String? = null,
    val isAnonymous: Boolean = false
)

data class AppSettings(
    val appTheme: String = "youtube-music",
    val listeningQuality: String = "standard",
    val customBitrate: Int = 320,
    val customSampleRate: Int = 48000,
    val customBufferSize: Int = 1024,
    val spatialAudioWidth: Int = 100,
    val ditherEnabled: Boolean = true,
    val crossfade: Int = 4,
    val replayGain: Boolean = true,
    val autoEq: Boolean = true,
    val vocalClarity: Boolean = true,
    val glassIntensity: String = "deep",
    val accentTheme: String = "amber",
    val visualizerMode: String = "bars",
    val sleepTimerMinutes: Int = 0,
    val hapticFeedback: Boolean = true
)
