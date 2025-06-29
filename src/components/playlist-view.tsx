
"use client";

import { useState } from "react";
import type { Playlist, Track } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PlaylistViewProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  currentTrackIndex: number | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectTrack: (trackIndex: number) => void;
  isPlaying: boolean;
  isLoading?: boolean;
  onFetchTracks: (playlistId: string) => Promise<void>;
}

const msToTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function PlaylistView({
  playlists,
  selectedPlaylist,
  currentTrackIndex,
  onSelectPlaylist,
  onSelectTrack,
  isPlaying,
  isLoading = false,
  onFetchTracks,
}: PlaylistViewProps) {
  const [loadingTracks, setLoadingTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultsPlaylist, setSearchResultsPlaylist] = useState<Playlist | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResultsPlaylist(null);
      return;
    }
    setIsSearching(true);
    setSearchResultsPlaylist(null); // Clear previous results to show loading state
    try {
      const response = await fetch(`/api/spotify/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Search failed. Please try again.");
      }
      const tracks: Track[] = await response.json();
      const newSearchResultsPlaylist: Playlist = {
        id: "search-results",
        name: "Search Results",
        description: `Showing results for "${searchQuery}"`,
        tracks: tracks,
        tracksHref: '',
        coverArt: '',
      };
      setSearchResultsPlaylist(newSearchResultsPlaylist);
      onSelectPlaylist(newSearchResultsPlaylist); // Automatically select search results
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: error.message,
      });
      setSearchResultsPlaylist({
        id: "search-results",
        name: "Search Results",
        description: `Failed to search for "${searchQuery}"`,
        tracks: [],
        tracksHref: '',
        coverArt: '',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccordionTriggerClick = (playlist: Playlist) => {
    onSelectPlaylist(playlist);
    // Don't fetch tracks for search results playlist as they are already loaded
    if (playlist.id !== 'search-results' && playlist.tracks.length === 0) {
      setLoadingTracks(prev => new Set(prev).add(playlist.id));
      onFetchTracks(playlist.id).finally(() => {
        setLoadingTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(playlist.id);
          return newSet;
        });
      });
    }
  };

  const renderTrackList = (playlist: Playlist) => (
    <ul>
      {playlist.tracks.length === 0 && (playlist.id === 'search-results' && !isSearching) ? (
        <li className="p-3 text-muted-foreground italic">
          No results found.
        </li>
      ) : playlist.tracks.length === 0 && playlist.id !== 'search-results' ? (
        <li className="p-3 text-muted-foreground italic">
          This playlist appears to be empty.
        </li>
      ) : (
        playlist.tracks.map((track, index) => (
          <li key={`${track.id}-${index}`}>
            <button
              onClick={() => onSelectTrack(index)}
              className={cn(
                "w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center gap-4",
                selectedPlaylist?.id === playlist.id && currentTrackIndex === index
                  ? "bg-primary/20 text-foreground font-semibold"
                  : "hover:bg-primary/10"
              )}
            >
              <Music2 size={20} className={cn("text-muted-foreground", selectedPlaylist?.id === playlist.id && currentTrackIndex === index && isPlaying && "text-accent animate-pulse")} />
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <p className="ml-auto text-sm text-muted-foreground">{msToTime(track.duration)}</p>
            </button>
          </li>
        ))
      )}
    </ul>
  );

  if (isLoading) {
    return (
      <Card className="h-full w-full bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Loading Playlists...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 pr-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (playlists.length === 0) {
     return (
      <Card className="h-full w-full bg-transparent border-2 border-dashed border-primary/20 shadow-lg backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
            <CardTitle className="text-2xl font-headline text-primary">No Playlists Found</CardTitle>
            <p className="text-muted-foreground mt-2">Could not find any playlists in your Spotify account.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Your Music</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0">
        <div className="flex w-full items-center space-x-2 px-6 pb-4">
          <Input
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="submit" size="icon" onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-full pr-4 pl-2">
          <Accordion type="single" collapsible value={selectedPlaylist?.id}>
            {(isSearching || searchResultsPlaylist) && (
              <AccordionItem value="search-results">
                <AccordionTrigger
                  className="text-lg font-headline hover:text-primary"
                  onClick={() => searchResultsPlaylist && handleAccordionTriggerClick(searchResultsPlaylist)}
                  disabled={!searchResultsPlaylist}
                >
                  Search Results
                </AccordionTrigger>
                <AccordionContent>
                  {isSearching ? (
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    searchResultsPlaylist && renderTrackList(searchResultsPlaylist)
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {playlists.map((playlist) => (
              <AccordionItem value={playlist.id} key={playlist.id}>
                <AccordionTrigger
                  className="text-lg font-headline hover:text-primary"
                  onClick={() => handleAccordionTriggerClick(playlist)}
                >
                  {playlist.name}
                </AccordionTrigger>
                <AccordionContent>
                  {loadingTracks.has(playlist.id) ? (
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    renderTrackList(playlist)
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
