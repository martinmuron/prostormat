"use client"

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Star, 
  Move, 
  FileImage,
} from 'lucide-react';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
  allowReorder?: boolean;
  allowSetMain?: boolean;
  mainImageIndex?: number;
  onMainImageChange?: (index: number) => void;
}

export function ImageManager({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizePerImage = 5,
  allowReorder = true,
  allowSetMain = true,
  mainImageIndex = 0,
  onMainImageChange
}: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localMainImageIndex, setLocalMainImageIndex] = useState(mainImageIndex);

  const effectiveMainIndex = onMainImageChange ? mainImageIndex : localMainImageIndex;

  useEffect(() => {
    setLocalMainImageIndex(mainImageIndex);
  }, [mainImageIndex]);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Můžete nahrát maximálně ${maxImages} obrázků. Aktuálně máte ${images.length}.`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Není obrázek`);
        continue;
      }
      
      if (file.size > maxSizePerImage * 1024 * 1024) {
        errors.push(`${file.name}: Větší než ${maxSizePerImage}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      alert('Některé soubory nebyly nahrány:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadId = `${Date.now()}-${i}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
        
        // Convert to base64 (stored directly without external service)
        const base64 = await convertToBase64(file);
        newImages.push(base64);
        
        setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Chyba při nahrávání ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setUploading(false);
    setUploadProgress({});
  }, [images, maxImages, maxSizePerImage, onImagesChange]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    if (!allowSetMain) return;

    if (onMainImageChange) {
      if (index === effectiveMainIndex) {
        onMainImageChange(0);
        setLocalMainImageIndex(0);
      } else if (index < effectiveMainIndex) {
        onMainImageChange(effectiveMainIndex - 1);
        setLocalMainImageIndex((prev) => Math.max(prev - 1, 0));
      }
    } else {
      if (index === localMainImageIndex) {
        setLocalMainImageIndex(0);
      } else if (index < localMainImageIndex) {
        setLocalMainImageIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const setAsMainImage = (index: number) => {
    if (!allowSetMain) return;

    if (allowReorder) {
      const reordered = [...images];
      const [selected] = reordered.splice(index, 1);
      reordered.unshift(selected);
      onImagesChange(reordered);

      if (onMainImageChange) {
        onMainImageChange(0);
      }
      setLocalMainImageIndex(0);
    } else {
      if (onMainImageChange) {
        onMainImageChange(index);
      }
      setLocalMainImageIndex(index);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);

    // Update main image index if needed
    if (!allowSetMain) return;

    const currentMain = effectiveMainIndex;

    if (onMainImageChange) {
      if (fromIndex === currentMain) {
        onMainImageChange(toIndex);
        setLocalMainImageIndex(toIndex);
      } else if (fromIndex < currentMain && toIndex >= currentMain) {
        onMainImageChange(currentMain - 1);
        setLocalMainImageIndex((prev) => Math.max(prev - 1, 0));
      } else if (fromIndex > currentMain && toIndex <= currentMain) {
        onMainImageChange(currentMain + 1);
        setLocalMainImageIndex((prev) => prev + 1);
      }
    } else {
      if (fromIndex === localMainImageIndex) {
        setLocalMainImageIndex(toIndex);
      } else if (fromIndex < localMainImageIndex && toIndex >= localMainImageIndex) {
        setLocalMainImageIndex((prev) => Math.max(prev - 1, 0));
      } else if (fromIndex > localMainImageIndex && toIndex <= localMainImageIndex) {
        setLocalMainImageIndex((prev) => prev + 1);
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : images.length >= maxImages 
              ? 'border-gray-200 bg-gray-50 opacity-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={images.length >= maxImages || uploading}
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {images.length >= maxImages
                ? `Dosáhli jste maximálního počtu obrázků (${maxImages})`
                : uploading
                ? 'Nahrávám obrázky...'
                : 'Přetáhněte obrázky sem nebo klikněte pro výběr'
              }
            </p>
            
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Max. {maxImages} obrázků</span>
              <span>Max. {maxSizePerImage}MB/obrázek</span>
              <span>JPG, PNG, WEBP</span>
            </div>
          </div>
          
          {!uploading && images.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              <FileImage className="h-4 w-4 mr-2" />
              Vybrat obrázky
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Obrázky ({images.length}/{maxImages})
            </h4>
            {allowSetMain && images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="h-3 w-3" />
                <span>Hlavní obrázek: {mainImageIndex + 1}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <Card
                key={index}
                className={`relative group overflow-hidden ${
                  allowSetMain && index === effectiveMainIndex 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                }`}
                draggable={allowReorder}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.startsWith('data:') || image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/venue-images/${image}`}
                      alt={`Obrázek ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', image.substring(0, 100));
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.2s' }}
                    />
                    
                    {/* Main Image Badge */}
                    {allowSetMain && index === effectiveMainIndex && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Hlavní
                      </Badge>
                    )}
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        {allowSetMain && index !== mainImageIndex && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsMainImage(index)}
                            className="bg-white/90 hover:bg-white text-gray-900 h-8 w-8 p-0"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {allowReorder && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-gray-900 h-8 w-8 p-0 cursor-move"
                          >
                            <Move className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {allowReorder && images.length > 1 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Přetažením obrázků můžete změnit jejich pořadí
            </p>
          )}
        </div>
      )}
    </div>
  );
}
