import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'


export const AddBlog = () => {
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Add this component for the color picker dropdown
  const ColorPickerDropdown = ({
    isOpen,
    onClose,
    onColorSelect
  }: {
    isOpen: boolean,
    onClose: () => void,
    onColorSelect: (color: string) => void
  }) => {
    const colors = [
      '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
      '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
      '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
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
  const ImageUploadButton = ({ editor }: { editor: any }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        const file = e.target.files[0];
        const alt = window.prompt('Enter alt text for image');

        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            editor?.chain().focus().setImage({
              src: reader.result,
              alt: alt || '',
            }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <MenuButton onClick={() => { }}>
          <i className="fas fa-upload"></i>
        </MenuButton>
      </div>
    );
  };


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            dir: 'auto',
          },
        },
        bulletList: false, // Disable the StarterKit version
        orderedList: false, // Disable the StarterKit version
      }),
      BulletList.configure({
        keepMarks: true,
        HTMLAttributes: {
          class: 'list-disc ml-4',
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        HTMLAttributes: {
          class: 'list-decimal ml-4',
        },
      }),

      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }), // Add this extension
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] rtl',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(word => word !== '');
      setWordCount(words.length);
    },
  });

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    editor?.chain().focus().setLink({ href: url }).run();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML();
    
    try {
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        })
      });
  
      if (!response.ok) {
        console.log('Failed to create blog:', response.statusText);
        
      }
  
      const data = await response.json();
      
      // Clear form
      setTitle('');
      editor?.commands.clearContent();
      
      // Show success message or redirect
      alert('Blog posted successfully!');
      
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to post blog');
    }
  };
  


  const MenuButton = ({ onClick, active, children }: { onClick: () => void, active?: boolean, children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${active
          ? 'bg-blue-100 text-blue-600'
          : 'hover:bg-gray-100 text-gray-600'
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-3xl font-bold mb-8 text-right text-gray-800">افزودن بلاگ جدید</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 text-right mb-2">
            عنوان بلاگ
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="عنوان بلاگ را وارد کنید"
          />
        </div>

        <div>
          <label className="block  text-sm font-medium text-gray-700 text-right mb-2">
            محتوای بلاگ
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-2 border-b border-gray-300 flex gap-2">
              <MenuButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive('bold')}
              >
                <i className="fas fa-bold"></i>
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive('italic')}
              >
                <i className="fas fa-italic"></i>
              </MenuButton>

              <MenuButton
                onClick={setLink}
                active={editor?.isActive('link')}
              >
                <i className="fas fa-link"></i>
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().unsetLink().run()}
                active={false}
              >
                <i className="fas fa-unlink"></i>
              </MenuButton>
              <MenuButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor?.isActive('heading', { level: 1 })}
              >
                H1
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor?.isActive('heading', { level: 2 })}
              >
                H2
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor?.isActive('heading', { level: 3 })}
              >
                H3
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                active={editor?.isActive('heading', { level: 4 })}
              >
                H4
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()}
                active={editor?.isActive('heading', { level: 5 })}
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
                  onColorSelect={(color) => editor?.chain().focus().setColor(color).run()}
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
                  onColorSelect={(color) => editor?.chain().focus().setHighlight({ color }).run()}
                />
              </div>
              <MenuButton
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                active={editor?.isActive({ textAlign: 'left' })}
              >
                <i className="fas fa-align-left"></i>
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                active={editor?.isActive({ textAlign: 'center' })}
              >
                <i className="fas fa-align-center"></i>
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                active={editor?.isActive({ textAlign: 'right' })}
              >
                <i className="fas fa-align-right"></i>
              </MenuButton>
              <MenuButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive('bulletList')}
              >
                <i className="fas fa-list-ul"></i>
              </MenuButton>

              <MenuButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                active={editor?.isActive('orderedList')}
              >
                <i className="fas fa-list-ol"></i>
              </MenuButton>
              <ImageUploadButton editor={undefined} />


            </div>


            <div className="p-4 bg-white">
              <EditorContent editor={editor} />
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
  );
};
