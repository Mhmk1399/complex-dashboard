import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export const AddBlog = () => {
  const [title, setTitle] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
          rel: 'follow'
        },
      }),
    ],
  });

  const setLink = () => {
    if (editor) {
      if (!editor.isActive('link')) {
        const url = window.prompt('URL');
        if (url) {
          editor
            .chain()
            .focus()
            .setLink({ href: url })
            .run();
        }
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: '' })
          .insertContent(' ')
          .run();
      }
    }
  };  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editor?.isActive('link')) {
        editor
          .chain()
          .focus()
          .setLink({ href: '' })
          .insertContent(' ')
          .run();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML();
    console.log({ title, content });
  };

  const MenuButton = ({ onClick, active, children }: { onClick: () => void, active?: boolean, children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        active 
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
          <label className="block text-sm font-medium text-gray-700 text-right mb-2">
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
            </div>
            
            <div className="p-4 bg-white">
              <EditorContent editor={editor} />
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
