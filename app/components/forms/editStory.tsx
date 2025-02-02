import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Story {
  _id: string;
  title: string;
  image: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface EditStoryProps {
  isOpen: boolean;
  onClose: () => void;
  fetchStories: () => void;
}

export const EditStory: React.FC<EditStoryProps> = ({ isOpen, onClose, fetchStories }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    fetchAllStories();
  }, [isOpen]);

  const fetchAllStories = async () => {
    try {
      const response = await fetch('/api/story', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStories(data);
    } catch (error) {
      toast.error('خطا در دریافت استوری‌ها');
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      const response = await fetch('/api/story', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ _id: storyId }),
      });

      if (response.ok) {
        toast.success('استوری با موفقیت حذف شد');
        fetchAllStories();
        fetchStories();
      } else {
        toast.error('خطا در حذف استوری');
      }
    } catch (error) {
      toast.error('خطا در حذف استوری');
    }
  };

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setTitle(story.title);
    setImage(story.image);
  };
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStory) return;

    try {
      const response = await fetch('/api/story', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          _id: selectedStory._id,
          title,
          image,
        }),
      });

      if (response.ok) {
        toast.success('استوری با موفقیت بروزرسانی شد');
        setSelectedStory(null);
        setTitle('');
        setImage('');
        fetchAllStories();
        fetchStories();
      } else {
        toast.error('خطا در بروزرسانی استوری');
      }
    } catch (error) {
      toast.error('خطا در بروزرسانی استوری');
    }
  };

  return (
    <AnimatePresence>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-10 overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          className="flex items-center justify-center min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

          <motion.div
            className="relative bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/50 max-w-2xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <h2 className="text-xl font-bold mb-4 text-white">مدیریت استوری‌ها</h2>

            {selectedStory ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">عنوان</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded bg-white/10 text-white border border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">لینک تصویر</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-2 rounded bg-white/10 text-white border border-white/30"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    بروزرسانی
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStory(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    لغو
                  </button>
                </div>
              </form>
            ) : (
                <>
            {stories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 text-lg">هیچ استوری اضافه نشده است</p>
              </div>
            ) : (
              <div className="space-y-4">
               {stories.map((story) => (
  <div
    key={story._id}
    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
  >
    <div className="flex items-center gap-4">
      {isValidUrl(story.image) ? (
        <Image
          src={story.image}
          alt={story.title}
          width={50}
          height={50}
          className="rounded-lg"
        />
      ) : (
        <div className="w-[50px] h-[50px] bg-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )}
      <span className="text-white">{story.title}</span>
    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(story._id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            </>
            )}
          </motion.div>
        </motion.div>
      </Dialog>
    </AnimatePresence>
  );
};
