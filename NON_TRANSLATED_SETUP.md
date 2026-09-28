# Non-Translated Content Setup

## Overview

The "Non Translated" section of Katiwatch provides access to movies and TV shows in their **original languages** with authentic content directly from TMDB. All streaming uses **VidSrc.sbs** embed URLs.

## What Was Implemented

### 1. **Direct TMDB API Integration** (`lib/tmdb-api.ts`)
   - All content metadata (titles, descriptions, posters, genres, etc.) comes from **The Movie Database (TMDB) API**
   - Supports:
     - Trending movies and TV shows
     - Popular movies and TV shows
     - Top rated content
     - Genre-specific filtering
     - Anime (Japanese animated series)
     - Search functionality
     - Similar content recommendations

### 2. **VidSrc.sbs Streaming**
   - **Movies**: `https://vidsrc.sbs/embed/movie/{tmdb_id}`
   - **TV Shows**: `https://vidsrc.sbs/embed/tv/{tmdb_id}/{season}/{episode}`
   - All video playback uses VidSrc.sbs embeds
   - No translation - original audio with subtitles

### 3. **Navigation Integration**
   - Added "Non Translated" to the main navbar
   - Accessible from both desktop and mobile menus
   - Highlighted when active

### 4. **Pages Implemented**

#### Main Non-Translated Page (`/non-translated`)
   - Hero banner with featured content
   - Sections for:
     - Trending Now
     - Latest Movies
     - Latest Series
     - Animations
     - Anime
   - Inline video player with VidSrc.sbs embeds

#### Movie Details Page (`/non-translated/movies/[id]`)
   - Full movie details from TMDB
   - VidSrc.sbs movie player
   - Similar movies recommendations
   - Original language content

#### TV Series Details Page (`/non-translated/series/[id]`)
   - Full series details from TMDB
   - Season and episode selector
   - VidSrc.sbs TV player
   - Similar series recommendations
   - Anime detection and labeling

## Environment Setup

### Required Environment Variable

Add the following to your `.env.local` file:

```env
# TMDB API Key
# Get your API key from: https://www.themoviedb.org/settings/api
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key-here
```

### How to Get TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create a free account (if you don't have one)
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy the "API Key (v3 auth)" value
6. Add it to your `.env.local` file

## Key Features

### Content Sources
- **Metadata**: TMDB API (original titles, descriptions, images, ratings)
- **Streaming**: VidSrc.sbs (original audio with subtitles)

### Content Types
- **Movies**: International films in original languages
- **TV Series**: International series in original languages
- **Anime**: Japanese animated series
- **Animations**: Animated movies

### User Experience
- Netflix-style UI
- Inline video player
- Content cards with hover effects
- Responsive design (mobile, tablet, desktop)
- Season/episode navigation for TV shows
- Similar content recommendations

## File Structure

```
lib/
  └── tmdb-api.ts              # TMDB API fetchers and VidSrc.sbs helpers

app/
  ├── components/
  │   └── Header.tsx           # Updated with "Non Translated" nav item
  │
  └── non-translated/
      ├── page.tsx             # Main non-translated landing page
      ├── movies/
      │   └── [id]/
      │       └── page.tsx     # Movie details and player
      └── series/
          └── [id]/
              └── page.tsx     # Series details and player
```

## Content Flow

### Movies
1. User browses movies on `/non-translated`
2. Clicks on a movie card
3. Navigates to `/non-translated/movies/{tmdb_id}`
4. Movie details fetched from TMDB API
5. Video player uses `https://vidsrc.sbs/embed/movie/{tmdb_id}`

### TV Series
1. User browses series on `/non-translated`
2. Clicks on a series card
3. Navigates to `/non-translated/series/{tmdb_id}`
4. Series details fetched from TMDB API
5. User selects season and episode
6. Video player uses `https://vidsrc.sbs/embed/tv/{tmdb_id}/{season}/{episode}`

## Important Notes

### Differences from Translated Content
- **Translated Content** (main pages): Uses Reelplexi API for localized content
- **Non-Translated Content**: Uses TMDB API for original language content

### Streaming Provider
- All non-translated content uses **VidSrc.sbs** for streaming
- VidSrc.sbs provides original audio with subtitle options
- No separate sub/dub selector needed (handled by VidSrc player)

### Authentication
- Content details are publicly viewable
- Video playback requires authentication (controlled by `AuthGuard`)

## Testing

1. Set up TMDB API key in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to the "Non Translated" section from the navbar
4. Browse movies, series, anime
5. Click on content to view details
6. Test video playback with VidSrc.sbs embeds

## Future Enhancements

Potential improvements:
- Advanced search with filters (genre, language, year)
- User watchlist for non-translated content
- Continue watching functionality
- Download options (if needed)
- Anime-specific features (episode tracking, dubbed/subbed preferences)
- Language-based filtering
- Regional content filtering

## Troubleshooting

### No Content Showing
- Check TMDB API key is correctly set
- Check console for API errors
- Verify TMDB API quota hasn't been exceeded

### Video Player Not Loading
- Check VidSrc.sbs service status
- Verify TMDB ID is valid
- Check browser console for iframe errors
- Ensure user is authenticated

### Styling Issues
- Clear browser cache
- Verify Tailwind CSS is compiled
- Check for conflicting CSS classes

## Support

For issues or questions:
1. Check TMDB API documentation: https://developers.themoviedb.org/3
2. Check VidSrc.sbs documentation (if available)
3. Review browser console for error messages
