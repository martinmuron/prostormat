"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Video, 
  X, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Youtube
} from 'lucide-react';

interface YouTubeManagerProps {
  videoUrl?: string;
  onVideoChange: (url: string) => void;
}

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
}

export function YouTubeManager({ videoUrl, onVideoChange }: YouTubeManagerProps) {
  const [inputUrl, setInputUrl] = useState(videoUrl || '');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string>('');

  // Extract YouTube video ID from various URL formats
  const extractVideoId = useCallback((url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }, []);

  // Validate and process YouTube URL
  const validateYouTubeUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setVideoInfo(null);
      setError('');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        setError('Neplatná YouTube URL. Podporované formáty: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...');
        setVideoInfo(null);
        setIsValidating(false);
        return;
      }

      // Create video info object (in production, you might want to fetch from YouTube API)
      const info: VideoInfo = {
        id: videoId,
        title: 'YouTube Video', // In production, fetch real title
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`
      };

      // Test if thumbnail loads (basic validation)
      const img = new Image();
      img.onload = () => {
        setVideoInfo(info);
        setIsValidating(false);
      };
      img.onerror = () => {
        setError('Video nebylo nalezeno nebo není dostupné. Zkontrolujte URL a nastavení soukromí videa.');
        setVideoInfo(null);
        setIsValidating(false);
      };
      img.src = info.thumbnail;

    } catch {
      setError('Chyba při ověřování videa.');
      setVideoInfo(null);
      setIsValidating(false);
    }
  }, [extractVideoId]);

  const handleUrlChange = (url: string) => {
    setInputUrl(url);
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateYouTubeUrl(url);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = () => {
    if (videoInfo) {
      onVideoChange(inputUrl);
    } else if (!inputUrl.trim()) {
      onVideoChange('');
    }
  };

  const handleRemove = () => {
    setInputUrl('');
    setVideoInfo(null);
    setError('');
    onVideoChange('');
  };

  const currentVideoInfo = videoUrl ? 
    (videoInfo || { 
      id: extractVideoId(videoUrl),
      embedUrl: videoUrl.includes('embed') ? videoUrl : `https://www.youtube.com/embed/${extractVideoId(videoUrl)}`,
      watchUrl: videoUrl.includes('watch') ? videoUrl : `https://www.youtube.com/watch?v=${extractVideoId(videoUrl)}`,
      thumbnail: `https://img.youtube.com/vi/${extractVideoId(videoUrl)}/hqdefault.jpg`
    }) : null;

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          YouTube URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="url"
              value={inputUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... nebo https://youtu.be/..."
              className={`pr-10 ${error ? 'border-red-300' : videoInfo ? 'border-green-300' : ''}`}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!isValidating && videoInfo && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
            {!isValidating && error && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-600" />
            )}
          </div>
          
          {inputUrl !== videoUrl && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isValidating || (!!error && !!inputUrl.trim())}
              variant="outline"
            >
              {!inputUrl.trim() ? 'Odstranit' : 'Uložit'}
            </Button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-start gap-1">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>Podporované formáty YouTube URL:</p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
            <li>https://youtu.be/VIDEO_ID</li>
            <li>https://www.youtube.com/embed/VIDEO_ID</li>
          </ul>
        </div>
      </div>

      {/* Video Preview */}
      {currentVideoInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Náhled videa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Embed */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={currentVideoInfo.embedUrl}
                title="YouTube video preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Video Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href={currentVideoInfo.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Zobrazit na YouTube
                </a>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Odstranit video
              </Button>
            </div>
            
            {/* Video Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Video ID:</strong> {currentVideoInfo.id}</p>
                <p><strong>Embed URL:</strong> {currentVideoInfo.embedUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Video State */}
      {!currentVideoInfo && !inputUrl && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Video className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Žádné video nepřidáno
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4">
              Přidejte YouTube video pro lepší prezentaci vašeho prostoru
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                input?.focus();
              }}
            >
              <Youtube className="h-4 w-4 mr-2" />
              Přidat YouTube video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}