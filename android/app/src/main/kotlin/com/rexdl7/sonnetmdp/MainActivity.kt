package com.rexdl7.sonnetmdp

import android.os.Bundle
import androidx.activity.ComponentActivity
import android.content.Context
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.rexdl7.sonnetmdp.ui.theme.SonnetPlayerTheme
import com.rexdl7.sonnetmdp.ui.screens.LibraryScreen
import com.rexdl7.sonnetmdp.ui.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SonnetPlayerTheme {
                val viewModel: MainViewModel = viewModel()
                val tracks by viewModel.tracks.collectAsState()
                val currentTrack by viewModel.currentTrack.collectAsState()
                val isPlaying by viewModel.isPlaying.collectAsState()
                
                LibraryScreen(
                    tracks = tracks,
                    currentTrack = currentTrack,
                    isPlaying = isPlaying,
                    onTrackClick = { viewModel.playTrack(it) },
                    onTogglePlay = { viewModel.togglePlay() }
                )
            }
        }
    }
}
