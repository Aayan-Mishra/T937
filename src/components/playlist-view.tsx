"use client";

import type { Playlist, Track } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaylistViewProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  currentTrackIndex: number | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectTrack: (trackIndex: number) => void;
  isPlaying: boolean;
}

export function PlaylistView({
  playlists,
  selectedPlaylist,
  currentTrackIndex,
  onSelectPlaylist,
  onSelectTrack,
  isPlaying,
}: PlaylistViewProps) {
  return (
    <Card className="h-full w-full bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Your Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          <Accordion type="single" collapsible defaultValue={selectedPlaylist?.id}>
            {playlists.map((playlist) => (
              <AccordionItem value={playlist.id} key={playlist.id}>
                <AccordionTrigger
                  className="text-lg font-headline hover:text-primary"
                  onClick={() => onSelectPlaylist(playlist)}
                >
                  {playlist.name}
                </AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {playlist.tracks.map((track, index) => (
                      <li key={track.id}>
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
                          <div className="flex-grow">
                            <p className="font-semibold">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                          <p className="ml-auto text-sm text-muted-foreground">{track.duration}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
