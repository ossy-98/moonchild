import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PlatformItem } from '../config/links';

interface ZoomImageModalProps {
  item: PlatformItem | null;
  onClose: () => void;
}

export const ZoomImageModal: React.FC<ZoomImageModalProps> = ({
  item,
  onClose,
}) => {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-2xl p-4 sm:p-8 select-none cursor-zoom-out"
        >
          {/* 우측 상단 닫기 버튼 */}
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 transition"
              aria-label="닫기"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 확대된 북클릿 이미지 (사진을 한 번 더 누르면 즉시 닫힘) */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={onClose}
            className="relative max-w-[92vw] max-h-[84vh] rounded-xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-white/15 cursor-pointer"
          >
            <img
              src={item.coverImage}
              alt={item.name}
              draggable={false}
              className="block object-contain max-w-[88vw] sm:max-w-[560px] max-h-[82vh] select-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
