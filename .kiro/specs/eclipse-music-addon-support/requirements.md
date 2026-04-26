# Requirements Document

## Introduction

This document defines the requirements for extending Lumina Reader with Eclipse Music addon support and Apple Music metadata enrichment. The feature will add a new "Music" section to the existing Lumina Reader application, enabling users to discover, stream, and manage music content through Eclipse-compatible music addons while maintaining all existing book and manga functionality.

The Eclipse Music addon system follows the same architectural principles as the existing book/manga addons but provides music-specific endpoints and data structures. Apple Music integration will enhance the music experience with high-quality metadata, artwork, and lyrics when available.

## Glossary

- **Eclipse_Music_Addon**: An external music provider that implements the Eclipse Music API protocol
- **Music_Player**: The component that handles audio playback with standard controls
- **Apple_Music_Service**: The component that enriches music metadata using Apple's MusicKit API
- **Track**: A single audio file with metadata (title, artist, album, duration)
- **Album**: A collection of tracks with shared metadata and artwork
- **Artist**: A music creator with associated tracks, albums, and biographical information
- **Playlist**: A user-curated or provider-curated collection of tracks
- **Stream_Response**: The API response containing a playable audio URL and format information
- **ISRC**: International Standard Recording Code used for track identification
- **Music_Library**: The user's collection of favorited music content
- **Audio_Format**: The encoding format of audio files (MP3, FLAC, AAC, etc.)
- **Content_Type**: The type of music content (music, audiobook, podcast)

## Requirements

### Requirement 1: Music Addon Management

**User Story:** As a user, I want to add and manage Eclipse Music addons, so that I can access music content from multiple providers.

#### Acceptance Criteria

1. WHEN a user adds a music addon URL, THE Addon_Manager SHALL fetch the manifest from `{baseURL}/manifest.json`
2. WHEN the manifest has contentType "music", THE Addon_Manager SHALL validate it supports music-specific resources
3. THE Addon_Manager SHALL validate that music addons support required resources: ["search", "stream"]
4. THE Addon_Manager SHALL validate that music addons support required types: ["track", "album", "artist", "playlist"]
5. WHERE music addons provide optional resources, THE Addon_Manager SHALL support: ["album", "artist", "playlist"] endpoints
6. WHEN a music addon is successfully added, THE Addon_Manager SHALL store it with existing book/manga addons
7. THE Addon_Manager SHALL display music addons with a music note icon to distinguish from book/manga addons
8. WHEN a user removes a music addon, THE Addon_Manager SHALL remove it from storage and update the UI

### Requirement 2: Music Content Search

**User Story:** As a user, I want to search for music across all connected music addons, so that I can discover tracks, albums, artists, and playlists.

#### Acceptance Criteria

1. WHEN a user enters a search query in the music section, THE Search_Engine SHALL query all music addons in parallel
2. FOR ALL music addons, THE Search_Engine SHALL call `{baseURL}/search?q={encodedQuery}`
3. WHEN search responses are received, THE Search_Engine SHALL aggregate results by category (tracks, albums, artists, playlists)
4. THE Search_Engine SHALL display track results with title, artist, album, duration, and artwork
5. THE Search_Engine SHALL display album results with title, artist, track count, and cover art
6. THE Search_Engine SHALL display artist results with name, top tracks preview, and artist image
7. THE Search_Engine SHALL display playlist results with title, creator, track count, and cover image
8. WHEN a track has an ISRC code, THE Search_Engine SHALL store it for metadata enrichment
9. THE Search_Engine SHALL filter results to only show music addons when in the music section
10. WHEN search results contain multiple content types, THE Search_Engine SHALL separate them into appropriate tabs

### Requirement 3: Music Player Implementation

**User Story:** As a user, I want a music player with standard controls, so that I can play, pause, and control music playback.

#### Acceptance Criteria

1. WHEN a user clicks on a track, THE Music_Player SHALL fetch the stream URL from `{baseURL}/stream/{trackId}`
2. WHEN the stream response is received, THE Music_Player SHALL load the audio URL into an HTML5 audio element
3. THE Music_Player SHALL display standard controls: play/pause, previous/next, volume, and progress bar
4. WHEN a user clicks play, THE Music_Player SHALL start audio playback and update the play button to pause
5. WHEN a user clicks pause, THE Music_Player SHALL pause audio playback and update the pause button to play
6. WHEN a user drags the progress bar, THE Music_Player SHALL seek to the corresponding time position
7. WHEN a user adjusts the volume slider, THE Music_Player SHALL update the audio volume immediately
8. THE Music_Player SHALL display current time and total duration during playback
9. WHEN a track ends, THE Music_Player SHALL automatically play the next track in queue if available
10. THE Music_Player SHALL persist volume settings across browser sessions

### Requirement 4: Audio Format Support

**User Story:** As a user, I want support for multiple audio formats, so that I can play content from different sources.

#### Acceptance Criteria

1. THE Music_Player SHALL support MP3 format audio playback
2. THE Music_Player SHALL support AAC format audio playback
3. THE Music_Player SHALL support FLAC format audio playback where browser supports it
4. THE Music_Player SHALL support OGG format audio playback where browser supports it
5. WHEN an unsupported format is encountered, THE Music_Player SHALL display an error message
6. THE Music_Player SHALL display the audio format and quality information when available
7. THE Music_Player SHALL gracefully handle format detection failures
8. WHEN multiple formats are available, THE Music_Player SHALL prefer higher quality formats

### Requirement 5: Content Type Classification

**User Story:** As a user, I want different UI treatments for music, audiobooks, and podcasts, so that I can easily distinguish content types.

#### Acceptance Criteria

1. WHEN content has contentType "music", THE Music_Player SHALL display standard music player controls
2. WHEN content has contentType "audiobook", THE Music_Player SHALL display chapter navigation and bookmark features
3. WHEN content has contentType "podcast", THE Music_Player SHALL display episode information and subscription options
4. THE Music_Player SHALL use appropriate icons for each content type (music note, book, microphone)
5. THE Music_Player SHALL adapt the UI layout based on content type requirements
6. WHEN content type is not specified, THE Music_Player SHALL default to "music" behavior
7. THE Music_Player SHALL display content type badges in search results and library views

### Requirement 6: Apple Music Metadata Enrichment

**User Story:** As a user, I want enhanced metadata from Apple Music, so that I have high-quality artwork, lyrics, and genre information.

#### Acceptance Criteria

1. WHEN a track has an ISRC code, THE Apple_Music_Service SHALL query Apple Music API for enrichment
2. WHEN Apple Music returns results, THE Apple_Music_Service SHALL extract high-resolution artwork URLs
3. THE Apple_Music_Service SHALL extract genre tags, release date, and explicit content flags
4. WHERE available, THE Apple_Music_Service SHALL fetch lyrics from Apple Music
5. THE Apple_Music_Service SHALL merge enriched metadata with addon-provided metadata
6. WHEN Apple Music enrichment fails, THE Apple_Music_Service SHALL continue with addon metadata
7. THE Apple_Music_Service SHALL cache enrichment results to avoid redundant API calls
8. THE Apple_Music_Service SHALL prioritize Apple Music artwork over addon artwork when available

### Requirement 7: Music Library Management

**User Story:** As a user, I want to manage my music favorites and history, so that I can organize my music collection.

#### Acceptance Criteria

1. WHEN a user favorites a track, THE Music_Library SHALL add it to the favorites collection
2. WHEN a user favorites an album, THE Music_Library SHALL add the entire album to favorites
3. WHEN a user favorites an artist, THE Music_Library SHALL add the artist to favorites for easy access
4. WHEN a user favorites a playlist, THE Music_Library SHALL add the playlist to favorites
5. THE Music_Library SHALL track listening history with timestamp and play count
6. THE Music_Library SHALL display recently played tracks in reverse chronological order
7. THE Music_Library SHALL provide filtering options by content type (tracks, albums, artists, playlists)
8. THE Music_Library SHALL integrate with existing favorites system while maintaining separation from books/manga

### Requirement 8: Album and Artist Detail Pages

**User Story:** As a user, I want detailed views for albums and artists, so that I can explore related content.

#### Acceptance Criteria

1. WHEN a user clicks on an album, THE Lumina_Reader SHALL fetch album details from `{baseURL}/album/{albumId}`
2. THE Lumina_Reader SHALL display album artwork, title, artist, release date, and track listing
3. WHEN a user clicks on an artist, THE Lumina_Reader SHALL fetch artist details from `{baseURL}/artist/{artistId}`
4. THE Lumina_Reader SHALL display artist image, biography, top tracks, and discography
5. THE Lumina_Reader SHALL allow users to play individual tracks from album and artist pages
6. THE Lumina_Reader SHALL provide "Play All" functionality for albums and artist top tracks
7. THE Lumina_Reader SHALL show related albums and artists when available
8. WHEN detail endpoints are not available, THE Lumina_Reader SHALL display basic information from search results

### Requirement 9: Playlist Management

**User Story:** As a user, I want to browse and play playlists, so that I can enjoy curated music collections.

#### Acceptance Criteria

1. WHEN a user clicks on a playlist, THE Lumina_Reader SHALL fetch playlist details from `{baseURL}/playlist/{playlistId}`
2. THE Lumina_Reader SHALL display playlist cover, title, creator, description, and track listing
3. THE Lumina_Reader SHALL show total duration and track count for playlists
4. THE Lumina_Reader SHALL allow users to play individual tracks from playlists
5. THE Lumina_Reader SHALL provide "Shuffle Play" functionality for playlists
6. THE Lumina_Reader SHALL display track numbers and allow reordering where supported
7. WHEN playlist endpoints are not available, THE Lumina_Reader SHALL display basic playlist information
8. THE Lumina_Reader SHALL handle both user-created and curated playlists appropriately

### Requirement 10: Music Navigation Integration

**User Story:** As a user, I want seamless navigation between music, books, and manga, so that I can access all content types easily.

#### Acceptance Criteria

1. THE Lumina_Reader SHALL add a "Music" tab to the main navigation alongside existing tabs
2. THE Lumina_Reader SHALL maintain separate search contexts for music, books, and manga
3. WHEN in the music section, THE Lumina_Reader SHALL only display music addons and results
4. THE Lumina_Reader SHALL preserve the current playback state when navigating between sections
5. THE Lumina_Reader SHALL display a mini-player in the navigation bar when music is playing
6. THE Lumina_Reader SHALL allow users to control playback from any section of the app
7. THE Lumina_Reader SHALL maintain separate history and favorites for music content
8. THE Lumina_Reader SHALL use consistent design patterns across all content types

### Requirement 11: Audio Streaming and Buffering

**User Story:** As a user, I want reliable audio streaming with proper buffering, so that I can enjoy uninterrupted playback.

#### Acceptance Criteria

1. WHEN audio is loading, THE Music_Player SHALL display a loading indicator
2. THE Music_Player SHALL implement progressive buffering for smooth playback
3. WHEN network conditions are poor, THE Music_Player SHALL adjust buffering strategy
4. THE Music_Player SHALL handle stream interruptions gracefully with retry logic
5. WHEN a stream fails to load, THE Music_Player SHALL display an error message with retry option
6. THE Music_Player SHALL preload the next track in queue for seamless transitions
7. THE Music_Player SHALL display buffering progress when available
8. THE Music_Player SHALL handle different streaming protocols (HTTP, HLS) as needed

### Requirement 12: Music Player State Management

**User Story:** As a user, I want my music player state to persist across sessions, so that I can resume where I left off.

#### Acceptance Criteria

1. THE Music_Player SHALL persist current track, position, and queue across browser sessions
2. THE Music_Player SHALL restore playback state when the application loads
3. THE Music_Player SHALL save volume and repeat/shuffle settings persistently
4. WHEN a user closes the browser, THE Music_Player SHALL save the current playback position
5. WHEN a user returns, THE Music_Player SHALL offer to resume from the saved position
6. THE Music_Player SHALL handle cases where saved tracks are no longer available
7. THE Music_Player SHALL clear invalid state data automatically
8. THE Music_Player SHALL integrate with existing Zustand store for state management

### Requirement 13: Music Search Filtering and Sorting

**User Story:** As a user, I want to filter and sort music search results, so that I can find content more efficiently.

#### Acceptance Criteria

1. THE Search_Engine SHALL provide filter options for content type (tracks, albums, artists, playlists)
2. THE Search_Engine SHALL provide sorting options (relevance, date, popularity, alphabetical)
3. WHEN filters are applied, THE Search_Engine SHALL update results immediately
4. THE Search_Engine SHALL persist filter preferences across search sessions
5. THE Search_Engine SHALL display result counts for each filter category
6. THE Search_Engine SHALL allow combining multiple filters simultaneously
7. THE Search_Engine SHALL provide a "Clear Filters" option to reset all filters
8. THE Search_Engine SHALL handle cases where filtered results are empty

### Requirement 14: Music Addon Protocol Compliance

**User Story:** As an addon developer, I want clear music protocol requirements, so that I can create compatible music addons.

#### Acceptance Criteria

1. THE Addon_Manager SHALL require music addons to have contentType "music"
2. THE Addon_Manager SHALL validate that music addons implement required endpoints: search, stream
3. THE Addon_Manager SHALL support optional endpoints: album, artist, playlist
4. WHEN calling `/stream/{id}`, THE Addon_Manager SHALL expect response with url, format, and quality fields
5. THE Addon_Manager SHALL validate stream responses contain valid audio URLs
6. THE Addon_Manager SHALL handle different response formats for different content types
7. THE Addon_Manager SHALL validate ISRC codes when provided for metadata enrichment
8. IF a music addon returns invalid data, THEN THE Addon_Manager SHALL skip that result without crashing

### Requirement 15: Performance Optimization for Music

**User Story:** As a user, I want efficient music streaming and responsive UI, so that I have a smooth listening experience.

#### Acceptance Criteria

1. THE Music_Player SHALL implement audio preloading for queue management
2. THE Music_Player SHALL cache frequently accessed metadata and artwork
3. THE Search_Engine SHALL debounce music search queries by 300 milliseconds
4. THE Apple_Music_Service SHALL implement request throttling to respect API limits
5. THE Music_Player SHALL use Web Audio API for advanced audio processing when available
6. THE Lumina_Reader SHALL lazy load album artwork and large images
7. THE Music_Player SHALL optimize memory usage by cleaning up unused audio elements
8. THE Lumina_Reader SHALL implement virtual scrolling for large music libraries

### Requirement 16: Accessibility for Music Features

**User Story:** As a user with accessibility needs, I want music features to be fully accessible, so that I can enjoy music content independently.

#### Acceptance Criteria

1. THE Music_Player SHALL provide keyboard shortcuts for play/pause (spacebar), skip (arrow keys)
2. THE Music_Player SHALL announce track changes to screen readers
3. THE Music_Player SHALL provide ARIA labels for all player controls
4. THE Music_Player SHALL ensure volume and progress controls are keyboard accessible
5. THE Music_Player SHALL provide high contrast mode support for player controls
6. THE Music_Player SHALL announce playback time updates to screen readers periodically
7. THE Lumina_Reader SHALL provide alternative text for album artwork and artist images
8. THE Music_Player SHALL support reduced motion preferences for animations

### Requirement 17: Error Handling and Resilience

**User Story:** As a user, I want clear error messages and recovery options, so that I can resolve issues quickly.

#### Acceptance Criteria

1. WHEN a music addon is unreachable, THE Lumina_Reader SHALL display a connection error message
2. WHEN audio streaming fails, THE Music_Player SHALL provide retry and skip options
3. WHEN Apple Music API is unavailable, THE Apple_Music_Service SHALL continue with basic metadata
4. WHEN invalid audio formats are encountered, THE Music_Player SHALL display format error details
5. THE Lumina_Reader SHALL log detailed error information for debugging music issues
6. WHEN network connectivity is lost, THE Music_Player SHALL pause and display connection status
7. THE Lumina_Reader SHALL provide fallback behavior for all music features
8. WHEN errors occur, THE Lumina_Reader SHALL maintain application stability and allow continued use

### Requirement 18: Music Content Parser and Serializer

**User Story:** As a developer, I want robust parsing of music metadata, so that content is displayed correctly across different addon formats.

#### Acceptance Criteria

1. THE Music_Parser SHALL parse track metadata including title, artist, album, duration, and ISRC
2. THE Music_Parser SHALL parse album metadata including title, artist, tracks, and artwork
3. THE Music_Parser SHALL parse artist metadata including name, biography, and discography
4. THE Music_Parser SHALL parse playlist metadata including title, creator, and track listing
5. THE Music_Pretty_Printer SHALL format music objects back into valid JSON structures
6. FOR ALL valid music objects, parsing then printing then parsing SHALL produce equivalent objects (round-trip property)
7. WHEN invalid music data is encountered, THE Music_Parser SHALL return descriptive error messages
8. THE Music_Parser SHALL handle missing optional fields gracefully with default values