package com.rexdl7.sonnetmdp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.rexdl7.sonnetmdp.data.Track
import com.rexdl7.sonnetmdp.ui.components.TrackItem

import com.rexdl7.sonnetmdp.ui.components.MiniPlayer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    tracks: List<Track>,
    currentTrack: Track?,
    isPlaying: Boolean,
    onTrackClick: (Track) -> Unit,
    onTogglePlay: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Your Music Library") }
            )
        },
        bottomBar = {
            MiniPlayer(
                track = currentTrack,
                isPlaying = isPlaying,
                onTogglePlay = onTogglePlay
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            item {
                OfflineStatusCard(cachedCount = 5) // Placeholder for now
            }
            items(tracks) { track ->
                TrackItem(track = track, onClick = { onTrackClick(track) })
            }
        }
    }
}

@Composable
fun OfflineStatusCard(cachedCount: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Offline Playback Ready",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "$cachedCount / 10 tracks cached for offline use",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
