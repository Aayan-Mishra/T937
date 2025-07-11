
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
import { Separator } from "./ui/separator";

interface PlaylistViewProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  currentTrackIndex: number | null;
  onSelectPlaylist: (playlist: Playlist | null) => void;
  onSelectTrack: (playlist: Playlist, trackIndex: number) => void;
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
      onSelectPlaylist(newSearchResultsPlaylist);
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

  const handlePlaylistClick = (playlist: Playlist) => {
    if (selectedPlaylist?.id === playlist.id) {
      onSelectPlaylist(null);
    } else {
      onSelectPlaylist(playlist);
      setSearchResultsPlaylist(null);
      setSearchQuery('');
      
      if (playlist.tracks.length === 0) {
        setLoadingTracks(prev => new Set(prev).add(playlist.id));
        onFetchTracks(playlist.id).finally(() => {
          setLoadingTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(playlist.id);
            return newSet;
          });
        });
      }
    }
  };

  const renderTrackList = (playlist: Playlist) => (
    <ul>
      {playlist.tracks.length === 0 ? (
        <li className="p-3 text-muted-foreground italic">
          No results found.
        </li>
      ) : (
        playlist.tracks.map((track, index) => (
          <li key={`${track.id}-${index}`}>
            <button
              onClick={() => onSelectTrack(playlist, index)}
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

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <Card className="bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Search Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
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

          {(isSearching || searchResultsPlaylist) && (
            <div className="mt-4">
              <Separator className="mb-4" />
                {isSearching && (
                  <div>
                    <h3 className="text-lg font-headline text-muted-foreground mb-2">Searching...</h3>
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                )}
                {searchResultsPlaylist && (
                  <div>
                    <h3 className="text-lg font-headline text-muted-foreground mb-2">Search Results</h3>
                    <ScrollArea className="h-full max-h-64 pr-4">
                      {renderTrackList(searchResultsPlaylist)}
                    </ScrollArea>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg flex-grow flex flex-col min-h-0">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Your Playlists</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col min-h-0 p-2 pt-0">
           {playlists.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-4">
                <div>
                    <CardTitle className="text-xl font-headline text-primary">No Playlists Found</CardTitle>
                    <p className="text-muted-foreground mt-2">Could not find any playlists in your Spotify account.</p>
                </div>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4 pl-2">
                <Accordion type="single" collapsible value={selectedPlaylist?.id !== 'search-results' ? selectedPlaylist?.id : undefined}>
                {playlists.map((playlist) => (
                    <AccordionItem value={playlist.id} key={playlist.id}>
                    <AccordionTrigger
                        className="text-lg font-headline hover:text-primary"
                        onClick={() => handlePlaylistClick(playlist)}
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
           )}
        </CardContent>
      </Card>
    </div>
  );
}
