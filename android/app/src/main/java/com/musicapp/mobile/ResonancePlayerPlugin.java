
package com.musicapp.mobile;

import android.content.ComponentName;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.session.MediaController;
import androidx.media3.session.SessionToken;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.common.util.concurrent.ListenableFuture;

import android.os.Handler;
import android.os.Looper;

import androidx.media3.common.Player;

@CapacitorPlugin(name = "ResonancePlayer")
public class ResonancePlayerPlugin extends Plugin {

    private ListenableFuture<MediaController> controllerFuture;
    private MediaController controller;

    private MediaController observedController;

    private boolean endEventSentForCurrentItem = false;

    private final Handler mainHandler =
        new Handler(Looper.getMainLooper());

    private final Runnable positionUpdates = new Runnable() {
        @Override
        public void run() {
            if (controller == null) {
                return;
            }

            emitPlaybackState(null);

            if (controller.isPlaying()) {
                mainHandler.postDelayed(this, 1000);
            }
        }
    };

    private final Player.Listener playbackListener =
        new Player.Listener() {
            @Override
            public void onEvents(
                Player player,
                Player.Events events
            ) {
                emitPlaybackState(null);
            }

            @Override
            public void onPlayerError(
                androidx.media3.common.PlaybackException error
            ) {
                emitPlaybackState(error);
            }

                        @Override
            public void onMediaItemTransition(
                MediaItem mediaItem,
                int reason
            ) {
                endEventSentForCurrentItem = false;
            }

            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (
                    playbackState == Player.STATE_ENDED
                    && !endEventSentForCurrentItem
                ) {
                    endEventSentForCurrentItem = true;
                    android.util.Log.d("ResonancePlayer", "Track ended — emitting trackEnded event");
                    notifyListeners("trackEnded", new JSObject());
                }
            }
        };


    @Override
    public void load() {
        SessionToken token = new SessionToken(
            getContext(),
            new ComponentName(
                getContext(),
                ResonancePlaybackService.class
            )
        );

        controllerFuture =
            new MediaController.Builder(getContext(), token)
                .buildAsync();

        ResonancePlaybackService.setNavigationListener(action -> {
            JSObject event = new JSObject();
            event.put(
                "action",
                ResonancePlaybackService.ACTION_PREVIOUS.equals(action)
                    ? "previous"
                    : "next"
            );
            android.util.Log.d("ResonancePlayer", "Emitting native navigation: " + event.getString("action"));
            notifyListeners("nativeNavigation", event);
        });

        controllerFuture.addListener(() -> {
            try {
                controller = controllerFuture.get();
                attachControllerListener(controller);
            } catch (Exception error) {
                android.util.Log.e(
                    "ResonancePlayer",
                    "Unable to connect to playback service",
                    error
                );
            }
        }, ContextCompat.getMainExecutor(getContext()));
    }

    @PluginMethod
    public void playTrack(PluginCall call) {
        String url = call.getString("url");
        String title = call.getString("title", "Unknown track");
        String artist = call.getString("artist", "Unknown artist");
        String album = call.getString("album", "");

        if (url == null || url.trim().isEmpty()) {
            call.reject("A stream URL is required.");
            return;
        }

        withController(call, player -> {
            MediaMetadata metadata =
                new MediaMetadata.Builder()
                    .setTitle(title)
                    .setArtist(artist)
                    .setAlbumTitle(album)
                    .build();

            MediaItem item =
                new MediaItem.Builder()
                    .setUri(url)
                    .setMediaMetadata(metadata)
                    .build();

            endEventSentForCurrentItem = false;        
            player.setMediaItem(item);
            player.prepare();
            player.play();

            JSObject result = new JSObject();
            result.put("accepted", true);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void pause(PluginCall call) {
        withController(call, player -> {
            player.pause();
            call.resolve();
        });
    }

    @PluginMethod
    public void resume(PluginCall call) {
        withController(call, player -> {
            player.play();
            call.resolve();
        });
    }

    @PluginMethod
    public void seekTo(PluginCall call) {
        Integer positionValue = call.getInt("positionMs");

        if (positionValue == null) {
            Double positionDouble = call.getDouble("positionMs");

            if (positionDouble == null
                    || !Double.isFinite(positionDouble)
                    || positionDouble < 0
                    || positionDouble > Long.MAX_VALUE) {
                call.reject("A valid non-negative positionMs is required.");
                return;
            }

            long position = Math.round(positionDouble);

            withController(call, player -> {
                player.seekTo(position);
                call.resolve();
            });
            return;
        }

        if (positionValue < 0) {
            call.reject("A non-negative positionMs is required.");
            return;
        }

        long position = positionValue.longValue();

        withController(call, player -> {
            player.seekTo(position);
            call.resolve();
        });
    }


    private interface ControllerAction {
        void run(MediaController player);
    }

    private void withController(
        PluginCall call,
        ControllerAction action
    ) {
        
        if (controller != null) {
            ContextCompat.getMainExecutor(getContext()).execute(() -> {
                try {
                    attachControllerListener(controller);
                    action.run(controller);
                } catch (Exception error) {
                    android.util.Log.e(
                        "ResonancePlayer",
                        "Native playback operation failed",
                        error
                    );
                    call.reject("Native playback operation failed.");
                }
            });
            return;
        }


        if (controllerFuture == null) {
            call.reject("Playback controller is unavailable.");
            return;
        }

        controllerFuture.addListener(() -> {
            try {
                MediaController connected =
                    controllerFuture.get();
                
                    controller = connected;
                    attachControllerListener(controller);

                    try {
                        action.run(connected);
                    } catch (Exception error) {
                        android.util.Log.e(
                            "ResonancePlayer",
                            "Native playback operation failed after connection",
                            error
                        );
                        call.reject("Native playback operation failed.");
                    }

            } catch (Exception error) {
                call.reject(
                    "Unable to connect to native playback.",
                    error
                );
            }
        }, ContextCompat.getMainExecutor(getContext()));
    }

    
    private void attachControllerListener(MediaController player) {
        if (observedController == player) {
            return;
        }

        if (observedController != null) {
            observedController.removeListener(playbackListener);
        }

        observedController = player;
        player.addListener(playbackListener);

        emitPlaybackState(null);
    }

    private void emitPlaybackState(
        androidx.media3.common.PlaybackException error
    ) {
        MediaController player = observedController;

        if (player == null) {
            return;
        }

        JSObject state = new JSObject();

        MediaItem item = player.getCurrentMediaItem();
        MediaMetadata metadata =
            item != null ? item.mediaMetadata : MediaMetadata.EMPTY;

        state.put("title", metadata.title != null
            ? metadata.title.toString() : "");
        state.put("artist", metadata.artist != null
            ? metadata.artist.toString() : "");
        state.put("album", metadata.albumTitle != null
            ? metadata.albumTitle.toString() : "");

        state.put("isPlaying", player.isPlaying());
        state.put("isLoading", player.isLoading());
        state.put("playbackState", player.getPlaybackState());

        long duration = player.getDuration();
        state.put(
            "durationMs",
            duration == androidx.media3.common.C.TIME_UNSET ? -1 : duration
        );
        state.put("positionMs", player.getCurrentPosition());

        state.put(
            "error",
            error != null ? error.getErrorCodeName() : ""
        );

        if (player.isPlaying()) {
            mainHandler.removeCallbacks(positionUpdates);
            mainHandler.postDelayed(positionUpdates, 1000);
        } else {
            mainHandler.removeCallbacks(positionUpdates);
        }
        notifyListeners("playbackState", state);
    }


    @Override
    protected void handleOnDestroy() {
        mainHandler.removeCallbacks(positionUpdates);

        if (observedController != null) {
            observedController.removeListener(playbackListener);
            observedController = null;
        }
        if (controllerFuture != null) {
            MediaController.releaseFuture(controllerFuture);
            controllerFuture = null;
            controller = null;
        }

        ResonancePlaybackService.setNavigationListener(null);
        super.handleOnDestroy();
    }
}
