import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { AIBlogGenerator } from "./AIBlogGenerator";

export const AddBlog = () => {
  const [title, setTitle] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [description, setDescription] = useState(""); // Add this state
  const [seoTitle, setSeoTitle] = useState(""); // Add this state
  const [showSeoTips, setShowSeoTips] = useState(false);

  const [errors, setErrors] = useState({
    seoTitle: "",
    description: "",
    title: "",
    content: "",
  });
  // Add this component for the color picker dropdown
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
      "#e6b8af",
      "#f4cccc",
      "#fce5cd",
      "#fff2cc",
      "#d9ead3",
      "#d0e0e3",
      "#c9daf8",
      "#cfe2f3",
      "#d9d2e9",
      "#ead1dc",
    ];

    if (!isOpen) return null;

    return (
      <div className="absolute mt-2 p-2 bg-white rounded-lg shadow-xl border z-50 w-48">
        <div className="grid grid-cols-10 gap-1">
          {colors.map((color) => (
            <button
              key={color}
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            dir: "auto",
          },
        },
        bulletList: false, // Disable the StarterKit version
        orderedList: false, // Disable the StarterKit version
      }),
      BulletList.configure({
        keepMarks: true,
        HTMLAttributes: {
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),

      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }), // Add this extension
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
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[200px] rtl",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word !== "");
      setWordCount(words.length);
    },
  });

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    editor?.chain().focus().setLink({ href: url }).run();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const content = editor?.getHTML();
    const storeId = localStorage.getItem("storeId");
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          title,
          description, // Add description to the request body
          content,
          seoTitle, // Add seoTitle to the request body
          authorId: "1",
          storeId: storeId,
        }),
      });

      if (!response.ok) {
        console.log("Failed to create blog:", response.statusText);
      }

      // Clear form
      setTitle("");
      setDescription(""); // Clear description after successful submission
      setSeoTitle(""); // Clear seoTitle after successful submission
      editor?.commands.clearContent();
      toast.success("وبلاگ با موفقیت ایجاد شد", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      // Show success message or redirect
      setDescription(""); // Clear description after successful submission
    } catch (error) {
      console.log("Error creating blog:", error);
      toast.error("خطا در ایجاد وبلاگ", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

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
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} rtl={true} />
      <div className="max-w-4xl mx-6 md:mt-36 my-16 lg:mx-auto">
        {/* rest of your code */}

        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text"
        >
          افزودن بلاگ جدید
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-blue-50/50 rounded-xl p-6 border border-blue-100"
          >
            <div className="relative">
              <h1
                className="text-
                xl text-right mb-4 flex items-center justify-start gap-2"
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
              عنوان بلاگ
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
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
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
          </motion.div>

          {/* Add this new input field */}

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <label className=" text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
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
                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  active={editor?.isActive("heading", { level: 1 })}
                >
                  H1
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  active={editor?.isActive("heading", { level: 2 })}
                >
                  H2
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  active={editor?.isActive("heading", { level: 3 })}
                >
                  H3
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 4 }).run()
                  }
                  active={editor?.isActive("heading", { level: 4 })}
                >
                  H4
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 5 }).run()
                  }
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
                {/* <ImageUploadButton editor={undefined} /> */}
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
              انتشار بلاگ
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
