import React, { useState, useEffect } from "react";
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

interface Blog {
  _id: string;
  title: string;
  content: string;
  description: string;
  seoTitle: string;
}

export const EditBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");

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
          {colors.map((color, index) => (
            <button
              key={`${color}-${index}`} // Added unique key
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

  // const ImageUploadButton = ({ editor }: { editor: any }) => {
  //     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //         if (e.target.files?.length) {
  //             const file = e.target.files[0];
  //             const alt = window.prompt('Enter alt text for image');

  //             const reader = new FileReader();
  //             reader.onload = () => {
  //                 if (typeof reader.result === 'string') {
  //                     editor?.chain().focus().setImage({
  //                         src: reader.result,
  //                         alt: alt || '',
  //                     }).run();
  //                 }
  //             };
  //             reader.readAsDataURL(file);
  //         }
  //     };

  //     return (
  //         <div className="relative">
  //             <input
  //                 type="file"
  //                 accept="image/*"
  //                 onChange={handleFileChange}
  //                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //             />
  //             <MenuButton onClick={() => { }}>
  //                 <i className="fas fa-upload"></i>
  //             </MenuButton>
  //         </div>
  //     );
  // };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setBlogs(data.blogs); // Access the blogs array from the response
        console.log(data.blogs);

        setLoading(false);
      } catch (error) {
        console.log("Error fetching blogs:", error);
        setLoading(false); // Make sure to set loading to false even on error
      }
    };

    fetchBlogs();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            dir: "auto",
          },
        },
        bulletList: false,
        orderedList: false,
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

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().setLink({ href: url }).run();
  };

  const handleBlogSelect = (blog: Blog) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setDescription(blog.description);
    setSeoTitle(blog.seoTitle);
    editor?.commands.setContent(blog.content);
  };
  // Add this delete handler function inside the EditBlogs component
  const handleDelete = async () => {
    if (!selectedBlog?._id) return;

    try {
      const response = await fetch(`/api/blogs/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: selectedBlog._id,
        },
      });

      if (response.ok) {
        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog._id !== selectedBlog._id)
        );
        setSelectedBlog(null);
        setTitle("");
        editor?.commands.setContent("");
        toast.success("بلاگ با موفقیت حذف شد", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        throw new Error("Failed to delete blog");
      }
    } catch (error) {
      console.log("Error deleting blog:", error);
      toast.error("خطا در حذف بلاگ");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = editor?.getHTML() ?? "";

    if (!selectedBlog?._id) return;

    try {
      const response = await fetch(`/api/blogs/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: selectedBlog._id,
        },
        body: JSON.stringify({
          title,
          content,
          description,
          seoTitle,
        }),
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === selectedBlog._id ? updatedBlog : blog
          )
        );
        toast.success("بلاگ با موفقیت به روز رسانی شد", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        throw new Error("Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(" خطا در به روز رسانی بلاگ", {
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
      <ToastContainer  rtl={true} />
      {loading ? (
        <div>
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      ) : (
        <div
          className="max-w-4xl lg:mx-auto mx-5 p-6 bg-gray-100 rounded-xl shadow-sm"
          dir="rtl"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            ویرایش بلاگ‌ها
          </h2>

          <div className="mb-6">
            <select
              key={selectedBlog?._id}
              className="w-full p-2 border rounded-lg"
              value={selectedBlog?._id || ""}
              onChange={(e) => {
                console.log("Selected ID:", e.target.value);
                const selectedBlogId = e.target.value;
                const blog = blogs.find((blog) => blog._id === selectedBlogId);
                if (blog) {
                  handleBlogSelect(blog);
                }
              }}
            >
              <option value="">انتخاب بلاگ برای ویرایش</option>
              {blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </select>
          </div>

          {selectedBlog && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <div className="border rounded-lg p-2 mb-6">
                  <h1 className="text-2xl my-2">سئو</h1>
                  <label className="block text-sm font-medium text-gray-700 text-right mb-2">
                    عنوان بلاگ
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="عنوان بلاگ را وارد کنید"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-right my-2">
                      توضیحات کوتاه
                    </label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="توضیحات کوتاه بلاگ را وارد کنید"
                    />
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-2">
                  عنوان بلاگ
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="عنوان بلاگ را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-2">
                  محتوای بلاگ
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-2 border-b border-gray-300 flex flex-wrap gap-2">
                    <MenuButton
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      active={editor?.isActive("bold")}
                    >
                      <i className="fas fa-bold"></i>
                    </MenuButton>

                    <MenuButton
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      active={editor?.isActive("italic")}
                    >
                      <i className="fas fa-italic"></i>
                    </MenuButton>

                    <MenuButton
                      onClick={setLink}
                      active={editor?.isActive("link")}
                    >
                      <i className="fas fa-link"></i>
                    </MenuButton>

                    <MenuButton
                      onClick={() => editor?.chain().focus().unsetLink().run()}
                      active={false}
                    >
                      <i className="fas fa-unlink"></i>
                    </MenuButton>

                    {/* Heading buttons */}
                    {[1, 2, 3, 4, 5].map((level) => (
                      <MenuButton
                        key={`heading-${level}`} // Added unique key
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({
                              level: level as 1 | 2 | 3 | 4 | 5,
                            })
                            .run()
                        }
                        active={editor?.isActive("heading", { level })}
                      >
                        H{level}
                      </MenuButton>
                    ))}

                    {/* Color pickers */}
                    <div className="relative">
                      <MenuButton
                        onClick={() =>
                          setShowTextColorPicker(!showTextColorPicker)
                        }
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

                    {/* Alignment buttons */}
                    {["left", "center", "right"].map((align) => (
                      <MenuButton
                        key={`align-${align}`} // Added unique key
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .setTextAlign(align as "left" | "center" | "right")
                            .run()
                        }
                        active={editor?.isActive({ textAlign: align })}
                      >
                        <i className={`fas fa-align-${align}`}></i>
                      </MenuButton>
                    ))}

                    {/* List buttons */}
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

                    {/* <ImageUploadButton editor={editor} /> */}
                  </div>

                  <div className="p-4 bg-white">
                    <EditorContent editor={editor} />
                  </div>
                  <div className="mt-2 text-sm text-gray-500 text-right border-t p-2">
                    تعداد کلمات: {wordCount}
                  </div>
                </div>
              </div>

              <div className="text-right pt-4 flex justify-start gap-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  حذف بلاگ
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  بروزرسانی بلاگ
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
};
