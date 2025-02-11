"use client";
import React, { useState } from "react";
import Image from "next/image";
import ImageSelectorModal from "../components/forms/ImageSelectorModal";
interface ImageFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storeId: string;
}

export default function ParentComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const handleImageSelect = (image: ImageFile) => {
    setSelectedImage(image);
    // Do something with the selected image
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>انتخاب تصویر</button>

      {selectedImage && (
        <div>
          <Image
            src={selectedImage.fileUrl}
            alt={selectedImage.fileName}
            width={300}
            height={300}
            className="object-cover w-full h-48"
          />
        </div>
      )}

      <ImageSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
}
