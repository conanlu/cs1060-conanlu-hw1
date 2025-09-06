import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, Heart } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Heart className="h-7 w-7 text-red-500" />
            Dog Gallery
          </h1>
          <p className="text-gray-600">
            Click on images to save them, then shuffle to discover new favorites!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {images.map((image, index) => (
            <div
              key={index}
              className={`
                relative aspect-square rounded-xl overflow-hidden cursor-pointer
                transform transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-lg
                ${selectedCells.has(index) 
                  ? 'ring-4 ring-blue-400 shadow-2xl shadow-blue-400/30 scale-105' 
                  : 'shadow-md hover:shadow-xl'
                }
                ${image.loading || isShuffling ? 'animate-pulse' : ''}
              `}
              onClick={() => handleCellClick(index)}
            >
              {image.loading || isShuffling ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={`Dog ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              )}
              
              {selectedCells.has(index) && (
                <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full p-1.5 shadow-lg animate-pulse">
                  <Heart className="h-3 w-3 fill-current" />
                </div>
              )}

              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
              transform transition-all duration-300 ease-out
              ${isShuffling
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95'
              }
              text-white shadow-lg
            `}
          >
            <Shuffle className={`h-5 w-5 ${isShuffling ? 'animate-spin' : ''}`} />
            {isShuffling ? 'Shuffling...' : 'Shuffle New Dogs'}
          </button>

          {selectedCells.size > 0 && (
            <p className="mt-3 text-gray-600 text-sm">
              {selectedCells.size} image{selectedCells.size === 1 ? '' : 's'} saved from shuffle
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;