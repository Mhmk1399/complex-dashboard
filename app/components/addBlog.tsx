"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";
import { CustomEditor } from "@/types/editor";
import Image from "@tiptap/extension-image";
import { TextSelection } from "prosemirror-state";
import { Blog, ImageFile } from "@/types/type";
import ImageSelectorModal from "./ImageSelectorModal";
import { AIBlogGenerator } from "./AIBlogGenerator";
import toast from "react-hot-toast";
import { FiImage, FiX } from "react-icons/fi";

const MenuButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    aria-label="addblog"
    type="button"
    onClick={onClick}
    className={`p-1.5 sm:p-2 rounded-lg text-sm transition-all duration-200 ${
      active
        ? "bg-slate-500 text-white shadow-sm"
        : "hover:bg-slate-100 text-slate-700"
    }`}
  >
    {children}
  </button>
);

const ColorPickerDropdown = ({
  isOpen,
  onClose,
  onColorSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}) => {
  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#d9d9d9",
    "#efefef",
    "#f3f3f3",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute mt-1 p-2 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 z-50 w-44">
      <div className="grid grid-cols-10 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            aria-label="color"
            className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => {
              onColorSelect(color);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function AddPostBlog() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [showSeoTips, setShowSeoTips] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    seoTitle: "",
    description: "",
    title: "",
    content: "",
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleAddTag = () => {
    if (tags.length >= 3) {
      toast.error("شما فقط میتوانید ۳ برچسب اضافه کنید");
      return;
    }

    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const isWithinSingleBlock = (editor: CustomEditor) => {
    const { $from, $to } = editor.state.selection;
    return $from.sameParent($to);
  };

  const isolateSelectionToOwnBlock = (editor: CustomEditor) => {
    const { state, view } = editor;
    const { from, to, empty, $from } = state.selection;

    if (empty) return false;
    if (!isWithinSingleBlock(editor)) return false;
    if (from === $from.start() && to === $from.end()) return false;

    let tr = state.tr;
    tr = tr.split(to);
    const mappedFrom = tr.mapping.map(from);
    tr = tr.split(mappedFrom);
    view.dispatch(tr);

    const middlePos = tr.mapping.map(from) + 1;
    const $pos = view.state.doc.resolve(
      Math.min(middlePos, view.state.doc.content.size)
    );
    view.dispatch(view.state.tr.setSelection(TextSelection.near($pos)));

    return true;
  };

  const toggleHeadingOnSelection = (
    editor: CustomEditor,
    level: 1 | 2 | 3 | 4 | 5 | 6
  ) => {
    if (!editor.state.selection.empty && isWithinSingleBlock(editor)) {
      isolateSelectionToOwnBlock(editor);
    }
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const handleImageSelect = (image: ImageFile) => {
    if (images.length >= 5) {
      toast.error("حداکثر 5 تصویر میتوانید اضافه کنید");
      return;
    }
    setImages((prev) => [...prev, image.fileUrl]);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      seoTitle: "",
      description: "",
      title: "",
      content: "",
    };

    if (!seoTitle.trim()) {
      newErrors.seoTitle = "عنوان سئو الزامی است";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "توضیحات کوتاه الزامی است";
      isValid = false;
    }

    if (!title.trim()) {
      newErrors.title = "عنوان بلاگ الزامی است";
      isValid = false;
    }

    if (!editor?.getText().trim()) {
      newErrors.content = "محتوای بلاگ الزامی است";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { dir: "auto" } },
        bulletList: false,
        orderedList: false,
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          dir: "auto",
        },
      }),
      BulletList.configure({
        keepMarks: true,
        HTMLAttributes: { class: "list-disc ml-4" },
      }),
      OrderedList.configure({
        keepMarks: true,
        HTMLAttributes: { class: "list-decimal ml-4" },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-slate-500 underline hover:text-slate-700",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "w-full h-64 object-cover rounded-lg my-4",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] sm:min-h-[200px] rtl [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h4]:text-base sm:[&_h4]:text-lg [&_h4]:font-bold [&_h5]:text-sm sm:[&_h5]:text-base [&_h5]:font-bold [&_h6]:text-xs sm:[&_h6]:text-sm [&_h6]:font-bold",
      },
    },
    onUpdate: ({ editor }: { editor: CustomEditor }) => {
      const text = editor.getText();
      const words: string[] = text
        .trim()
        .split(/\s+/)
        .filter((word: string) => word !== "");
      setWordCount(words.length);
    },
  }) as CustomEditor;

  useEffect(() => {
    if (isEditMode && editId && editor) {
      fetchBlogData();
    }
  }, [isEditMode, editId, editor]);

  const fetchBlogData = async () => {
    try {
      const response = await fetch("/api/blog");
      const blogs = await response.json();
      const blog = blogs.find((b: Blog) => b._id === editId);

      if (blog) {
        setTitle(blog.title);
        setDescription(blog.description);
        setSeoTitle(blog.seoTitle);
        setImages([blog.image, blog.secondImage].filter(Boolean));
        setTags(blog.tags || []);

        setTimeout(() => {
          if (editor && blog.content) {
            editor.commands.setContent(blog.content);
          }
        }, 100);
      }
    } catch (error) {
      console.log(error);
      toast.error("خطا در بارگذاری بلاگ");
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().setLink({ href: url }).run();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const content = editor?.getHTML();
    const storeId = localStorage.getItem("storeId");

    try {
      const blogData = {
        id: isEditMode ? editId : crypto.randomUUID(),
        title,
        description,
        content,
        seoTitle,
        authorId: "1",
        storeId: storeId,
        image: images[0] || "",
        secondImage: images[1] || "",
        tags,
        readTime: Math.ceil(wordCount / 200),
      };

      const response = await fetch("/api/blog", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error("Failed to save blog");
      }

      if (!isEditMode) {
        setTitle("");
        setDescription("");
        setSeoTitle("");
        setImages([]);
        setTags([]);
        editor?.commands.clearContent();
      }

      toast.success(
        isEditMode ? "بلاگ با موفقیت بروزرسانی شد" : "وبلاگ با موفقیت ایجاد شد"
      );
    } catch (error) {
      console.log("Error saving blog:", error);
      toast.error("خطا در ذخیره بلاگ");
    }
  };

  return (
    <>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 mt-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-slate-900">
          {isEditMode ? "ویرایش بلاگ" : "افزودن بلاگ جدید"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
          dir="rtl"
        >
          {/* SEO Section */}
          <div className="backdrop-blur-sm rounded-lg  sm:rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <div className="relative">
              <h3
                className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 flex items-center justify-start gap-2"
                onMouseEnter={() => setShowSeoTips(true)}
                onMouseLeave={() => setShowSeoTips(false)}
              >
                بخش سئو
                <i className="fas fa-info-circle cursor-help text-slate-500 hover:text-slate-600 transition-colors text-sm" />
              </h3>

              {showSeoTips && (
                <span className="fade-in absolute z-10 bg-slate-900 rounded-lg shadow-xl p-4 right-0 mt-1 text-xs sm:text-sm text-white w-64 sm:w-auto">
                  <ul className="text-right space-y-1.5 sm:space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-slate-400" />
                      عنوان سئو باید کوتاه و گویا باشد
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-slate-400" />
                      از کلمات کلیدی مرتبط استفاده کنید
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-slate-400" />
                      توضیحات کوتاه را در 160 کاراکتر بنویسید
                    </li>
                  </ul>
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  عنوان سئو
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="عنوان سئو را وارد کنید..."
                />
                {errors.seoTitle && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1.5 flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle" />
                    {errors.seoTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  توضیحات کوتاه
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all min-h-[80px] sm:min-h-[100px]"
                  placeholder="توضیحات کوتاه را وارد کنید..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1.5 flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  برچسب‌ها (حداکثر 3)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    placeholder="برچسبها را وارد کنید..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-slate-500 text-white px-4 sm:px-6 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <i className="fas fa-plus text-sm"></i>
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="scale-in bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs sm:text-sm font-medium border border-slate-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setTags(tags.filter((_, i) => i !== index))
                          }
                          className="hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <label className="  mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-images text-slate-500" />
              تصاویر بلاگ (حداکثر 5 تصویر)
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsImageSelectorOpen(true)}
                disabled={images.length >= 5}
                className={`px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium transition-all ${
                  images.length >= 5
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-500 text-white hover:bg-slate-600"
                }`}
              >
                انتخاب تصویر ({images.length}/5)
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                disabled={images.length >= 5}
                className={`px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium transition-all ${
                  images.length >= 5
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white"
                }`}
              >
                آپلود تصویر
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`تصویر ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="absolute top-1 right-1 bg-slate-500 text-white text-xs px-2 py-0.5 rounded">
                      {index === 0 ? "اصلی" : index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <label className="  text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <i className="fas fa-pen-fancy text-slate-500 text-sm" />
              عنوان بلاگ
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              placeholder="عنوان اصلی بلاگ را وارد کنید..."
            />
            {errors.title && (
              <p className="text-red-500 text-xs sm:text-sm mt-1.5 flex items-center gap-1.5">
                <i className="fas fa-exclamation-circle" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-3">
              <label className="block text-sm font-medium text-slate-700">
                محتوای بلاگ
              </label>
              <AIBlogGenerator
                blogData={{
                  title,
                  seoTitle,
                  description,
                }}
                onBlogGenerated={(content) => {
                  editor?.commands.setContent(content);
                }}
              />
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-2 border-b border-slate-300 flex flex-wrap gap-1 sm:gap-1.5">
                <MenuButton
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  active={editor?.isActive("bold")}
                >
                  <i className="fas fa-bold"></i>
                </MenuButton>

                <MenuButton
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  active={editor?.isActive("italic")}
                >
                  <i className="fas fa-italic"></i>
                </MenuButton>

                <MenuButton onClick={setLink} active={editor?.isActive("link")}>
                  <i className="fas fa-link"></i>
                </MenuButton>

                <MenuButton
                  onClick={() => editor?.chain().focus().unsetLink().run()}
                  active={false}
                >
                  <i className="fas fa-unlink"></i>
                </MenuButton>

                <MenuButton
                  onClick={() => editor && toggleHeadingOnSelection(editor, 1)}
                  active={editor?.isActive("heading", { level: 1 })}
                >
                  H1
                </MenuButton>

                <MenuButton
                  onClick={() => editor && toggleHeadingOnSelection(editor, 2)}
                  active={editor?.isActive("heading", { level: 2 })}
                >
                  H2
                </MenuButton>

                <MenuButton
                  onClick={() => editor && toggleHeadingOnSelection(editor, 3)}
                  active={editor?.isActive("heading", { level: 3 })}
                >
                  H3
                </MenuButton>

                <MenuButton
                  onClick={() => editor && toggleHeadingOnSelection(editor, 4)}
                  active={editor?.isActive("heading", { level: 4 })}
                >
                  H4
                </MenuButton>

                <MenuButton
                  onClick={() => editor && toggleHeadingOnSelection(editor, 5)}
                  active={editor?.isActive("heading", { level: 5 })}
                >
                  H5
                </MenuButton>

                <div className="relative">
                  <MenuButton
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    active={showTextColorPicker}
                  >
                    <i className="fas fa-font"></i>
                  </MenuButton>
                  <ColorPickerDropdown
                    isOpen={showTextColorPicker}
                    onClose={() => setShowTextColorPicker(false)}
                    onColorSelect={(color) =>
                      editor?.chain().focus().setColor(color).run()
                    }
                  />
                </div>

                <div className="relative">
                  <MenuButton
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    active={showBgColorPicker}
                  >
                    <i className="fas fa-fill-drip"></i>
                  </MenuButton>
                  <ColorPickerDropdown
                    isOpen={showBgColorPicker}
                    onClose={() => setShowBgColorPicker(false)}
                    onColorSelect={(color) =>
                      editor?.chain().focus().setHighlight({ color }).run()
                    }
                  />
                </div>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("left").run()
                  }
                  active={editor?.isActive({ textAlign: "left" })}
                >
                  <i className="fas fa-align-left"></i>
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("center").run()
                  }
                  active={editor?.isActive({ textAlign: "center" })}
                >
                  <i className="fas fa-align-center"></i>
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().setTextAlign("right").run()
                  }
                  active={editor?.isActive({ textAlign: "right" })}
                >
                  <i className="fas fa-align-right"></i>
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  active={editor?.isActive("bulletList")}
                >
                  <i className="fas fa-list-ul"></i>
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  active={editor?.isActive("orderedList")}
                >
                  <i className="fas fa-list-ol"></i>
                </MenuButton>

                {images.length > 0 && (
                  <select
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      const imageUrl = e.target.value;
                      const imageIndex = images.indexOf(imageUrl);

                      editor
                        ?.chain()
                        .focus()
                        .setImage({
                          src: imageUrl,
                          alt: `تصویر ${imageIndex + 1}`,
                        })
                        .run();

                      e.target.value = "";
                    }}
                    className="px-2 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg backdrop-blur-sm text-slate-700"
                  >
                    <option value="">درج تصویر</option>
                    {images.map((image, index) => (
                      <option key={index} value={image}>
                        تصویر {index + 1} {index === 0 ? "(اصلی)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 sm:p-4 backdrop-blur-sm">
                <EditorContent editor={editor} />
                {errors.content && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2">
                    {errors.content}
                  </p>
                )}
              </div>

              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-600 bg-slate-50 border-t border-slate-200">
                تعداد کلمات: {wordCount}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-slate-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-slate-600 transition-all font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {isEditMode ? "بروزرسانی بلاگ" : "انتشار بلاگ"}
            </button>
          </div>
        </form>
      </div>

      <ImageSelectorModal
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelectImage={handleImageSelect}
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div dir="rtl" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">آپلود تصاویر</h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFiles([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <input
              type="file"
              id="blogUploadInput"
              onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
              multiple
              accept=".jpeg,.jpg,.png,.gif,.webp"
              className="hidden"
            />
            <label
              htmlFor="blogUploadInput"
              className={`w-full block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploadFiles.length > 0
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <FiImage className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <div className="text-base font-semibold text-slate-700">
                {uploadFiles.length > 0 ? `${uploadFiles.length} فایل انتخاب شده` : "انتخاب تصاویر"}
              </div>
            </label>

            {uploadProgress && (
              <div className="mt-4 bg-slate-50 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-700 mb-2">{uploadProgress}</div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-slate-600 h-2 rounded-full animate-progress" />
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                if (uploadFiles.length === 0) return;
                setUploading(true);
                const uploadedUrls: string[] = [];
                for (let i = 0; i < uploadFiles.length; i++) {
                  setUploadProgress(`آپلود ${i + 1} از ${uploadFiles.length}`);
                  const formData = new FormData();
                  formData.append("file", uploadFiles[i]);
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.success) uploadedUrls.push(data.url);
                  } catch (error) {
                    console.log(error);
                  }
                }
                setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
                setUploading(false);
                setUploadProgress("");
                setUploadFiles([]);
                setIsUploadModalOpen(false);
                toast.success(`${uploadedUrls.length} تصویر آپلود شد`);
              }}
              disabled={uploadFiles.length === 0 || uploading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-slate-900 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white rounded-lg font-medium transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {uploading ? "در حال آپلود..." : "آپلود تصاویر"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
