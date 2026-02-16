# My Movies Website

A modern React movie discovery web application built with TypeScript, Redux, and The Movie Database (TMDb) API. Browse popular movies, search by title, filter by categories, and maintain a personal favorites list.

## Features

- 🎬 **Browse Movies** - Discover popular and airing now movies with pagination
- 🔍 **Search** - Search movies by title
- 🎯 **Filters** - Filter movies by Popular, Airing Now, or My Favorites
- ⭐ **Favorites** - Add/remove movies from your personal favorites (stored locally)
- 🎠 **Carousel** - Featured recommended movies at the top
- 🎨 **Dark Mode** - Modern dark theme with smooth transitions
- ⌨️ **Keyboard Navigation** - Full keyboard support with arrow keys
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🌐 **Grid Layout** - 4 columns on desktop, responsive on smaller screens

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Redux Toolkit + Redux-Saga
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **API**: The Movie Database (TMDb) API
- **Styling**: Vanilla CSS with CSS variables

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- TMDb API Bearer Token (free account required)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-movies-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your TMDb API Bearer Token:
     ```
     VITE_TMDB_BEARER_TOKEN=your_bearer_token_here
     ```

   To get a TMDb API token:
   - Visit [TMDb API Settings](https://www.themoviedb.org/settings/api)
   - Create an API account or log in
   - Copy your Bearer Token (v4 auth token)

## Running the Project

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Build the project for production:

```bash
npm run build
```

This generates an optimized production build in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Check for code quality issues:

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── Carousel/          # Featured movies carousel
│       ├── FilterBar/         # Genre/category filter buttons
│       ├── MovieCard/         # Individual movie card component
│       ├── MoviesGrid/        # Grid layout for movies
│       ├── MoviesSearch/      # Search input component
│       └── Pagination/        # Pagination controls
├── features/
│   └── movies/
│       ├── moviesSaga.ts      # Redux Saga for async actions
│       ├── moviesSlice.ts     # Redux state management
│       └── moviesTypes.ts     # TypeScript type definitions
├── hooks/
│   └── useKeyboardNavigation.ts  # Custom hook for keyboard shortcuts
├── pages/
│   ├── HomePage.tsx           # Main landing page
│   └── MovieDetailsPage.tsx   # Individual movie details page
├── store/
│   ├── rootSaga.ts           # Root saga configuration
│   └── store.ts              # Redux store configuration
├── utils/
│   ├── api.ts                # API endpoints
│   └── axiosInstance.ts      # Axios configuration
├── App.tsx                    # Root app component
└── main.tsx                   # Application entry point
```

## Usage

### Browse Movies

- The home page displays popular movies in a grid
- Use the carousel at the top to see featured recommendations
- Scroll down to explore more movies

### Search

- Use the search bar to find movies by title
- Minimum 2 characters required
- Results update in real-time

### Filter

- Click filter buttons to switch between categories:
  - **Popular** - Most popular movies
  - **Airing Now** - Currently playing in theaters
  - **My Favorites** - Your personally saved favorites

### Favorites

- Click a movie card to view details
- Click the heart icon to add/remove from favorites
- Favorites are stored in your browser's local storage

### Keyboard Navigation

- **Arrow Up/Down** - Scroll page or navigate between components
- **Arrow Left/Right** - Navigate filter buttons or carousel items
- **Enter** - Select filter, movie, or pagination control

### Pagination

- Use **Previous** and **Next** buttons to browse pages
- Enter a specific page number to jump to it
- Page automatically scrolls to top when changed

## Features Explained

### Dark Mode

The app uses CSS variables for theming, enabling easy dark mode implementation:

- Primary color: `var(--primary-color)` (blue)
- Text colors: `var(--text-primary)` (white), `var(--text-secondary)` (gray)
- Backgrounds: `var(--hover-bg)` (dark gray)

### Responsive Grid

- **Desktop**: 4 columns
- **Tablet** (≤1024px): 3 columns
- **Mobile** (≤768px): 2 columns
- **Small Mobile** (≤480px): 1 column

### Movie Cards

- Natural 2:3 poster aspect ratio
- Rating badge on top-left
- Title overlay on hover
- Smooth hover animations (lift + shadow)

## Troubleshooting

### "Missing VITE_TMDB_BEARER_TOKEN" Error

- Ensure `.env` file exists in the root directory
- Verify the TMDb API token is correctly set
- The token should start with `eyJ` (JWT format)

### Dev Server Not Starting

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)
- Try removing Vite cache: `rm -rf .vite`

### Movies Not Loading

- Check your internet connection
- Verify your TMDb API token is valid and hasn't expired
- Check browser console for detailed error messages

### Search Not Working

- Ensure search query has at least 2 characters
- Check if the API rate limit has been exceeded

## Performance Tips

- The app includes pagination to load movies efficiently
- Images are optimized through TMDb's CDN
- Redux Saga manages side effects and async operations
- Keyboard navigation avoids cross-component interference

## Future Enhancements

- [ ] Movie recommendations based on watch history
- [ ] Collection creation and sharing
- [ ] Advanced filtering (year, rating, genre)
- [ ] Watchlist feature
- [ ] User ratings and reviews
- [ ] Social sharing integration

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:

1. Check the [GitHub Issues](https://github.com) page
2. Review the [TMDb API Documentation](https://developer.themoviedb.org/docs)
3. Check the application console (F12) for error messages

---

**Happy movie exploring! 🎬**

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
