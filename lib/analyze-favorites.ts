
const CONTENT_MAPPINGS = {
  books: {
    // Fiction
    "Harry Potter": ["fantasy", "fiction"],
    "Lord of the Rings": ["fantasy", "fiction"],
    "The Hobbit": ["fantasy", "fiction"],
    "Game of Thrones": ["fantasy", "fiction"],
    "Dune": ["sci-fi", "fiction"],
    "1984": ["fiction", "dystopian"],
    "The Great Gatsby": ["fiction", "classics"],
    "Pride and Prejudice": ["romance", "fiction"],
    "To Kill a Mockingbird": ["fiction", "classics"],
    "The Catcher in the Rye": ["fiction", "classics"],
    "Forrest Gump": ["fiction", "biography"],
    "The Alchemist": ["fiction", "philosophy"],
    "Sapiens": ["non-fiction", "history"],
    "Atomic Habits": ["non-fiction", "self-help"],
    "Think and Grow Rich": ["non-fiction", "biography"],
    "Rich Dad Poor Dad": ["non-fiction", "business"],
    "The Shawshank Redemption": ["fiction", "drama"],
    "Pulp Fiction": ["fiction", "thriller"],
    "Titanic": ["romance", "fiction"],
    "Inception": ["sci-fi", "thriller"],
    "The Matrix": ["sci-fi", "fiction"],
    "Interstellar": ["sci-fi", "fiction"],
    "The Godfather": ["fiction", "crime"],
    "Goodfellas": ["fiction", "biography"],
    "The Dark Knight": ["fiction", "action"],
    "Avengers: Endgame": ["fiction", "action"],
    "The Wolf of Wall Street": ["biography", "non-fiction"],
    "Parasite": ["thriller", "fiction"],
    "La La Land": ["romance", "fiction"]
  } as Record<string, string[]>,
  movies: {
    "The Shawshank Redemption": ["drama"],
    "The Godfather": ["drama", "thriller"],
    "Pulp Fiction": ["thriller", "drama"],
    "Inception": ["sci-fi", "thriller"],
    "The Dark Knight": ["action", "thriller"],
    "Forrest Gump": ["drama", "comedy"],
    "The Matrix": ["sci-fi", "action"],
    "Goodfellas": ["drama", "thriller"],
    "The Lord of the Rings": ["action", "drama"],
    "Titanic": ["romance", "drama"],
    "Avengers: Endgame": ["action"],
    "Interstellar": ["sci-fi", "drama"],
    "The Wolf of Wall Street": ["comedy", "drama"],
    "Parasite": ["thriller", "drama"],
    "La La Land": ["romance", "comedy"],
    "Joker": ["thriller", "drama"],
    "Spider-Man": ["action"],
    "Star Wars": ["sci-fi", "action"],
    "Marvel": ["action"],
    "Disney": ["animation", "comedy"],
    "Horror": ["horror"],
    "Comedy": ["comedy"],
    "Romance": ["romance"],
    "Action": ["action"],
    "Thriller": ["thriller"],
    "Drama": ["drama"],
    "Sci-Fi": ["sci-fi"],
    "Science Fiction": ["sci-fi"],
    "Fantasy": ["action", "drama"], // No fantasy in Qloo movie mappings
    "Animation": ["animation"]
  } as Record<string, string[]>,
  podcasts: {
    "The Joe Rogan Experience": ["comedy"],
    "Serial": ["true-crime"],
    "This American Life": ["news"],
    "TED Talks Daily": ["technology"],
    "Radiolab": ["technology"],
    "The Tim Ferriss Show": ["business"],
    "How I Built This": ["business"],
    "Stuff You Should Know": ["technology"],
    "My Favorite Murder": ["true-crime", "comedy"],
    "The Daily": ["news"],
    "Conan O'Brien Needs a Friend": ["comedy"],
    "SmartLess": ["comedy"],
    "Call Her Daddy": ["comedy"],
    "Armchair Expert": ["comedy"],
    "Planet Money": ["business"],
    "Freakonomics": ["business"],
    "WTF with Marc Maron": ["comedy"],
    "NPR": ["news"],
    "BBC": ["news"],
    "CNN": ["news"],
    "ESPN": ["sports"],
    "Tech": ["technology"],
    "Business": ["business"],
    "Comedy": ["comedy"],
    "News": ["news"],
    "Sports": ["sports"],
    "True Crime": ["true-crime"]
  } as Record<string, string[]>,
  tvShows: {
    "Breaking Bad": ["drama", "thriller"],
    "Friends": ["comedy"],
    "The Office": ["comedy"],
    "Game of Thrones": ["drama", "action"],
    "Stranger Things": ["sci-fi", "horror"],
    "The Crown": ["drama"],
    "Black Mirror": ["sci-fi", "thriller"],
    "Sherlock": ["thriller", "drama"],
    "The Big Bang Theory": ["comedy"],
    "House of Cards": ["drama", "thriller"],
    "Narcos": ["drama", "thriller"],
    "The Walking Dead": ["horror", "drama"],
    "Better Call Saul": ["drama", "thriller"],
    "Westworld": ["sci-fi", "drama"],
    "The Witcher": ["action", "drama"],
    "Money Heist": ["thriller", "drama"],
    "Squid Game": ["thriller", "drama"],
    "Ted Lasso": ["comedy"],
    "The Mandalorian": ["sci-fi", "action"],
    "Ozark": ["drama", "thriller"],
    "Netflix": ["drama", "comedy"],
    "HBO": ["drama"],
    "Comedy": ["comedy"],
    "Drama": ["drama"],
    "Action": ["action"],
    "Thriller": ["thriller"],
    "Horror": ["horror"],
    "Sci-Fi": ["sci-fi"],
    "Science Fiction": ["sci-fi"],
    "Animation": ["animation"],
    "Romance": ["romance"]
  } as Record<string, string[]>,
  brands: {
    "Apple": ["technology"],
    "Nike": ["lifestyle"],
    "Google": ["technology"],
    "Netflix": ["entertainment"],
    "Spotify": ["entertainment"],
    "Amazon": ["technology"],
    "Tesla": ["automotive", "technology"],
    "Adidas": ["lifestyle"],
    "Microsoft": ["technology"],
    "Samsung": ["technology"],
    "Coca-Cola": ["food"],
    "McDonald's": ["food"],
    "Starbucks": ["food"],
    "Disney": ["entertainment"],
    "PlayStation": ["entertainment"],
    "Xbox": ["entertainment"],
    "Facebook": ["technology"],
    "Instagram": ["technology"],
    "Twitter": ["technology"],
    "YouTube": ["entertainment"],
    "TikTok": ["entertainment"],
    "Uber": ["technology"],
    "Airbnb": ["lifestyle"],
    "Zara": ["fashion"],
    "H&M": ["fashion"],
    "Louis Vuitton": ["fashion"],
    "BMW": ["automotive"],
    "Mercedes": ["automotive"],
    "Ferrari": ["automotive"]
  } as Record<string, string[]>
};

interface FavoritesAnalysis {
  book_interests: string[];
  movie_interests: string[];
  podcast_interests: string[];
  tv_show_interests: string[];
  brand_interests: string[];
}

export function analyzeFavorites(favorites: {
  books: string[];
  movies: string[];
  podcasts: string[];
  brands: string[];
}): FavoritesAnalysis {
  const analysis: FavoritesAnalysis = {
    book_interests: [],
    movie_interests: [],
    podcast_interests: [],
    tv_show_interests: [],
    brand_interests: []
  };

  // Helper function for fuzzy matching
  const findGenreMatches = (item: string, mappings: Record<string, string[]>): string[] => {
    const matches = new Set<string>();
    
    // Direct exact match
    if (mappings[item]) {
      mappings[item].forEach((genre: string) => matches.add(genre));
    }
    
    // Partial matching (both ways)
    Object.keys(mappings).forEach(key => {
      const itemLower = item.toLowerCase();
      const keyLower = key.toLowerCase();
      
      if (itemLower.includes(keyLower) || keyLower.includes(itemLower)) {
        mappings[key].forEach((genre: string) => matches.add(genre));
      }
    });
    
    // Word-based matching for compound titles
    const itemWords = item.toLowerCase().split(/\s+/);
    Object.keys(mappings).forEach(key => {
      const keyWords = key.toLowerCase().split(/\s+/);
      const commonWords = itemWords.filter(word => keyWords.includes(word));
      
      if (commonWords.length > 0 && commonWords.length >= Math.min(itemWords.length, keyWords.length) * 0.5) {
        mappings[key].forEach((genre: string) => matches.add(genre));
      }
    });
    
    return Array.from(matches);
  };

  // Analyze books
  const bookInterests = new Set<string>();
  favorites.books.forEach(book => {
    const genres = findGenreMatches(book, CONTENT_MAPPINGS.books);
    genres.forEach(genre => bookInterests.add(genre));
  });
  analysis.book_interests = Array.from(bookInterests);

  // Analyze movies (also used for TV shows since they share genres)
  const movieInterests = new Set<string>();
  const tvInterests = new Set<string>();
  
  favorites.movies.forEach(movie => {
    // For movies
    const movieGenres = findGenreMatches(movie, CONTENT_MAPPINGS.movies);
    movieGenres.forEach(genre => movieInterests.add(genre));
    
    // For TV shows (same content often applies to both)
    const tvGenres = findGenreMatches(movie, CONTENT_MAPPINGS.tvShows);
    tvGenres.forEach(genre => tvInterests.add(genre));
  });
  
  analysis.movie_interests = Array.from(movieInterests);
  analysis.tv_show_interests = Array.from(tvInterests);

  // Analyze podcasts
  const podcastInterests = new Set<string>();
  favorites.podcasts.forEach(podcast => {
    const genres = findGenreMatches(podcast, CONTENT_MAPPINGS.podcasts);
    genres.forEach(genre => podcastInterests.add(genre));
  });
  analysis.podcast_interests = Array.from(podcastInterests);

  // Analyze brands
  const brandInterests = new Set<string>();
  favorites.brands.forEach(brand => {
    const genres = findGenreMatches(brand, CONTENT_MAPPINGS.brands);
    genres.forEach(genre => brandInterests.add(genre));
  });
  analysis.brand_interests = Array.from(brandInterests);

  // Apply default interests if none found (matching Qloo API exactly)
  if (analysis.book_interests.length === 0) {
    analysis.book_interests = ["fiction", "non-fiction"];
  }
  if (analysis.movie_interests.length === 0) {
    analysis.movie_interests = ["drama", "comedy"];
  }
  if (analysis.podcast_interests.length === 0) {
    analysis.podcast_interests = ["news", "technology"];
  }
  if (analysis.tv_show_interests.length === 0) {
    analysis.tv_show_interests = ["drama", "comedy"];
  }
  if (analysis.brand_interests.length === 0) {
    analysis.brand_interests = ["technology", "lifestyle"];
  }

  return analysis;
} 