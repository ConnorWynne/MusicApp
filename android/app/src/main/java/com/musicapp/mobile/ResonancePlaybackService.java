package com.musicapp.mobile;

import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.media3.common.AudioAttributes;
import androidx.annotation.OptIn;
import androidx.media3.common.util.UnstableApi;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.session.CommandButton;
import androidx.media3.session.MediaSession;
import androidx.media3.session.MediaSessionService;
import androidx.media3.session.SessionCommand;
import androidx.media3.session.SessionCommands;
import androidx.media3.session.SessionResult;

import com.google.common.collect.ImmutableList;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;

import androidx.media3.common.Player;

public class ResonancePlaybackService extends MediaSessionService {

    public static final String ACTION_PREVIOUS = "com.musicapp.mobile.PREVIOUS";
    public static final String ACTION_NEXT = "com.musicapp.mobile.NEXT";

    public interface NavigationListener {
        void onNavigationRequested(String action);
    }

    private static volatile NavigationListener navigationListener;

    public static void setNavigationListener(NavigationListener listener) {
        navigationListener = listener;
    }

    private ExoPlayer player;
    private MediaSession mediaSession;

    private final MediaSession.Callback sessionCallback =
        new MediaSession.Callback() {

            @Override
            public MediaSession.ConnectionResult onConnect(
                MediaSession session,
                MediaSession.ControllerInfo controller
            ) {
                MediaSession.ConnectionResult result =
                    MediaSession.ConnectionResult.accept(
                        MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS
                            .buildUpon()
                            .add(new SessionCommand(ACTION_PREVIOUS, Bundle.EMPTY))
                            .add(new SessionCommand(ACTION_NEXT, Bundle.EMPTY))
                            .build(),
                        MediaSession.ConnectionResult.DEFAULT_PLAYER_COMMANDS
                    );

                return result;
            }

            @Override
            public ListenableFuture<SessionResult> onCustomCommand(
                MediaSession session,
                MediaSession.ControllerInfo controller,
                SessionCommand customCommand,
                Bundle args
            ) {
                String action = customCommand.customAction;


                if (ACTION_NEXT.equals(action)) {
                    session.getPlayer().seekToNextMediaItem();
                } else if (ACTION_PREVIOUS.equals(action)) {
                    Player player = session.getPlayer();

                    // Restart the current track if it has played
                    // for more than three seconds.
                    if (player.getCurrentPosition() > 3000) {
                        player.seekTo(0);
                    } else {
                        player.seekToPreviousMediaItem();
                    }
                }


                return Futures.immediateFuture(
                    new SessionResult(SessionResult.RESULT_SUCCESS)
                );
            }
        };

    @OptIn(markerClass = UnstableApi.class)
    @Override
    public void onCreate() {
        super.onCreate();

        player = new ExoPlayer.Builder(this).build();

        player.setAudioAttributes(
            AudioAttributes.DEFAULT,
            true
        );

        SessionCommand previousCommand =
            new SessionCommand(ACTION_PREVIOUS, Bundle.EMPTY);
        SessionCommand nextCommand =
            new SessionCommand(ACTION_NEXT, Bundle.EMPTY);

        CommandButton previousButton =
            new CommandButton.Builder(CommandButton.ICON_PREVIOUS)
                .setDisplayName("Previous")
                .setSessionCommand(previousCommand)
                .setSlots(CommandButton.SLOT_BACK)
                .build();

        CommandButton nextButton =
            new CommandButton.Builder(CommandButton.ICON_NEXT)
                .setDisplayName("Next")
                .setSessionCommand(nextCommand)
                .setSlots(CommandButton.SLOT_FORWARD)
                .build();

        mediaSession = new MediaSession.Builder(this, player)
            .setCallback(sessionCallback)
            .setMediaButtonPreferences(
                ImmutableList.of(previousButton, nextButton)
            )
            .build();
    }

    @Nullable
    @Override
    public MediaSession onGetSession(
        MediaSession.ControllerInfo controllerInfo
    ) {
        return mediaSession;
    }

    @Override
    public void onDestroy() {

        if (mediaSession != null) {
            mediaSession.release();
            mediaSession = null;
        }

        if (player != null) {
            player.release();
            player = null;
        }

        super.onDestroy();
    }
}