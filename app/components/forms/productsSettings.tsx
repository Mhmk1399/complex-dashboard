'use client';
import  { useState } from 'react';

interface ProductSettings {
  type: string;
  blocks: {
    imageSrc: string;
    imageAlt: string;
    name: string;
    description: string;
    category: string;
    price: string;
    status: string;
    discount: string;
    id: string;
    innventory: string;
   
  };
}

export const ProductsSettings = () => {
  const [settings, setSettings] = useState<ProductSettings>({
    type: 'productDetails',
    blocks: {
      imageSrc: '/assets/images/product-detail.jpg',
      imageAlt: 'محصول',
      name: 'نام محصول',
      description: 'توضیحات محصول',
      category: 'دسته بندی',
      price: '0',
      status: 'available',
      discount: '0',
      id: '1',
      innventory: '0',
     
    }
  });
  

  // Changes settings general
  const handleChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        ...(section === 'blocks' ? { [field]: value } : {}),
      
      }
    }));
    console.log(settings.blocks);
    
  };
  
  

  const handelSave = async () => {
    try {
      const productData = {
        images: {
          imageSrc: settings.blocks.imageSrc,
          imageAlt: settings.blocks.imageAlt
        },
        name: settings.blocks.name,
        description: settings.blocks.description,
        category: settings.blocks.category,
        price: settings.blocks.price,
        status: settings.blocks.status,
        discount: settings.blocks.discount,
        id: settings.blocks.id,
        innventory: settings.blocks.innventory,
      };
  
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
  
      if (response.ok) {
        console.log('Product updated successfully');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  

  return (
    <div className="p-6 mx-auto lg:mx-10 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4" dir="rtl">
      <h2 className="text-2xl font-bold mb-2 lg:col-span-2 col-span-1">تنظیمات محصول</h2>

      <div>
        <label className="block mb-2">تصویر محصول</label>
        <input
          type="file"
          onChange={(e) => handleChange('blocks', 'imageSrc', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
     
      <div>
        <label className="block mb-2">متن جایگزین تصویر</label>
        <input
          type="text"
          value={settings.blocks.imageAlt}
          onChange={(e) => handleChange('blocks', 'imageAlt', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">نام محصول</label>
        <input
          type="text"
          value={settings.blocks.name}
          onChange={(e) => handleChange('blocks', 'name', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2">توضیحات</label>
        <textarea
          value={settings.blocks.description}
          onChange={(e) => handleChange('blocks', 'description', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2"> category</label>
        <input
          type="text"
          value={settings.blocks.category}
          onChange={(e) => handleChange('blocks', 'category', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2"> price</label>
        <input
          type="text"
          value={settings.blocks.price}
          onChange={(e) => handleChange('blocks', 'price', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-2"> Status</label>
       <select name="status" id="status" className='w-full p-2 border rounded'
        value={settings.blocks.status} onChange={(e) => handleChange('blocks', 'status', e.target.value)}>
        <option value="available">available</option>
        <option value="unavailable">unavailable</option>
       </select>
      </div>
      <div>
        <label className="block mb-2"> inventory</label>
        <input
          type="text"
          value={settings.blocks.innventory}
          onChange={(e) => handleChange('blocks', 'innventory', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button className='w-full bg-green-500 hover:bg-green-600 text-white mt-5 text-2xl font-bold rounded-full py-2 mx-auto' onClick={handelSave}>save</button>
    </div>
  );
};