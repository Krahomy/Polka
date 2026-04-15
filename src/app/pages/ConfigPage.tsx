import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Trash2, Shuffle, ArrowLeft, Settings, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useNavigate } from 'react-router';
import type { Book } from '../components/bookData';
import { loadShadowOpacity, saveShadowOpacity, loadShelfImage, saveShelfImage, saveDefaultShelfImage } from '../components/bookData';
import { useBooksContext } from '../context/BooksContext';

export default function ConfigPage() {
  const navigate = useNavigate();
  const { books, updateBook: ctxUpdateBook } = useBooksContext();

  const [shadowOpacity, setShadowOpacity] = useState<number>(() => loadShadowOpacity());
  const [customShelfImage, setCustomShelfImage] = useState<string | null>(() => loadShelfImage());
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const shelfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveShadowOpacity(shadowOpacity);
    saveShelfImage(customShelfImage);
  }, [shadowOpacity, customShelfImage]);

  const updateBook = useCallback((id: number, updates: Partial<Book>) => {
    const book = books.find(b => b.id === id);
    const finalUpdates = { ...updates };
    if (finalUpdates.status !== undefined && book) {
      if (finalUpdates.status === 'Finished') {
        finalUpdates.finishedAt = book.status === 'Finished' && book.finishedAt
          ? book.finishedAt
          : Date.now();
      } else {
        finalUpdates.finishedAt = undefined;
      }
    }
    ctxUpdateBook(id, finalUpdates).catch(console.error);
  }, [books, ctxUpdateBook]);

  const resizeImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number,
    onDone: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        onDone(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedBookId !== null) {
      resizeImage(file, 300, 800, 0.7, (dataUrl) => {
        updateBook(selectedBookId, { spineImage: dataUrl, spineColor: 'bg-white' });
        toast.success("Spine image updated!");
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedBookId !== null) {
      resizeImage(file, 400, 600, 0.7, (dataUrl) => {
        updateBook(selectedBookId, { coverImage: dataUrl });
        toast.success("Cover image updated!");
      });
    }
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleShelfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resizeImage(file, 1200, 300, 0.7, (dataUrl) => {
        setCustomShelfImage(dataUrl);
        toast.success("Shelf image updated!");
      });
    }
    if (shelfInputRef.current) shelfInputRef.current.value = '';
  };

  const removeSpineImage = (id: number) => {
    updateBook(id, { spineImage: undefined, spineColor: 'bg-[#e5e1db]' });
    toast.success("Spine image removed.");
  };

  const randomizeTilts = () => {
    books.forEach((book, i) => {
      const tilt = i === 0 ? 0 : Math.floor(Math.random() * 9) - 4;
      ctxUpdateBook(book.id, { tilt }).catch(console.error);
    });
    toast.success("Randomized book tilts!");
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const displayBooks = books.filter(book => book.title || book.author);
  const heightOptions = ['h-40', 'h-44', 'h-46', 'h-48', 'h-50', 'h-52', 'h-54', 'h-56', 'h-60', 'h-64'];
  const widthOptions = ['w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-28', 'w-32'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shelf
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Technical Configuration</h1>
          </div>
          <button
            onClick={randomizeTilts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Randomize Tilts
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Book to Edit</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {displayBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`relative aspect-[2/3] rounded-md overflow-hidden transition-all hover:scale-105 ${
                      selectedBookId === book.id
                        ? 'ring-4 ring-blue-500 shadow-lg scale-105'
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      backgroundImage: book.coverImage ? `url(${book.coverImage})` : undefined,
                      backgroundColor: !book.coverImage ? book.spineColor.replace('bg-', '') : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                      <span className="text-white text-xs font-bold">#{book.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Global Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h2>

              {/* Shelf Image Upload */}
              <div className="flex flex-col gap-3 pb-6 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-medium">CUSTOM SHELF IMAGE</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => shelfInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-2.5 rounded-lg transition-colors border border-blue-200 font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    {customShelfImage ? 'Change Shelf Image' : 'Upload Shelf Image'}
                  </button>
                  {customShelfImage && (
                    <>
                      <button
                        onClick={() => {
                          saveDefaultShelfImage(customShelfImage);
                          toast.success("Shelf image saved as default!");
                        }}
                        className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 transition-colors"
                        title="Save as Default"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCustomShelfImage(null);
                          toast.success("Shelf image reset to default.");
                        }}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {customShelfImage && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-16">
                    <img src={customShelfImage} alt="Custom shelf" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Shadow Contrast */}
              <div className="flex flex-col gap-3 pt-6">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>SHADOW CONTRAST</span>
                  <span className="text-blue-600">{Math.round(shadowOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Book Editor Panel */}
          <div className="lg:col-span-1">
            {selectedBook ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Book #{selectedBook.id}</h3>
                  <button
                    onClick={() => setSelectedBookId(null)}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {/* Image Uploads */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase text-gray-600 font-bold tracking-wider">Spine Image</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-2.5 rounded-lg transition-colors border border-blue-200 font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        {selectedBook.spineImage ? 'Change' : 'Upload'}
                      </button>
                      {selectedBook.spineImage && (
                        <button
                          onClick={() => removeSpineImage(selectedBook.id)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase text-gray-600 font-bold tracking-wider">Cover Image</span>
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm py-2.5 rounded-lg transition-colors border border-blue-200 font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {selectedBook.coverImage ? 'Change' : 'Upload'}
                    </button>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Text Fields */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase text-gray-600 font-bold tracking-wider">Book Title</label>
                    <input
                      type="text"
                      value={selectedBook.title || ''}
                      onChange={(e) => updateBook(selectedBook.id, { title: e.target.value })}
                      placeholder="Enter book title"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase text-gray-600 font-bold tracking-wider">Author Name</label>
                    <input
                      type="text"
                      value={selectedBook.author || ''}
                      onChange={(e) => updateBook(selectedBook.id, { author: e.target.value })}
                      placeholder="Enter author name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Status Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase text-gray-600 font-bold tracking-wider">Reading Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['To Read', 'Reading', 'Finished'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateBook(selectedBook.id, { status })}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                            selectedBook.status === status
                              ? status === 'Reading'
                                ? 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]'
                                : status === 'Finished'
                                ? 'bg-[#D1FAE5] text-[#065F46] border-[#065F46]'
                                : 'bg-[#DBEAFE] text-[#1E40AF] border-[#1E40AF]'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Dimensions */}
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-gray-600 font-bold tracking-wider">
                        <span>HEIGHT</span>
                        <span className="text-blue-600">{selectedBook.height.replace('h-', '')} units</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={heightOptions.length - 1}
                        value={heightOptions.indexOf(selectedBook.height)}
                        onChange={(e) => updateBook(selectedBook.id, { height: heightOptions[parseInt(e.target.value)] })}
                        className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-gray-600 font-bold tracking-wider">
                        <span>WIDTH</span>
                        <span className="text-blue-600">{selectedBook.width.replace('w-', '')} units</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={widthOptions.length - 1}
                        value={widthOptions.indexOf(selectedBook.width)}
                        onChange={(e) => updateBook(selectedBook.id, { width: widthOptions[parseInt(e.target.value)] })}
                        className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-gray-600 font-bold tracking-wider">
                        <span>TILT ANGLE</span>
                        <span className="text-blue-600">{selectedBook.tilt || 0}</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        value={selectedBook.tilt || 0}
                        onChange={(e) => updateBook(selectedBook.id, { tilt: parseInt(e.target.value) })}
                        className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-3">
                  <Settings className="w-12 h-12 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 text-sm">Select a book to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />
      <input type="file" ref={shelfInputRef} onChange={handleShelfChange} className="hidden" accept="image/*" />
    </div>
  );
}
