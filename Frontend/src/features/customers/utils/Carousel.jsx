import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import "./Carousel.css";

const getEffectivePerView = (config) => {
  if (typeof config === "number") return config;
  if (typeof config === "object" && config !== null) {
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (width < 640) return config.mobile || 1;
    if (width < 1024) return config.tablet || 2;
    return config.desktop || 3;
  }
  return 1;
};

const Carousel = ({
  items = [],
  renderItem = null,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDots = true,
  showArrows = true,
  itemsPerView = 1,
  className = "",
  gap = 16
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [perView, setPerView] = useState(() => getEffectivePerView(itemsPerView));

  const trackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // Update perView on window resize
  useEffect(() => {
    const handleResize = () => {
      setPerView(getEffectivePerView(itemsPerView));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerView]);

  // Calculate maximum valid start index
  const maxIndex = Math.max(0, items.length - Math.floor(perView));

  // Animate track translation using GSAP
  const updateTrackPosition = useCallback((index) => {
    if (!trackRef.current) return;
    const slidePercent = 100 / perView;
    const offset = index * slidePercent;
    
    gsap.to(trackRef.current, {
      x: `-${offset}%`,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [perView]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      updateTrackPosition(next);
      return next;
    });
  }, [maxIndex, updateTrackPosition]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev <= 0 ? maxIndex : prev - 1;
      updateTrackPosition(next);
      return next;
    });
  }, [maxIndex, updateTrackPosition]);

  const goToIndex = useCallback((index) => {
    const target = Math.min(Math.max(0, index), maxIndex);
    setCurrentIndex(target);
    updateTrackPosition(target);
  }, [maxIndex, updateTrackPosition]);

  // AutoPlay Effect
  useEffect(() => {
    if (!autoPlay || isHovered || maxIndex <= 0) return;
    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, maxIndex, goToNext]);

  // Adjust current index if perView changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      Promise.resolve().then(() => {
        setCurrentIndex(maxIndex);
        updateTrackPosition(maxIndex);
      });
    }
  }, [maxIndex, currentIndex, updateTrackPosition]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      if (distance > 0) goToNext();
      else goToPrev();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`app-carousel-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-viewport">
        <div
          ref={trackRef}
          className="carousel-track"
          style={{ gap: `${gap}px` }}
        >
          {items.map((item, index) => {
            const slideWidth = perView === 1 
              ? "100%" 
              : `calc((100% - ${(Math.ceil(perView) - 1) * gap}px) / ${perView})`;

            return (
              <div
                key={item.id || item.key || index}
                className={`carousel-slide ${index === currentIndex ? "is-active" : ""}`}
                style={{ flex: `0 0 ${slideWidth}`, width: slideWidth }}
              >
                {renderItem ? (
                  renderItem(item, index, currentIndex)
                ) : typeof item === "string" ? (
                  <img src={item} alt={`Slide ${index + 1}`} className="carousel-img" />
                ) : item.src ? (
                  <img src={item.src} alt={item.alt || `Slide ${index + 1}`} className="carousel-img" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > Math.floor(perView) && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && maxIndex > 0 && (
        <div className="carousel-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`carousel-dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => goToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
