import React, { useState, useRef, useEffect, useReducer } from 'react';
import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { loadShadowOpacity, loadShelfImage, loadDefaultShelfImage, STORAGE_KEY_SETTINGS } from './bookData';
import { useBooksContext } from '../context/BooksContext';
import { buildSpineSVG, spineWidth, titleToRgb, applyColorSettings } from '../../lib/spineGenerator';
import { extractColor, applyNoise } from '../../lib/colorExtractor';

export function Shelf() {
  const navigate = useNavigate();
  const { books } = useBooksContext();

  const [shadowOpacity, setShadowOpacity] = useState<number>(() => loadShadowOpacity());
  const [customShelfImage, setCustomShelfImage] = useState<string | null>(() => loadShelfImage());
  const [defaultShelfImage, setDefaultShelfImage] = useState<string | null>(() => loadDefaultShelfImage());
  const [touchedBookId, setTouchedBookId] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const colorCacheRef = useRef<Map<number, [number, number, number]>>(new Map());
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const isScrollingRef = useRef(false);
  const lastScrollLeftRef = useRef(0);
  const scrollCooldownRef = useRef(false);
  const isTouchDeviceRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  };

  const playClickSound = () => {
    initAudioContext();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    gainNode.gain.linearRampToValueAtTime(0.001, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  };

  const handleTouchStart = (bookId: number) => {
    isTouchDeviceRef.current = true;
    if (isScrollingRef.current || scrollCooldownRef.current) return;

    setTouchedBookId(bookId);
    playClickSound();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrollingRef.current || scrollCooldownRef.current) return;

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      const bookElement = element.closest('[data-book-id]') as HTMLElement;

      if (bookElement) {
        const bookIdStr = bookElement.getAttribute('data-book-id');
        if (bookIdStr) {
          const bookId = Number(bookIdStr);
          if (bookId !== touchedBookId) {
            setTouchedBookId(bookId);
            playClickSound();
          }
        }
      } else {
        if (touchedBookId !== null) {
          setTouchedBookId(null);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isScrollingRef.current && !scrollCooldownRef.current) {
      setTouchedBookId(null);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        scrollCooldownRef.current = true;
        setIsScrolling(true);
        setTouchedBookId(null);
      }

      lastScrollLeftRef.current = scrollContainer.scrollLeft;

      const pollScrollStop = () => {
        const prevPos = lastScrollLeftRef.current;

        scrollTimeoutRef.current = setTimeout(() => {
          const currentPos = scrollContainer.scrollLeft;
          if (currentPos === prevPos) {
            isScrollingRef.current = false;
            setIsScrolling(false);
            setTouchedBookId(null);
            setTimeout(() => {
              scrollCooldownRef.current = false;
            }, 150);
          } else {
            lastScrollLeftRef.current = currentPos;
            pollScrollStop();
          }
        }, 100);
      };

      pollScrollStop();
    };

    const handleContainerTouchStart = () => {
      if (isScrollingRef.current || scrollCooldownRef.current) {
        setTouchedBookId(null);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', handleContainerTouchStart, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('touchstart', handleContainerTouchStart);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [books.length]);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.shadowOpacity !== undefined) {
            setShadowOpacity(settings.shadowOpacity);
          }
          if (settings.customShelfImage !== undefined) {
            setCustomShelfImage(settings.customShelfImage);
          }
          if (settings.defaultShelfImage !== undefined) {
            setDefaultShelfImage(settings.defaultShelfImage);
          }
        }
      } catch (e) {
        console.error("Failed to reload settings", e);
      }
    };

    window.addEventListener('books-updated', handleSettingsUpdated);
    return () => window.removeEventListener('books-updated', handleSettingsUpdated);
  }, []);

  const getBookHeightPixels = (heightClass: string) => {
    const numericPart = parseInt(heightClass.replace('h-', ''));
    return numericPart * 4;
  };

  const finishedBooks = books.filter((book) => book.status === 'Finished')
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  useEffect(() => {
    finishedBooks.forEach(book => {
      if (colorCacheRef.current.has(book.id)) return;
      colorCacheRef.current.set(book.id, titleToRgb(book.title));
      if (book.coverImage) {
        extractColor(book.coverImage).then(rgb => {
          if (rgb) { colorCacheRef.current.set(book.id, rgb); forceUpdate(); }
        });
      }
    });
  }, [finishedBooks]);

  const totalBooksWidth = finishedBooks.reduce((acc, book) => {
    const widthPx = spineWidth(book.pages);
    const heightPx = getBookHeightPixels(book.height);
    const tilt = book.tilt || 0;
    const offset = Math.abs(Math.sin((tilt * Math.PI) / 180) * heightPx);
    return acc + widthPx + offset + 2;
  }, 0);

  const bufferSpace = 100;
  const shelfWidth = totalBooksWidth + bufferSpace;

  // Effective tilts: adjacent books must not lean the same way.
  // When conflict detected, choose between 0 and opposite direction deterministically by book.id.
  const effectiveTilts: number[] = [];
  for (let i = 0; i < finishedBooks.length; i++) {
    const raw = finishedBooks[i].tilt || 0;
    let effective = raw;
    if (i > 0) {
      const prev = effectiveTilts[i - 1];
      if ((prev > 0 && raw > 0) || (prev < 0 && raw < 0)) {
        // Conflict: use book.id hash to pick between 0 (straight) or opposite
        const h = (finishedBooks[i].id * 1234567891) >>> 0;
        effective = (h & 1) === 0 ? 0 : -raw;
      }
    }
    effectiveTilts.push(effective);
  }

  return (
    <div className="relative w-full pt-12 shadow-sm bg-[#fff8ef]">

      {/* Configuration Button */}
      <div className="absolute top-2 right-2 z-50">
        <button
          onClick={() => navigate('/config')}
          className="p-2 rounded-full shadow-sm transition-all border border-gray-200 bg-white/80 text-gray-600 hover:bg-blue-600 hover:text-white"
          title="Open Technical Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Books Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto mb-[-6px] z-10 relative min-h-[285px]"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(139, 111, 71, 0.5) transparent',
          touchAction: 'pan-x',
          overflowY: 'hidden',
        }}
      >
        <div
          className="flex items-end justify-start space-x-[2px] perspective-[1000px] min-h-[285px] pl-4"
          style={{
            width: `${shelfWidth}px`,
            minWidth: '100%',
            touchAction: 'pan-x',
          }}
        >
          {finishedBooks.map((book, index) => {
            const isFirstBook = index === 0;
            const isLastBook = index === finishedBooks.length - 1;
            const rawTilt = effectiveTilts[index];
            const tilt = isFirstBook ? 0 : isLastBook && rawTilt > 0 ? 0 : rawTilt;

            const heightPx = getBookHeightPixels(book.height);
            const widthPx  = spineWidth(book.pages);
            const offset = Math.abs(Math.sin((tilt * Math.PI) / 180) * heightPx);
            const marginLeft = tilt < 0 ? offset : 0;
            const marginRight = tilt > 0 ? offset : 0;
            const absTilt = Math.abs(tilt);
            const baseShadowBlur = 6 + absTilt * 2;
            const baseShadowSpread = 1 + absTilt * 0.5;
            const baseShadowOpacity = Math.min(shadowOpacity * 0.6 + absTilt * 0.04, 0.7);
            const gapShadowBlur = absTilt > 0 ? 10 + absTilt * 3 : 0;
            const gapShadowOpacity = absTilt > 0 ? Math.min(shadowOpacity * 0.5 + absTilt * 0.05, 0.6) : 0;
            const gapOffsetX = tilt > 0 ? -absTilt * 0.8 : absTilt * 0.8;

            const isTouched = touchedBookId === book.id;
            const shouldAnimate = !isScrolling && isTouched;

            const rawRgb = colorCacheRef.current.get(book.id) ?? titleToRgb(book.title);
            const rgb    = applyColorSettings(...rawRgb);
            const svgStr = buildSpineSVG(book, rgb, heightPx);

            return (
              <motion.div
                key={book.id}
                data-book-id={book.id}
                onMouseEnter={!isScrolling ? playClickSound : undefined}
                onTouchStart={() => handleTouchStart(book.id)}
                className="relative rounded-sm group cursor-pointer overflow-hidden"
                style={{
                  width: widthPx,
                  height: heightPx,
                  marginLeft: marginLeft,
                  marginRight: marginRight,
                  transformOrigin: 'bottom center',
                  pointerEvents: isScrolling ? 'none' : 'auto',
                  touchAction: 'pan-x',
                  flexShrink: 0,
                }}
                initial={{ rotate: `${tilt}deg` }}
                whileHover={!isScrolling && !isTouchDeviceRef.current ? {
                  scale: 1.1,
                  zIndex: 50,
                  y: -15,
                  rotate: "0deg",
                  boxShadow: `0px 20px 30px -5px rgba(0,0,0,${Math.min(shadowOpacity + 0.2, 0.8)})`,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                } : undefined}
                animate={shouldAnimate ? {
                  scale: 1.1,
                  zIndex: 50,
                  y: -15,
                  rotate: "0deg",
                  boxShadow: `0px 20px 30px -5px rgba(0,0,0,${Math.min(shadowOpacity + 0.2, 0.8)})`,
                } : {
                  rotate: `${tilt}deg`,
                  scale: 1,
                  zIndex: 1,
                  y: 0,
                  boxShadow: [
                    `${tilt > 0 ? -5 : 5}px 0px 15px -3px rgba(0,0,0,${shadowOpacity})`,
                    `0px ${baseShadowBlur * 0.5}px ${baseShadowBlur}px -${baseShadowSpread}px rgba(0,0,0,${baseShadowOpacity})`,
                    absTilt > 0 ? `${gapOffsetX}px ${gapShadowBlur * 0.4}px ${gapShadowBlur}px -2px rgba(0,0,0,${gapShadowOpacity})` : '',
                  ].filter(Boolean).join(', ')
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Generated SVG spine */}
                <div
                  dangerouslySetInnerHTML={{ __html: svgStr }}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {/* Paper noise canvas overlay */}
                <canvas
                  ref={(canvas) => {
                    if (!canvas) return;
                    canvas.width  = widthPx;
                    canvas.height = heightPx;
                    const ctx = canvas.getContext('2d');
                    if (ctx) applyNoise(ctx, widthPx, heightPx);
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                />

                {/* Base contact shadow on the shelf */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-[-1]"
                  style={{
                    width: `${widthPx + 8 + absTilt * 2}px`,
                    height: `${4 + absTilt * 1.5}px`,
                    background: `radial-gradient(ellipse at center, rgba(0,0,0,${baseShadowOpacity * 0.8}) 0%, rgba(0,0,0,0) 70%)`,
                    transform: `translateY(${2 + absTilt * 0.5}px)`,
                    filter: `blur(${2 + absTilt}px)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shelf Board */}
      <div className="relative h-5 w-full shadow-xl z-20">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${customShelfImage ?? defaultShelfImage ?? '/shelf-wood.jpg'})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left center',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
          <div
            className="absolute inset-0 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.08))',
            }}
          ></div>
        </div>
        <div
          className="absolute left-0 right-0 h-16 pointer-events-none top-[calc(100%-4px)]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0))',
            filter: 'blur(6px)',
          }}
        ></div>
      </div>
    </div>
  );
}
