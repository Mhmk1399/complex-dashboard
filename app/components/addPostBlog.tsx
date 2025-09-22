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
import { motion } from "framer-motion";
import { CustomEditor } from "@/types/editor";
import Image from "@tiptap/extension-image";
import { TextSelection } from "prosemirror-state";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Blog, ImageFile } from "@/types/type";
import ImageSelectorModal from "./ImageSelectorModal";
import { AIBlogGenerator } from "./AIBlogGenerator";

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
    className={`p-2 rounded-md transition-colors ${
      active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
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
    <div className="absolute mt-2 p-2 bg-white rounded-lg shadow-xl border z-50 w-48">
      <div className="grid grid-cols-10 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            aria-label="color"
            className="w-6 h-6 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
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
    setImages(prev => [...prev, image.fileUrl]);
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
          class: "text-blue-500 underline hover:text-blue-700",
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
        class: "prose prose-lg max-w-none focus:outline-none min-h-[200px] rtl",
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
      <ToastContainer position="top-center" autoClose={3000} rtl={true} />
      <div className="max-w-4xl mx-6 md:mt-36 my-16 lg:mx-auto">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text"
        >
          {isEditMode ? "ویرایش بلاگ" : "افزودن بلاگ جدید"}
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {/* SEO Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-blue-50/50 rounded-xl p-6 border border-blue-100"
          >
            <div className="relative">
              <h1
                className="text-xl text-right mb-4 flex items-center justify-start gap-2"
                onMouseEnter={() => setShowSeoTips(true)}
                onMouseLeave={() => setShowSeoTips(false)}
              >
                بخش سئو
                <i className="fas fa-info-circle cursor-help text-blue-400 hover:text-blue-600 transition-colors" />
              </h1>

              {showSeoTips && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 bg-blue-600 backdrop-blur-md border-2 border-white/50 rounded-xl shadow-lg p-5 right-0 mt-1 text-sm text-white"
                >
                  <ul className="text-right space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      عنوان سئو باید کوتاه و گویا باشد
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      از کلمات کلیدی مرتبط استفاده کنید
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle" />
                      توضیحات کوتاه را در 160 کاراکتر بنویسید
                    </li>
                  </ul>
                </motion.span>
              )}
            </div>
            
            <label className="block text-sm font-medium text-gray-700 text-right mb-2">
              عنوان سئو
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              placeholder="عنوان سئو را وارد کنید..."
            />
            {errors.seoTitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-2 flex items-center gap-2"
              >
                <i className="fas fa-exclamation-circle" />
                {errors.seoTitle}
              </motion.p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right my-2">
                توضیحات کوتاه
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 min-h-[100px]"
                placeholder="توضیحات کوتاه را وارد کنید..."
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-2 flex items-center gap-2"
                >
                  <i className="fas fa-exclamation-circle" />
                  {errors.description}
                </motion.p>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-4 mt-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="برچسبها را وارد کنید..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-500 text-white px-6 rounded-xl hover:bg-blue-600 transition-all duration-300"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={index}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Images Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-blue-50/50 rounded-xl p-6 border border-blue-100"
          >
            <label className="block mb-4 text-xl font-bold text-blue-700 flex items-center gap-2">
              <i className="fas fa-images" />
              تصاویر بلاگ (حداکثر 5 تصویر)
            </label>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setIsImageSelectorOpen(true)}
                disabled={images.length >= 5}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  images.length >= 5
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50"
                }`}
              >
                انتخاب تصویر ({images.length}/5)
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`تصویر ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? "اصلی" : index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Title Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <label className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
              <i className="fas fa-pen-fancy" />
              عنوان بلاگ
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              placeholder="عنوان اصلی بلاگ را وارد کنید..."
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-2 flex items-center gap-2"
              >
                <i className="fas fa-exclamation-circle" />
                {errors.title}
              </motion.p>
            )}
          </motion.div>

          {/* Content Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 text-right">
                محتوای بلاگ
              </label>
              <AIBlogGenerator
                blogData={{
                  title,
                  seoTitle,
                  description
                }}
                onBlogGenerated={(content) => {
                  editor?.commands.setContent(content);
                }}
              />
            </div>
            
            <div className="border border-gray-300 rounded-lg">
              <div className="bg-gray-50 p-2 border-b border-gray-300 flex flex-wrap gap-2">
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

                {/* Heading Buttons */}
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

                {/* Image Insertion Dropdown */}
                {images.length > 0 && (
                  <div className="relative">
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
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      <option value="">درج تصویر</option>
                      {images.map((image, index) => (
                        <option key={index} value={image}>
                          تصویر {index + 1} {index === 0 ? "(اصلی)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <EditorContent editor={editor} />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {errors.content}
                  </p>
                )}
              </div>
              
              <div className="mt-2 text-sm text-gray-500 text-right border-t p-2">
                تعداد کلمات: {wordCount}
              </div>
            </div>
          </div>

          <div className="text-right pt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
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
    </>
  );
}