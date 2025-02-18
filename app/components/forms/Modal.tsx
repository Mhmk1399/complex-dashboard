import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.2 }}
          >
            <div
              className="bg-white/10 backdrop-blur-md border border-white p-10 rounded-lg shadow-lg z-10"
              dir="rtl"
            >
              <motion.h2
                className="text-xl font-bold mb-4 text-center text-white"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                تایید حذف
              </motion.h2>
              <motion.p
                className="mb-4 text-center text-gray-200 border-b border-white pb-3"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                آیا از حذف این محصول اطمینان دارید؟
              </motion.p>
              <motion.div
                className="flex justify-center space-x-reverse space-x-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  بله
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  خیر
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
