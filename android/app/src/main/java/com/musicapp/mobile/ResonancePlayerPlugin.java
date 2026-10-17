
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

import com.getcapacitor.JSArray;
import org.json.JSONObject;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.List;

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
                    //android.util.Log.d("ResonancePlayer", "Track ended — emitting trackEnded event");
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
        public void setQueue(PluginCall call) {
            JSArray tracks = call.getArray("tracks");
            Integer startIndexValue = call.getInt("startIndex");

            if (tracks == null || tracks.length() == 0) {
                call.reject("The queue must contain at least one track.");
                return;
            }

            if (startIndexValue == null
                    || startIndexValue < 0
                    || startIndexValue >= tracks.length()) {
                call.reject("A valid startIndex is required.");
                return;
            }

            final int startIndex = startIndexValue;
            final List<MediaItem> mediaItems = new ArrayList<>();

            try {
                for (int i = 0; i < tracks.length(); i++) {
                    JSONObject track = tracks.getJSONObject(i);

                    String id = track.optString("id", "");
                    String url = track.optString("url", "");
                    String title = track.optString("title", "Unknown track");
                    String artist = track.optString("artist", "Unknown artist");
                    String album = track.optString("album", "");

                    if (id.isEmpty() || url.trim().isEmpty()) {
                        call.reject(
                            "Every queue track must have an ID and stream URL."
                        );
                        return;
                    }

                    MediaMetadata metadata =
                        new MediaMetadata.Builder()
                            .setTitle(title)
                            .setArtist(artist)
                            .setAlbumTitle(album)
                            .build();

                    MediaItem item =
                        new MediaItem.Builder()
                            .setMediaId(id)
                            .setUri(url)
                            .setMediaMetadata(metadata)
                            .build();

                    mediaItems.add(item);
                }
            } catch (JSONException error) {
                call.reject("Unable to read the queue tracks.", error);
                return;
            }

            withController(call, player -> {
                endEventSentForCurrentItem = false;

                player.setMediaItems(mediaItems, startIndex, 0L);
                player.prepare();
                player.play();

                JSObject result = new JSObject();
                result.put("accepted", true);
                call.resolve(result);
            });
        }

            @PluginMethod
                public void updateQueue(PluginCall call) {
                    JSArray tracks = call.getArray("tracks");

                    if (tracks == null) {
                        call.reject("The updated queue tracks are required.");
                        return;
                    }

                    if (tracks.length() == 0) {
                        withController(call, player -> {
                            endEventSentForCurrentItem = false;
                            player.pause();
                            player.clearMediaItems();
                            JSObject result = new JSObject();
                            result.put("accepted", true);
                            call.resolve(result);
                        });
                        return;
                    }

                    final List<MediaItem> mediaItems = new ArrayList<>();

                    try {
                        for (int i = 0; i < tracks.length(); i++) {
                            JSONObject track = tracks.getJSONObject(i);

                            String id = track.optString("id", "");
                            String url = track.optString("url", "");
                            String title = track.optString("title", "Unknown track");
                            String artist = track.optString("artist", "Unknown artist");
                            String album = track.optString("album", "");

                            if (id.isEmpty() || url.trim().isEmpty()) {
                                call.reject(
                                    "Every queue track must have an ID and stream URL."
                                );
                                return;
                            }

                            MediaMetadata metadata = new MediaMetadata.Builder()
                                .setTitle(title)
                                .setArtist(artist)
                                .setAlbumTitle(album)
                                .build();

                            MediaItem item = new MediaItem.Builder()
                                .setMediaId(id)
                                .setUri(url)
                                .setMediaMetadata(metadata)
                                .build();

                            mediaItems.add(item);
                        }
                    } catch (JSONException error) {
                        call.reject("Unable to read the updated queue.", error);
                        return;
                    }

                    withController(call, player -> {
                        MediaItem currentItem = player.getCurrentMediaItem();
                        String currentMediaId =
                            currentItem != null ? currentItem.mediaId : "";

                        long currentPosition = Math.max(0L, player.getCurrentPosition());
                        boolean wasPlaying = player.isPlaying();
                        int previousState = player.getPlaybackState();

                        int preservedIndex = -1;

                        if (!currentMediaId.isEmpty()) {
                            for (int i = 0; i < mediaItems.size(); i++) {
                                if (currentMediaId.equals(mediaItems.get(i).mediaId)) {
                                    preservedIndex = i;
                                    break;
                                }
                            }
                        }

                        if (preservedIndex >= 0) {
                            player.setMediaItems(mediaItems, preservedIndex, currentPosition);
                        } else {
                            int requestedStartIndex = call.getInt("startIndex", 0);
                            int fallbackIndex = Math.max(
                                0,
                                Math.min(requestedStartIndex, mediaItems.size() - 1)
                            );

                            player.setMediaItems(mediaItems, fallbackIndex, 0L);
                        }

                        player.prepare();

                        if (wasPlaying || previousState == Player.STATE_ENDED) {
                            player.play();
                        } else {
                            player.pause();
                        }

                        JSObject result = new JSObject();
                        result.put("accepted", true);
                        call.resolve(result);
                    });
                }


    @PluginMethod
    public void setPlaybackModes(PluginCall call) {
        String repeatMode = call.getString("repeatMode", "off");
        Boolean shuffleEnabled = call.getBoolean("shuffleEnabled", false);

        final int nativeRepeatMode;
        if ("all".equals(repeatMode)) {
            nativeRepeatMode = Player.REPEAT_MODE_ALL;
        } else if ("one".equals(repeatMode)) {
            nativeRepeatMode = Player.REPEAT_MODE_ONE;
        } else if ("off".equals(repeatMode)) {
            nativeRepeatMode = Player.REPEAT_MODE_OFF;
        } else {
            call.reject("repeatMode must be off, all, or one.");
            return;
        }

        withController(call, player -> {
            player.setRepeatMode(nativeRepeatMode);
            player.setShuffleModeEnabled(Boolean.TRUE.equals(shuffleEnabled));
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
    public void skipToNext(PluginCall call) {
        withController(call, player -> {
            if (player.hasNextMediaItem()) {
                player.seekToNextMediaItem();
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void skipToPrevious(PluginCall call) {
        withController(call, player -> {
            if (player.getCurrentPosition() > 3000L) {
                player.seekTo(0L);
            } else if (player.hasPreviousMediaItem()) {
                player.seekToPreviousMediaItem();
            } else {
                player.seekTo(0L);
            }
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

        if (item != null) {
            state.put("mediaId", item.mediaId);
        } else {
            state.put("mediaId", "");
        }

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
