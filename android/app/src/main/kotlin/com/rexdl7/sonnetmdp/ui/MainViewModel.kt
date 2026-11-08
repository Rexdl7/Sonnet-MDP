package com.rexdl7.sonnetmdp.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rexdl7.sonnetmdp.data.Track
import com.rexdl7.sonnetmdp.repository.FirebaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel(
    private val repository: FirebaseRepository = FirebaseRepository()
) : ViewModel() {

    private val _tracks = MutableStateFlow<List<Track>>(emptyList())
    val tracks: StateFlow<List<Track>> = _tracks

    private val _currentTrack = MutableStateFlow<Track?>(null)
    val currentTrack: StateFlow<Track?> = _currentTrack

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying

    init {
        val sample = Track(
            id = "1",
            title = "Sample Track",
            artist = "Kotlin Artist",
            album = "Native Album",
            duration = 180,
            thumbnailUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
            source = "curated",
            mediaUrl = ""
        )
        _tracks.value = listOf(sample)
        _currentTrack.value = sample
    }

    fun playTrack(track: Track) {
        _currentTrack.value = track
        _isPlaying.value = true
    }

    fun togglePlay() {
        _isPlaying.value = !_isPlaying.value
    }
}
