import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, Heart, Download } from 'lucide-react';

interface DogImage {
  url: string;
  loading: boolean;
}

function App() {
  const [images, setImages] = useState<DogImage[]>(
    Array(9).fill(null).map(() => ({ url: '', loading: true }))
  );
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [isShuffling, setIsShuffling] = useState(false);

  const handleExport = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 3;
    const cellSize = 200;
    const gap = 8;
    const canvasSize = gridSize * cellSize + (gridSize - 1) * gap;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const imagePromises = images.map((image, index) => {
      return new Promise<void>((resolve) => {
        if (!image.url) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const x = col * (cellSize + gap);
          const y = row * (cellSize + gap);
          
          ctx.drawImage(img, x, y, cellSize, cellSize);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = image.url;
      });
    });

    await Promise.all(imagePromises);
    
    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dog-grid.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  }, [images]);
  const fetchRandomDogImage = async (): Promise<string> => {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Failed to fetch dog image:', error);
      return '';
    }
  };

  const loadImage = async (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, loading: true } : img
    ));

    const imageUrl = await fetchRandomDogImage();
    
    setImages(prev => prev.map((img, i) => 
      i === index ? { url: imageUrl, loading: false } : img
    ));
  };

  const loadInitialImages = async () => {
    const imagePromises = Array(9).fill(null).map(async () => {
      const url = await fetchRandomDogImage();
      return { url, loading: false };
    });

    const loadedImages = await Promise.all(imagePromises);
    setImages(loadedImages);
  };

  useEffect(() => {
    loadInitialImages();
  }, []);

  const handleCellClick = useCallback((index: number) => {
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleShuffle = async () => {
    setIsShuffling(true);
    
    const shufflePromises = images.map(async (img, index) => {
      if (!selectedCells.has(index)) {
        const newUrl = await fetchRandomDogImage();
        return { url: newUrl, loading: false };
      }
      return img;
    });

    const shuffledImages = await Promise.all(shufflePromises);
    setImages(shuffledImages);
    setIsShuffling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Dog Gallery
          </h1>
          <p className="text-gray-600 text-sm">
            Click on images to save them, then shuffle to discover new favorites!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`
                relative aspect-square rounded-lg overflow-hidden cursor-pointer
                transform transition-all duration-300 ease-out
                hover:scale-102 hover:shadow-md
                ${selectedCells.has(index) 
                  ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/30 scale-102' 
                  : 'shadow-sm hover:shadow-md'
                }
                ${image.loading || isShuffling ? 'animate-pulse' : ''}
              `}
              onClick={() => handleCellClick(index)}
            >
              {image.loading || isShuffling ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={`Dog ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              )}
              
              {selectedCells.has(index) && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 shadow-md animate-pulse">
                  <Heart className="h-2.5 w-2.5 fill-current" />
                </div>
              )}

              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transform transition-all duration-300 ease-out
              ${isShuffling
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-102 hover:shadow-md active:scale-95'
              }
              text-white shadow-sm
            `}
          >
            <Shuffle className={`h-4 w-4 ${isShuffling ? 'animate-spin' : ''}`} />
            {isShuffling ? 'Shuffling...' : 'Shuffle'}
          </button>
          
          <button
            onClick={handleExport}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transform transition-all duration-300 ease-out
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
              hover:scale-102 hover:shadow-md active:scale-95
              text-white shadow-sm
            "
          >
            <Download className="h-4 w-4" />
            Export
          </button>

        </div>

        {selectedCells.size > 0 && (
          <div className="text-center mt-2">
            <p className="text-gray-600 text-xs">
              {selectedCells.size} image{selectedCells.size === 1 ? '' : 's'} saved from shuffle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;