package com.example.canon

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.graphics.toColorInt

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun OnboardingScreen() {
    val spotifyButtonColors = ButtonDefaults.buttonColors(
        containerColor = Color("#1DB954".toColorInt()),
        contentColor = Color.White,
        disabledContainerColor = Color.Gray,
        disabledContentColor = Color.LightGray
    )

    Box(
        modifier = Modifier
            .fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Button(
            onClick = { spotifyConnect("foo") },
            colors = spotifyButtonColors,
        ) {
            Text(text = "Sign in with SpotifySSO")
        }
    }
}

fun spotifyConnect(id: String) {
    return
}