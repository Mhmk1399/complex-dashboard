'use client';
import React, { useState } from 'react';

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
    setting: {
      imageWidth: string;
      imageheight: string;
      imageRadius: string;
      nameColor: string;
      nameFontSize: string;
      nameFontWeight: string;
      pricecolor: string;
      priceFontSize: string;
      descriptionColor: string;
      descriptionFontSize: string;
      descriptionFontWeight: string;
      btnBackgroundColor: string;
      btnTextColor: string;
      cardBackground: string;
      cardBorderRadius: string;
    };
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
      setting: {
        imageWidth: '500px',
        imageheight: '500px', // Fix typo from imageHeight to imageheight
        imageRadius: '20px',
        nameColor: '#FCA311',
        nameFontSize: '30px',
        nameFontWeight: 'bold',
        pricecolor: '#2ECC71', // Fix typo from priceColor to pricecolor
        priceFontSize: '24px',
        descriptionColor: '#333333',
        descriptionFontSize: '16px',
        descriptionFontWeight: 'normal',
        btnBackgroundColor: '#3498DB',
        btnTextColor: '#FFFFFF',
        cardBackground: '#FFFFFF',
        cardBorderRadius: '10px'
      }
    }
  });
  

  // Changes settings general
  const handleChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        ...(section === 'blocks' ? { [field]: value } : {}),
        setting: {
          ...prev.blocks.setting,
          ...(section === 'setting' ? { [field]: value } : {})
        }
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
        setting: settings.blocks.setting
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
      <h2 className="text-2xl font-bold mb-6 lg:col-span-2 col-span-1">تنظیمات محصول</h2>

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

      <div className='flex flex-wrap gap-x-2 col-span-1'>
        <h1 className='w-full'>رنگ بندی</h1>
        <div className='grid grid-cols-3  gap-2 w-full border p-2 rounded-lg'>
          <div>
            <label className="block text-nowrap">رنگ پس زمینه</label>
            <input
              type="color"
              value={settings.blocks.setting.cardBackground}
              onChange={(e) => handleChange('setting', 'cardBackground', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>
          <div>
            <label className="block text-nowrap">رنگ نام محصول</label>
            <input
              type="color"
              value={settings.blocks.setting.nameColor}
              onChange={(e) => handleChange('setting', 'nameColor', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>
          <div>
            <label className="block text-nowrap">رنگ قیمت</label>
            <input
              type="color"
              value={settings.blocks.setting.pricecolor}
              onChange={(e) => handleChange('setting', 'priceColor', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>
          <div>
            <label className="block text-nowrap">رنگ پس زمینه دکمه</label>
            <input
              type="color"
              value={settings.blocks.setting.btnBackgroundColor}
              onChange={(e) => handleChange('setting', 'btnBackgroundColor', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>
          <div>
            <label className="block">رنگ توضیحات</label>
            <input
              type="color"
              value={settings.blocks.setting.descriptionColor}
              onChange={(e) => handleChange('setting', 'descriptionColor', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>

          <div>
            <label className="block ">رنگ متن دکمه</label>
            <input
              type="color"
              value={settings.blocks.setting.btnTextColor}
              onChange={(e) => handleChange('setting', 'btnTextColor', e.target.value)}
              className="h-5 border rounded-lg w-12"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-2">عرض تصویر</label>
        <input
          type="range"
          value={settings.blocks.setting.imageWidth}
          onChange={(e) => handleChange('setting', 'imageWidth', e.target.value)}
          className="w-full p-2 border rounded"
        />
         <label className="block mb-2">شعاع تصویر</label>
        <input
          type="range"
          value={settings.blocks.setting.imageRadius}
          onChange={(e) => handleChange('setting', 'imageRadius', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      

      <div>
        <label className="block mb-2">ارتفاع تصویر</label>
        <input
          type="range"
          value={settings.blocks.setting.imageheight}
          onChange={(e) => handleChange('setting', 'imageheight', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>



      <div>
        <label className="block mb-2">وزن فونت نام محصول</label>
        <input
          type="range"
          value={settings.blocks.setting.nameFontWeight}
          onChange={(e) => handleChange('setting', 'nameFontWeight', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>



      <div>
        <label className="block mb-2">سایز فونت توضیحات</label>
        <input
          type="range"
          value={settings.blocks.setting.descriptionFontSize}
          onChange={(e) => handleChange('setting', 'descriptionFontSize', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>


   <div>
        <label className="block mb-2"> فونت توضیحات</label>
        <input
          type="range"
          value={settings.blocks.setting.descriptionFontWeight}
          onChange={(e) => handleChange('setting', 'descriptionFontWeight', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

    

      <div>
        <label className="block mb-2">شعاع حاشیه کارت</label>
        <input
          type="range"
          value={settings.blocks.setting.cardBorderRadius}
          onChange={(e) => handleChange('setting', 'cardBorderRadius', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button className='w-full bg-green-500 hover:bg-green-600 text-white mt-5 rounded-full py-2 mx-auto' onClick={handelSave}>save</button>
    </div>
  );
};