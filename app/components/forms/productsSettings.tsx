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
  };

  return (
    <div className="p-6 max-w-4xl mr-auto">
      <h2 className="text-2xl font-bold mb-6">تنظیمات محصول</h2>
      
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">اطلاعات اصلی</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">تصویر محصول</label>
              <input
                type="file"
                value={settings.blocks.imageSrc}
                onChange={(e) => handleChange('blocks', 'imageSrc', e.target.value)}
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
            {/* Add more basic fields here */}
          </div>
        </div>

        {/* Style Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">تنظیمات ظاهری</h3>
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
            <div>
              <label className="block mb-2">ارتفاع تصویر</label>
              <input
                type="text"
                value={settings.blocks.setting.imageHeight}
                onChange={(e) => handleNestedChange('blocks', 'setting', 'imageHeight', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            {/* Add more style fields here */}
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">تنظیمات چیدمان</h3>
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
            {/* Add more layout fields here */}
          </div>
        </div>
      </div>
    </div>
  );
};
