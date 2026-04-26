# Lumina Reader

A modern, high-performance web platform for books and manga, supporting external metadata providers and Eclipse-compatible addons.

## Features

- **📚 Multi-Addon Support**: Connect multiple content providers via base URLs.
- **✨ Metadata Enrichment**: Automatically fetches high-quality covers, descriptions, and ratings from Google Books and Open Library.
- **📖 Hybrid Reader**: 
  - **EPUB**: Full-featured e-reader with pagination and settings.
  - **Manga**: Fast image-based reader with vertical and horizontal modes.
- **❤️ Personal Library**: Track reading history and favorite your top picks.
- **🚀 Ultra Fast Search**: Real-time searching across all connected sources.
- **🌓 Modern UI**: Clean, responsive design optimized for both mobile and desktop.

## Addon Protocol

Lumina Reader supports servers that implement the following Eclipse-compatible endpoints:

- `GET /manifest.json`: Addon information and capabilities.
- `GET /search?q={query}`: Search results for books, manga, and more.
- `GET /read/{id}`: Direct access to content (EPUB URL or image list).
- `GET /book/{id}`: Detailed book metadata.
- `GET /manga/{id}`: Detailed manga metadata.

## Setup & Deployment

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Connect Addons**:
   Go to **Settings** in the application and enter your addon server URL.

## Architecture

- `/src/services`: API clients and metadata enrichment logic.
- `/src/store`: Global state management for library and settings using Zustand.
- `/src/app`: Page components and routing.
- `/src/types`: Zod schemas for runtime validation of external data.
