import React from "react";
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: OverlayProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-arena-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
              {(title || onClose) && (
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                  <button onClick={onClose} className="p-2 -mr-2 text-arena-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function BottomSheet({ isOpen, onClose, children, title }: OverlayProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-arena-card border-t border-white/10 rounded-t-3xl shadow-2xl md:hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex justify-center p-3">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
                {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                <button onClick={onClose} className="p-2 -mr-2 text-arena-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6 overflow-y-auto pb-safe">
              {children}
            </div>
          </motion.div>
          
          {/* Desktop fallback to modal */}
          <div className="hidden md:block">
            <Modal isOpen={isOpen} onClose={onClose} title={title}>
              {children}
            </Modal>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
