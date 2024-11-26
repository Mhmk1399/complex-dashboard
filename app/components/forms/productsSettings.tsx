'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      imageHeight: string;
      imageRadius: string;
      productNameColor: string;
      productNameFontSize: string;
      productNameFontWeight: string;
      priceColor: string;
      priceFontSize: string;
      descriptionColor: string;
      descriptionFontSize: string;
      btnBackgroundColor: string;
      btnTextColor: string;
    };
  };
  setting: {
    paddingTop: string;
    paddingBottom: string;
    marginTop: string;
    marginBottom: string;
    backgroundColor: string;
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
      price: 'قیمت محصول',
      status: 'وضعیت محصول',
      discount: 'تخفیف محصول',
      id: 'شناسه محصول',
      innventory: 'موجودی محصول',
      setting: {
        imageWidth: '500px',
        imageHeight: '500px',
        imageRadius: '20px',
        productNameColor: '#FCA311',
        productNameFontSize: '30px',
        productNameFontWeight: 'bold',
        priceColor: '#2ECC71',
        priceFontSize: '24px',
        descriptionColor: '#333333',
        descriptionFontSize: '16px',
        btnBackgroundColor: '#3498DB',
        btnTextColor: '#FFFFFF'
      }
    },
    setting: {
      paddingTop: '20',
      paddingBottom: '20',
      marginTop: '10',
      marginBottom: '10',
      backgroundColor: '#FFFFFF'
    }
  });
 
  const handleChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {

        ...(prev[section as keyof ProductSettings] as Record<string, {}>),
        [field]: value
      }
    }));
    console.log(settings.blocks.setting.priceColor);

  };

  const handleNestedChange = (section: string, subSection: string, field: string, value: string) => {
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ProductSettings] as Record<string, {}>,
        [subSection]: {
          ...((prev[section as keyof ProductSettings] as any)[subSection]),
          [field]: value
        }
      }
      
      
    }));
    console.log(settings.blocks.setting.priceColor);
    
  };

  return (
    <div className="p-6 max-w-5xl mr-auto lg:ml-10" dir="rtl">
      <h2 className="text-2xl font-bold mb-6">تنظیمات محصول</h2>


      <div className="grid grid-cols-2 gap-4">
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
        {/* Add remaining basic fields */}
      </div>



      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">عرض تصویر</label>
          <input
            type="text"
            value={settings.blocks.setting.imageWidth}
            onChange={(e) => handleNestedChange('blocks', 'setting', 'imageWidth', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className='flex flex-wrap gap-x-2'>
          <h1 className='w-full' >رنگ بندی</h1>
          <label className="block  text-nowrap">رنگ نام محصول</label>
          <input
            type="color"
            value={settings.blocks.setting.productNameColor}
            onChange={(e) => handleNestedChange('blocks', 'setting', 'productNameColor', e.target.value)}
            className="h-5 ro border rounded-lg w-12"
          />

          <label className="block text-nowrap">رنگ پس زمینه</label>
          <input
            type="color"
            value={settings.setting.backgroundColor}
            onChange={(e) => handleChange('setting', 'backgroundColor', e.target.value)}
            className="h-5 ro border rounded-lg w-12"
          />
           <label className="block text-nowrap">price color   </label>
          <input
            type="color"
            value={settings.blocks.setting.priceColor}
            onChange={(e) => handleChange('setting', 'backgroundColor', e.target.value)}
            className="h-5 ro border rounded-lg w-12"
          />
           <label className="block text-nowrap"> رنگ پس زمینه دکمه</label>
          <input
            type="color"
            value={settings.blocks.setting.btnBackgroundColor}
            onChange={(e) => handleChange('setting', 'btnBackgroundColor', e.target.value)}
            className="h-5 ro border rounded-lg w-12"
          />
        </div>
        <div>
          <label className="block mb-2">سایز فونت نام محصول</label>
          <input
            type="text"
            value={settings.blocks.setting.productNameFontSize}
            onChange={(e) => handleNestedChange('blocks', 'setting', 'productNameFontSize', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>

        </div>
      </div>




      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">فاصله از بالا</label>
          <input
            type="text"
            value={settings.setting.paddingTop}
            onChange={(e) => handleChange('setting', 'paddingTop', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">فاصله از پایین</label>
          <input
            type="text"
            value={settings.setting.paddingBottom}
            onChange={(e) => handleChange('setting', 'paddingBottom', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

    </div>
  );
};

