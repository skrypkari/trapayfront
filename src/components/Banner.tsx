import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface BannerData {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface BannerProps {
  banners: BannerData[];
  onRemove: (id: string) => void;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

const getBannerColor = (type: BannerData['type']) => {
  switch (type) {
    case 'info':
      return 'bg-[#6936d3]';
    case 'success':
      return 'bg-[#22c55e]';
    case 'warning':
      return 'bg-[#f97316]';
  }
};

const Banner: React.FC<BannerProps> = ({
  banners,
  onRemove,
  currentIndex,
  onPrevious,
  onNext,
}) => {
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      onNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, onNext]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className={`${getBannerColor(currentBanner.type)} rounded-xl p-4 md:p-6 text-white relative`}
        >
          <div className="max-w-4xl">
            <h3 className="text-base md:text-lg font-semibold mb-2">{currentBanner.title}</h3>
            <p className="text-sm opacity-90 mb-4">{currentBanner.description}</p>
            {currentBanner.action && (
              <button 
                onClick={currentBanner.action.onClick}
                className="text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg"
              >
                {currentBanner.action.label}
              </button>
            )}
          </div>

          <button
            onClick={() => onRemove(currentBanner.id)}
            className="absolute top-2 right-2 md:top-4 md:right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Banner;