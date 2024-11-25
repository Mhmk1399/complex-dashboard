'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dashboardMenuItems = [
  { id: 'store', title: ' فروشگاه', subMenuItems: [{title:'product setting',value:'products setting'}, {title:'blogs setting',value:'blogs setting'}, {title:'collections setting',value:'collections setting'}, {title:'layout setting',value:'layout setting'}] },
  { id: 'seo', title: 'سئو', subMenuItems: [{title:'add blogs',value:'add blogs'}, {title:'add metadata',value:'add metadata'}]  },
  { id: 'acountant and inventory', title: 'حسابداری و انبارداری' , subMenuItems: [{title:'server acountant',value:'server acountant'}, {title:'inventory ',value:'inventory'}, {title:'sale and orders ',value:'sale and orders '}] },
  { id: 'advertising and customers', title: ' تبلیغات و مشتریان' , subMenuItems: [{title:'create campagin',value:'create campagin'}, {title:'chat setting',value:'chat setting'}, {title:'CRM ',value:'CRM'}] },
  { id: 'user data', title:  'اطلاعات کاربری' },
];

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="rounded-lg mb-2">
      <button
        className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-full flex justify-between items-center"
        onClick={onToggle}
      >
        <span className="font-semibold">{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 ">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Form = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const renderAccordionContent = (item: { subMenuItems?: Array<{ title: string, value: string }> }) => {
    return (
      <>
        {item.subMenuItems?.map((subItem, index) => (
          <div key={index} className='text-right transition-all delay-100 ease-in-out cursor-pointer hover:font-bold text-gray-600 m-2'>
             <span className='mx-2 '>{`<`}</span>{subItem.title}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg overflow-y-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" dir="rtl">
        منوی مدیریت
      </h2>

      {dashboardMenuItems.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={activeSection === item.id}
          onToggle={() => toggleSection(item.id)}
        >
          {renderAccordionContent(item)}
        </AccordionItem>
      ))}
    </div>
  );
}

export default Form;
