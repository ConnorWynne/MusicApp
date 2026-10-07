# MusicApp

A cross-platform music streaming application being built from scratch
with **React, TypeScript, and Vite**.

MusicApp is designed to provide a modern Spotify/YouTube Music-style
experience while connecting to self-hosted music servers. The first
implemented provider is **Navidrome through the OpenSubsonic/Subsonic
API**.

The architecture is intentionally provider-based so that additional
music servers such as Jellyfin can be added later without rebuilding the
application around a single backend.

------------------------------------------------------------------------

## Table of Contents

-   [Project Overview](#project-overview)
-   [Project Goals](#project-goals)
-   [Current Technology Stack](#current-technology-stack)
-   [Current Status](#current-status)
-   [Completed Features](#completed-features)
-   [Current Player Behaviour](#current-player-behaviour)
-   [Provider Architecture](#provider-architecture)
-   [Navidrome Integration](#navidrome-integration)
-   [Application Structure](#application-structure)
-   [Current Routes](#current-routes)
-   [Getting Started](#getting-started)
-   [Development Workflow](#development-workflow)
-   [Git Workflow](#git-workflow)
-   [Design Principles](#design-principles)
-   [Known Limitations](#known-limitations)
-   [Remaining Roadmap](#remaining-roadmap)
-   [Future Architecture](#future-architecture)
-   [Important Development Rules](#important-development-rules)
-   [Checkpoint History](#checkpoint-history)

------------------------------------------------------------------------

## Project Overview

**MusicApp** is a self-hosted-friendly music streaming client.

The initial goal is to connect to a personal Navidrome server and
provide a polished music-player experience. The application is being
developed incrementally, with each major feature tested before moving
on.

The long-term vision is a single application capable of connecting to
multiple music providers while presenting a consistent interface
regardless of the backend.

### Long-term vision

MusicApp should eventually support:

-   Multiple music servers
-   Navidrome
-   Jellyfin
-   Additional compatible music-server APIs
-   Multiple saved server connections
-   Modern library browsing
-   Search
-   Albums and artists
-   Playlists
-   Favourites
-   Ratings
-   Queue management
-   Shuffle
-   Repeat
-   Scrobbling
-   Lyrics
-   Synced lyrics
-   Background playback
-   Lock-screen controls
-   Notification controls
-   Android Auto
-   Apple CarPlay
-   Cross-platform web/mobile usage
-   Potential future music automation and library-management
    functionality

The project is deliberately being built in stages rather than attempting
to implement everything at once.

------------------------------------------------------------------------

# Project Goals

## Primary goals

1.  Build a polished music streaming client from scratch.
2.  Support self-hosted music servers.
3.  Avoid coupling the UI directly to Navidrome.
4.  Create a provider abstraction that can support different server
    APIs.
5.  Maintain a clean, responsive desktop and mobile UI.
6.  Provide reliable music playback.
7.  Eventually support native/background playback features.
8.  Build the application incrementally and verify each stage.
9.  Keep the codebase understandable enough that another developer can
    continue development from this README.

## UX goals

The application should feel familiar to users of modern streaming
applications while remaining lightweight and self-hosted friendly.

The player should provide:

-   Clear track information
-   Obvious playback state
-   Simple playback controls
-   Clear shuffle/repeat state
-   Responsive controls
-   Useful hover descriptions
-   A full-width progress slider
-   Room for future lyrics controls
-   Desktop and mobile support

------------------------------------------------------------------------

# Current Technology Stack

  Technology                  Purpose
  --------------------------- -------------------------------------
  React                       UI framework
  TypeScript                  Application language
  Vite                        Development/build tooling
  React Router                Client-side routing
  js-md5                      OpenSubsonic authentication hashing
  Navidrome                   Current music server/backend
  OpenSubsonic/Subsonic API   Current provider API
  CSS                         Application styling
  GitHub                      Source control / repository hosting
  GitHub Desktop              Required Git workflow

### Runtime environment

The development environment currently uses:

-   Node.js
-   npm
-   VS Code
-   GitHub Desktop

------------------------------------------------------------------------

# Current Status

## Overall status

**Core application shell:** Complete

**Provider abstraction:** Complete

**Navidrome connection:** Complete

**Real music library:** Working

**Basic playback:** Working

**Queue playback:** Working

**Shuffle:** Implemented

**Repeat:** Implemented

**Player UI:** Actively being refined

**Search:** Basic provider support exists; UI/features still need
expansion

**Scrobbling:** Implemented at provider level; player integration still
needs refinement

**Lyrics:** Provider support exists; UI/synchronisation remains to be
completed

**Background playback:** Not yet implemented

**Mobile/native playback:** Not yet implemented

**Multiple server connections:** Planned

**Jellyfin provider:** Planned

**Automation/library management:** Future project stage

------------------------------------------------------------------------

# Completed Features

## 1. Initial application setup

-   Vite React TypeScript application created.
-   Project named `MusicApp`.
-   ESLint configured.
-   Git repository created.
-   Repository published to GitHub.
-   `node_modules` excluded from Git.

------------------------------------------------------------------------

## 2. Application navigation

React Router is used for application navigation.

Current application areas include:

-   Home
-   Library
-   Album pages
-   Search
-   Settings

Desktop navigation and mobile navigation are supported.

The player remains available while navigating between pages.

------------------------------------------------------------------------

## 3. Music provider architecture

The application does not directly depend on Navidrome throughout the UI.

Instead, the application uses a `MusicProvider` interface.

This is important because the long-term goal is to support several
different music server implementations.

Current provider-related structure:

``` text
src/providers/
├── MusicProviderContext.tsx
├── MusicProviderProvider.tsx
├── useMusicProviders.ts
├── MockMusicProvider.ts
├── navidrome/
│   ├── OpenSubsonicClient.ts
│   └── NavidromeProvider.ts
└── types/
    ├── MusicTypes.ts
    ├── ServerConnection.ts
    ├── MusicProvider.ts
    └── MusicProviderError.ts
```

------------------------------------------------------------------------

## 4. Provider data model

Common application-level types have been created for:

-   Artists
-   Albums
-   Tracks
-   Playlists
-   Lyrics
-   Search results
-   Server connections

The UI works with these common types rather than directly depending on
Navidrome response objects.

This means another provider should map its API responses into these
application types.

------------------------------------------------------------------------

## 5. Navidrome integration

MusicApp currently connects to Navidrome through its
OpenSubsonic-compatible API.

Implemented provider operations include:

-   Connection testing
-   Recently added albums
-   Artists
-   Albums
-   Album details
-   Album tracks
-   Artist tracks
-   Search
-   Lyrics retrieval
-   Streaming
-   Cover art
-   Favourites
-   Ratings
-   Scrobbling
-   Playlists
-   Playlist tracks

The authentication implementation uses the OpenSubsonic token/salt
authentication mechanism.

Passwords are not stored inside the persistent `ServerConnection`
object.

------------------------------------------------------------------------

## 6. Real library browsing

The Library page now retrieves real albums from Navidrome.

Implemented:

-   Album loading
-   Album artwork
-   Album title
-   Artist
-   Year
-   Track count
-   Album navigation

Album links use React Router and URL-encoded album IDs.

------------------------------------------------------------------------

## 7. Album pages

Album pages display:

-   Album artwork
-   Album name
-   Artist
-   Year
-   Track count
-   Track listing
-   Track duration

Individual tracks can be played.

Selecting a track from an album starts playback using the album track
list as the queue.

------------------------------------------------------------------------

# Player System

Music playback is managed independently from individual pages using a
React player provider.

Current structure:

``` text
src/player/
├── PlayerContext.tsx
├── PlayerProvider.tsx
└── usePlayer.ts
```

The player persists while navigating between routes because it lives
above the application routes.

------------------------------------------------------------------------

# Current Player Behaviour

## Playback

Working:

-   Play
-   Pause
-   Select a track
-   Continue playing while navigating between pages
-   Play an album as a queue
-   Next track
-   Previous track
-   Track duration
-   Current playback time
-   Seek

------------------------------------------------------------------------

## Seeking

The progress slider intentionally does **not** continuously seek the
audio while dragging.

Current behaviour:

1.  User presses the slider.
2.  Slider position changes visually.
3.  Audio continues playing from its current position.
4.  User releases the slider.
5.  The player seeks to the released position.

This prevents repeated seeks while dragging.

------------------------------------------------------------------------

## Queue

The player maintains:

-   Queue
-   Current queue index
-   Current track

Album playback creates a queue from the album's tracks.

Queue behaviour is being expanded as the player evolves.

------------------------------------------------------------------------

## Shuffle

Shuffle is implemented.

Current behaviour:

-   Shuffle OFF
-   Shuffle ON

When shuffle is active and a track ends, the next track is selected from
another available queue position.

The currently playing track is excluded from the random selection.

------------------------------------------------------------------------

## Repeat

Three repeat modes exist:

``` text
OFF
ALL
ONE
```

The cycle is:

``` text
OFF
 ↓
ALL
 ↓
ONE
 ↓
OFF
```

Current intended visual language:

  State                 Colour
  --------------------- --------------
  Repeat Off            Dark/neutral
  Repeat All            Purple
  Repeat One            Blue
  Shuffle On            Purple
  Playing/Pause state   Purple
  Play button           White

Repeat All and Repeat One deliberately have different colours so the
current mode is obvious.

------------------------------------------------------------------------

## Player controls

The player uses SVG icons rather than emoji/unicode playback symbols.

Controls:

-   Shuffle
-   Previous
-   Play/Pause
-   Next
-   Repeat

The play/pause control is larger than the surrounding controls.

------------------------------------------------------------------------

## Player tooltips

Custom tooltips are being used instead of browser-native `title`
tooltips.

Current intended tooltip text:

``` text
Shuffle: Off
Shuffle: On

Previous

Play
Pause

Next

Repeat: Off
Repeat: All
Repeat: One
```

Tooltips are:

-   Small
-   Dark
-   Slightly transparent
-   White text
-   Positioned above the control
-   Delayed slightly before appearing
-   Non-interactive
-   Designed to remain readable over the player

------------------------------------------------------------------------

## Player layout

The current player is designed as two rows.

### Top row

The progress row contains:

``` text
current time → progress slider → total duration
```

### Bottom row

The information/control row contains:

``` text
track information                         player controls
track artist
```

The track name starts at the same horizontal position as the **actual
slider**, not the current-time label.

The final Repeat button ends at the same horizontal position as the
**end of the actual slider**, before the total-duration label.

Conceptually:

``` text
0:42  ───────────────────────────────────────────  3:44
      ↑                                          ↑
      Track Name / Artist              [controls]
```

This layout was chosen so the track name remains visible without
competing directly with the five player controls.

------------------------------------------------------------------------

# Provider Architecture

The central provider interface currently resembles:

``` ts
export interface MusicProvider {
  readonly connection: ServerConnection

  testConnection(): Promise<void>

  getRecentlyAddedAlbums(limit?: number): Promise<MusicAlbum[]>
  getRecentlyPlayedTracks(limit?: number): Promise<MusicTrack[]>

  getArtists(): Promise<MusicArtist[]>

  getAlbums(
    limit?: number,
    offset?: number,
  ): Promise<MusicAlbum[]>

  getAlbum(
    albumId: string,
  ): Promise<MusicAlbum | null>

  getAlbumTracks(
    albumId: string,
  ): Promise<MusicTrack[]>

  getArtistTracks(
    artistId: string,
  ): Promise<MusicTrack[]>

  search(
    query: string,
  ): Promise<MusicSearchResults>

  getLyrics(
    trackId: string,
  ): Promise<MusicLyrics | null>

  getStreamUrl(
    trackId: string,
  ): Promise<string>

  getCoverArtUrl(
    coverArtId: string,
    size?: number,
  ): Promise<string>

  setFavourite(
    trackId: string,
    favourite: boolean,
  ): Promise<void>

  setRating(
    trackId: string,
    rating: number | null,
  ): Promise<void>

  scrobble(
    trackId: string,
    submission?: boolean,
  ): Promise<void>

  getPlaylists(): Promise<MusicPlaylist[]>

  getPlaylistTracks(
    playlistId: string,
  ): Promise<MusicTrack[]>
}
```

The exact implementation should always be treated as authoritative in
the source files; this README describes the architecture and intent
rather than replacing the interfaces.

------------------------------------------------------------------------

# Navidrome Integration

## Current API approach

MusicApp uses the OpenSubsonic-compatible REST API.

The client handles:

-   Authentication
-   HTTP errors
-   API errors
-   Authentication failures
-   Not-found errors
-   Unsupported-operation errors
-   Invalid responses
-   Network failures

The OpenSubsonic client is responsible for building authenticated URLs
and API requests.

------------------------------------------------------------------------

# Application Structure

Current high-level structure:

``` text
MusicApp/
├── public/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   └── player/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Library/
│   │   ├── Search/
│   │   ├── Settings/
│   │   └── Album/
│   │
│   ├── player/
│   │   ├── PlayerContext.tsx
│   │   ├── PlayerProvider.tsx
│   │   └── usePlayer.ts
│   │
│   ├── providers/
│   │   ├── MusicProviderContext.tsx
│   │   ├── MusicProviderProvider.tsx
│   │   ├── useMusicProviders.ts
│   │   ├── MockMusicProvider.ts
│   │   ├── navidrome/
│   │   │   ├── OpenSubsonicClient.ts
│   │   │   └── NavidromeProvider.ts
│   │   └── types/
│   │       ├── MusicTypes.ts
│   │       ├── ServerConnection.ts
│   │       ├── MusicProvider.ts
│   │       └── MusicProviderError.ts
│   │
│   ├── services/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The structure may evolve as the application grows.

------------------------------------------------------------------------

# Current Routes

The application currently has these major routes:

  Route                       Purpose
  --------------------------- ----------------------------
  `/`                         Home
  `/library`                  Music library
  `/library/album/:albumId`   Album page
  `/search`                   Search
  `/settings`                 Server connection/settings

------------------------------------------------------------------------

# Getting Started

## Requirements

Install:

-   Node.js
-   npm
-   VS Code
-   GitHub Desktop

A current supported Node.js installation should be used.

------------------------------------------------------------------------

## Install dependencies

From the MusicApp project directory:

``` powershell
npm install
```

------------------------------------------------------------------------

## Start development server

``` powershell
npm run dev
```

Vite will display the local development URL.

Open that URL in a browser.

------------------------------------------------------------------------

## Build the application

``` powershell
npm run build
```

------------------------------------------------------------------------

## Run linting

``` powershell
npm run lint
```

------------------------------------------------------------------------

# Development Workflow

Development is intentionally incremental.

The preferred process is:

``` text
1. Choose one feature
        ↓
2. Understand the architecture affected
        ↓
3. Implement the smallest complete change
        ↓
4. Run the application
        ↓
5. Test the feature manually
        ↓
6. Fix issues
        ↓
7. Verify again
        ↓
8. Commit through GitHub Desktop
        ↓
9. Move to the next feature
```

Large unrelated changes should not be bundled into one checkpoint.

------------------------------------------------------------------------

# Git Workflow

## Important

**Git operations for this project must be performed through GitHub
Desktop.**

Do not use Git commands from the VS Code terminal for normal project Git
operations.

Examples of Git operations that should use GitHub Desktop:

-   Commit
-   Push
-   Pull
-   Branch creation
-   Branch switching
-   Merge
-   Reviewing changes

The VS Code terminal can still be used for normal development commands
such as:

``` powershell
npm install
npm run dev
npm run build
npm run lint
```

------------------------------------------------------------------------

# Design Principles

## 1. Provider independence

The UI should not directly depend on Navidrome-specific response
structures.

Instead:

``` text
Server API
    ↓
Provider implementation
    ↓
MusicProvider interface
    ↓
Application
    ↓
UI
```

This makes future Jellyfin support much easier.

------------------------------------------------------------------------

## 2. Keep server-specific logic isolated

Navidrome/OpenSubsonic-specific behaviour belongs under:

``` text
src/providers/navidrome/
```

It should not leak throughout the UI.

------------------------------------------------------------------------

## 3. Keep playback independent of pages

Playback belongs in:

``` text
src/player/
```

rather than individual pages.

This allows:

-   Navigation without stopping playback
-   Global player controls
-   Future expanded player
-   Background playback integration
-   Media Session integration

------------------------------------------------------------------------

## 4. IDs remain strings

Music-server IDs should be treated as strings.

Do not assume that server IDs are numeric.

This is particularly important for Navidrome/OpenSubsonic compatibility.

------------------------------------------------------------------------

## 5. Build before expanding

A feature should be working and verified before depending on it for a
later feature.

For example:

``` text
Playback
   ↓
Queue
   ↓
Shuffle / Repeat
   ↓
Scrobbling
   ↓
Expanded player
   ↓
Background playback
```

------------------------------------------------------------------------

# Known Limitations

## Connection persistence

The current server connection is held in React memory.

A full browser refresh currently loses the active provider connection.

Persistent server profiles are planned.

------------------------------------------------------------------------

## Recently played

The current provider implementation has a `getRecentlyPlayedTracks()`
interface, but the Navidrome implementation has previously used
`getNowPlaying`.

This should be corrected before building a proper Recently Played
section.

------------------------------------------------------------------------

## Native/background playback

The current browser player provides normal web playback but does not yet
provide the full native playback experience.

Not yet implemented:

-   Media Session API integration
-   Lock-screen controls
-   Android notification controls
-   Background audio architecture for native builds
-   Android Auto
-   Apple CarPlay

------------------------------------------------------------------------

## Lyrics

The provider layer already has lyrics support.

The user-facing lyrics experience is not yet complete.

Future work includes:

-   Lyrics panel
-   Synced lyrics display
-   Current-line highlighting
-   Timing synchronisation
-   Lyrics loading/error states

------------------------------------------------------------------------

## Multiple servers

The architecture supports the concept of server connections, but the
complete multiple-server UX is not yet implemented.

Future functionality should include:

-   Saved server profiles
-   Multiple active connections
-   Provider switching
-   Server-specific authentication
-   Server selection
-   Possibly combined libraries

------------------------------------------------------------------------

# Remaining Roadmap

The roadmap is intentionally ordered around the current architecture.

## Phase 1 --- Player foundation

### Completed

-   [x] Basic playback
-   [x] Play/pause
-   [x] Previous
-   [x] Next
-   [x] Queue playback
-   [x] Track progress
-   [x] Seeking
-   [x] Shuffle
-   [x] Repeat Off
-   [x] Repeat All
-   [x] Repeat One
-   [x] SVG player icons
-   [x] Player state colours
-   [x] Player tooltips
-   [x] Two-row mini-player layout
-   [x] Progress bar alignment

### Remaining

-   [ ] Dedicated queue panel
-   [ ] Queue reordering
-   [ ] Remove queue items
-   [ ] Clear queue
-   [ ] Better previous-track behaviour
-   [ ] More robust end-of-queue behaviour

------------------------------------------------------------------------

# Phase 2 --- Scrobbling

Implement proper playback tracking.

Goals:

-   [ ] Determine when a track counts as played
-   [ ] Submit scrobble
-   [ ] Avoid duplicate submissions
-   [ ] Handle seeking correctly
-   [ ] Handle pause/resume correctly
-   [ ] Handle track changes
-   [ ] Handle application navigation
-   [ ] Handle playback errors

------------------------------------------------------------------------

# Phase 3 --- Expanded player

Build a full player view.

Potential layout:

``` text
┌──────────────────────────────────────────┐
│                                          │
│              Album Artwork               │
│                                          │
│             Track Name                   │
│             Artist                       │
│                                          │
│  ───────────────●──────────────────────  │
│                                          │
│          Shuffle  Prev  Play  Next       │
│                 Repeat                   │
│                                          │
│              Lyrics                      │
│                                          │
└──────────────────────────────────────────┘
```

Tasks:

-   [ ] Expanded player page/view
-   [ ] Large album artwork
-   [ ] Full playback controls
-   [ ] Full progress control
-   [ ] Queue access
-   [ ] Lyrics access
-   [ ] Favourite control
-   [ ] Rating control

------------------------------------------------------------------------

# Phase 4 --- Search

Expand the existing provider search functionality into a complete UI.

Tasks:

-   [ ] Search input
-   [ ] Debounced searching
-   [ ] Artist results
-   [ ] Album results
-   [ ] Track results
-   [ ] Result artwork
-   [ ] Result navigation
-   [ ] Play from search results
-   [ ] Search loading state
-   [ ] Search error state
-   [ ] Empty search state

------------------------------------------------------------------------

# Phase 5 --- Favourites and ratings

Implement:

-   [ ] Favourite tracks
-   [ ] Unfavourite tracks
-   [ ] Favourite albums where supported
-   [ ] Rating UI
-   [ ] Clear rating
-   [ ] Favourite library
-   [ ] Rating persistence

------------------------------------------------------------------------

# Phase 6 --- Playlists

Implement:

-   [ ] Playlist listing
-   [ ] Playlist pages
-   [ ] Playlist track playback
-   [ ] Queue playlist
-   [ ] Favourite playlist
-   [ ] Playlist editing where provider supports it
-   [ ] Create playlist where provider supports it

------------------------------------------------------------------------

# Phase 7 --- Lyrics

Provider support already exists.

Remaining:

-   [ ] Lyrics page/panel
-   [ ] Unsynchronised lyrics
-   [ ] Synced lyrics
-   [ ] Current-line highlighting
-   [ ] Automatic scrolling
-   [ ] Timing offset support
-   [ ] Lyrics fallback behaviour
-   [ ] Mobile lyrics UI

------------------------------------------------------------------------

# Phase 8 --- Media Session and native playback

This is a major architectural stage.

Implement:

-   [ ] Media Session API
-   [ ] Play action
-   [ ] Pause action
-   [ ] Previous action
-   [ ] Next action
-   [ ] Seek action
-   [ ] Track metadata
-   [ ] Artwork metadata
-   [ ] Lock-screen integration
-   [ ] Browser notification controls

Then investigate the appropriate cross-platform native playback
architecture for Android/iOS.

------------------------------------------------------------------------

# Phase 9 --- Mobile applications

Target:

-   Android
-   iOS
-   Web

Requirements:

-   [ ] Mobile-compatible player
-   [ ] Background playback
-   [ ] Lock-screen controls
-   [ ] Notification controls
-   [ ] Mobile navigation
-   [ ] Touch-friendly controls
-   [ ] Android Auto
-   [ ] Apple CarPlay
-   [ ] Platform-specific playback handling

The native architecture should be selected when this phase begins rather
than prematurely adding packages that may conflict with the current web
application.

------------------------------------------------------------------------

# Phase 10 --- Multiple music servers

Implement saved server connections.

Potential provider list:

``` text
MusicApp
├── Navidrome
├── Jellyfin
└── Future providers
```

Tasks:

-   [ ] Saved server profiles
-   [ ] Add server
-   [ ] Edit server
-   [ ] Remove server
-   [ ] Connect/disconnect
-   [ ] Provider detection where possible
-   [ ] Server switching
-   [ ] Persistent connection profiles
-   [ ] Provider-specific capability handling

------------------------------------------------------------------------

# Phase 11 --- Jellyfin provider

Create:

``` text
src/providers/jellyfin/
```

Implement Jellyfin against the same `MusicProvider` interface.

Potential implementation:

``` text
Jellyfin API
    ↓
JellyfinProvider
    ↓
MusicProvider
    ↓
MusicApp UI
```

Tasks:

-   [ ] Authentication
-   [ ] Connection testing
-   [ ] Artists
-   [ ] Albums
-   [ ] Tracks
-   [ ] Search
-   [ ] Streaming
-   [ ] Artwork
-   [ ] Playlists
-   [ ] Favourites
-   [ ] Ratings
-   [ ] Scrobbling equivalent
-   [ ] Lyrics where available

Provider capabilities may differ, so unsupported operations should be
handled gracefully.

------------------------------------------------------------------------

# Phase 12 --- Advanced library management / automation

This is a much later feature.

Potential future system inspired by music automation tools:

-   [ ] Artist monitoring
-   [ ] Album monitoring
-   [ ] Automatic acquisition
-   [ ] Download management
-   [ ] File organisation
-   [ ] Metadata handling
-   [ ] Album artwork management
-   [ ] Library rescanning
-   [ ] Integration with download clients
-   [ ] Automated sorting

This should remain separate from the core playback architecture.

------------------------------------------------------------------------

# Future Architecture

The intended long-term architecture is:

``` text
                         ┌─────────────────────┐
                         │      MusicApp       │
                         │         UI          │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   MusicProvider     │
                         │      Interface      │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
      ┌───────▼───────┐     ┌───────▼───────┐     ┌──────▼──────┐
      │   Navidrome   │     │    Jellyfin   │     │   Future    │
      │    Provider   │     │    Provider   │     │  Providers  │
      └───────┬───────┘     └───────┬───────┘     └──────┬──────┘
              │                     │                     │
        OpenSubsonic             Jellyfin API          API
```

The UI should not need to know which provider is being used.

------------------------------------------------------------------------

# Important Development Rules

## Do not bypass the provider interface

Do not add Navidrome-specific API calls directly into UI components.

Bad:

``` text
Album.tsx → fetch Navidrome endpoint
```

Preferred:

``` text
Album.tsx
   ↓
MusicProvider
   ↓
NavidromeProvider
   ↓
OpenSubsonicClient
```

------------------------------------------------------------------------

## Do not store passwords in ServerConnection

`ServerConnection` represents connection metadata.

Authentication secrets should remain in the appropriate
connection/provider mechanism and should not be exposed unnecessarily.

------------------------------------------------------------------------

## Keep IDs as strings

Do not convert provider IDs to numbers.

Use:

``` ts
albumId: string
trackId: string
artistId: string
```

------------------------------------------------------------------------

## Avoid premature native dependencies

The application is currently a Vite/React web application.

When native mobile playback becomes the next major stage, evaluate the
appropriate architecture at that time.

Do not add mobile playback packages simply because they may be needed
eventually.

------------------------------------------------------------------------

## Test before checkpointing

Each major feature should be tested before committing.

A checkpoint should represent a known-working state.

------------------------------------------------------------------------

# Checkpoint History

The project has been developed through incremental GitHub checkpoints.

Known checkpoints include:

### `Add application navigation`

Established:

-   Application shell
-   Navigation
-   Initial routes

------------------------------------------------------------------------

### `Add music provider architecture`

Established:

-   Provider interface
-   Provider context
-   Server connection model
-   Common music types
-   Mock provider
-   Navidrome provider foundation

------------------------------------------------------------------------

### `Connect MusicApp to Navidrome library`

Established:

-   Navidrome connection
-   OpenSubsonic client
-   Real library data
-   Albums
-   Album pages
-   Artwork
-   Track information

------------------------------------------------------------------------

### `Add working music playback`

Established:

-   Working audio playback
-   Global player
-   Play/pause
-   Track selection
-   Playback persistence across route navigation

------------------------------------------------------------------------

# Current Development Focus

The current development focus is the **mini-player and playback
experience**.

The current player should provide:

``` text
┌──────────────────────────────────────────────────────────────┐
│ 0:42 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3:44   │
│                                                              │
│      Track Name / Artist                 🔀 ◀ ▶ ▶ 🔁        │
└──────────────────────────────────────────────────────────────┘
```

With:

-   SVG icons
-   White icons
-   White Play state
-   Purple Pause state
-   Purple Shuffle state
-   Blue Repeat All state
-   Purple Repeat One state
-   Dark inactive controls
-   Custom hover tooltips
-   Seek-on-release behaviour
-   Persistent playback during navigation

The next major functional feature after the player UI is expected to be
**queue management**, followed by stronger scrobbling and the expanded
player experience.

------------------------------------------------------------------------

# Definition of Done

A feature should generally be considered complete when:

-   It is implemented.
-   It compiles.
-   The application runs.
-   The intended user behaviour works.
-   Errors are handled reasonably.
-   Desktop behaviour has been tested.
-   Mobile/responsive behaviour has been considered.
-   Existing playback behaviour has not been broken.
-   The change is committed through GitHub Desktop.

------------------------------------------------------------------------

# Project Philosophy

MusicApp should remain:

**Modular**

Provider-specific code stays isolated.

**Understandable**

A future developer should be able to follow the architecture without
reverse-engineering the entire project.

**Incremental**

Features are built and verified individually.

**Self-hosting friendly**

The application should work well with personally hosted music servers.

**Extensible**

Adding a new music server should mean implementing a provider rather
than rewriting the UI.

**User-focused**

The player and library should remain simple, clear, responsive, and
pleasant to use.

------------------------------------------------------------------------

## Current Bottom Line

MusicApp has progressed beyond the initial prototype stage.

The application can currently:

1.  Connect to a real Navidrome server.
2.  Retrieve a real music library.
3.  Browse albums.
4.  Browse album tracks.
5.  Play real music.
6.  Maintain playback while navigating.
7.  Build playback queues.
8.  Skip tracks.
9.  Seek through tracks.
10. Shuffle queues.
11. Repeat the queue or current track.
12. Display playback state visually.
13. Provide a responsive mini-player.
14. Use provider abstractions rather than hard-coding the UI to
    Navidrome.

The major work remaining is turning the functional player into a
complete streaming-client experience through queue management,
scrobbling, search, favourites, playlists, lyrics, expanded playback,
background/native playback, multiple providers, and eventually mobile
applications.
