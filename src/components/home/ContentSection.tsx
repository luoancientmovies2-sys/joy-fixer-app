import { MovieGrid } from "@/components/movies/MovieGrid";
import { getContentByCategory, type ContentItem } from "@/lib/firebase-db";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentSectionProps {
  title: string;
  category?: string;
  showGenreFilter?: boolean;
}

export function ContentSection({ title, category = "trending", showGenreFilter = false }: ContentSectionProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  useEffect(() => {
    async function fetchContent() {
      try {
        // Fetch all content without limit to show everything on homepage
        const fetchedContent = await getContentByCategory(category);
        setContent(fetchedContent);
      } catch (error) {
        console.error(`Error fetching ${category} content:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [category]);

  const genres = useMemo(() => {
    if (!showGenreFilter) return [];
    const uniqueGenres = new Set<string>();
    content.forEach(item => {
      if (item.genre) {
        const itemGenres = item.genre.split(',').map(g => g.trim()).filter(Boolean);
        itemGenres.forEach(g => uniqueGenres.add(g));
      }
    });
    return Array.from(uniqueGenres).sort();
  }, [content, showGenreFilter]);

  const filteredContent = useMemo(() => {
    if (!showGenreFilter || selectedGenre === "all") return content;
    return content.filter(item => {
      if (!item.genre) return false;
      const itemGenres = item.genre.split(',').map(g => g.trim().toLowerCase());
      return itemGenres.includes(selectedGenre.toLowerCase());
    });
  }, [content, selectedGenre, showGenreFilter]);

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-2 lg:gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (content.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">{title}</h2>
        {showGenreFilter && genres.length > 0 && (
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background/50 border-white/10">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <MovieGrid items={filteredContent} />
    </section>
  );
}
