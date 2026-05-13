import { MainLayout } from "@/components/layout/MainLayout";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { getMovies, getSeries, type ContentItem, isMovieInAgentMode } from "@/lib/firebase-db";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function GenreCategoryPage() {
  const { genreId } = useParams<{ genreId: string }>();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!genreId) return;
      try {
        const [movies, series] = await Promise.all([getMovies(), getSeries()]);
        
        const genreMovies = movies
          .filter(m => !isMovieInAgentMode(m))
          .filter(m => m.genre.toLowerCase().includes(genreId.toLowerCase()))
          .map(m => ({ ...m, type: 'movie' as const }));
          
        const genreSeries = series
          .filter(s => s.genre.toLowerCase().includes(genreId.toLowerCase()))
          .map(s => ({ ...s, type: 'series' as const }));
          
        const combined = [...genreMovies, ...genreSeries].sort((a, b) => b.createdAt - a.createdAt);
        setContent(combined);
      } catch (error) {
        console.error("Error fetching genre content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [genreId]);

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold mb-6 capitalize">{genreId} Movies & TV</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : content.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No content available in this genre yet.</p>
        ) : (
          <MovieGrid items={content} />
        )}
      </div>
    </MainLayout>
  );
}