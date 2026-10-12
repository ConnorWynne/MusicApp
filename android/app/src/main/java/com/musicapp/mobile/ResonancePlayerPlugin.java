
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

@CapacitorPlugin(name = "ResonancePlayer")
public class ResonancePlayerPlugin extends Plugin {

    private ListenableFuture<MediaController> controllerFuture;
    private MediaController controller;

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

        controllerFuture.addListener(() -> {
            try {
                controller = controllerFuture.get();
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
        Long position = call.getLong("positionMs");

        if (position == null || position < 0) {
            call.reject("A non-negative positionMs is required.");
            return;
        }

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

    @Override
    protected void handleOnDestroy() {
        if (controllerFuture != null) {
            MediaController.releaseFuture(controllerFuture);
            controllerFuture = null;
            controller = null;
        }

        super.handleOnDestroy();
    }
}
