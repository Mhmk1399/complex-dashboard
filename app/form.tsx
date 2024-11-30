'use client'
import  React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dashboardMenuItems = [
  { id: 'store', title: ' products', subMenuItems: [{title:'add product',value:'addProduct'}, {title:'inventory',value:'inventory'}, {title:'collections ',value:'collections'}, {title:'discount',value:'discount'}] },
  { id: 'orders', title: 'orders', subMenuItems: [{title:'orders',value:'orders '}, {title:'shipping',value:'shipping'}, {title:'aboundend Checkouts',value:'aboundendCheckouts'}]  },
  { id: 'customers', title: 'customers' , subMenuItems: [{title:'customers',value:'customers'}, {title:'segment ',value:'segment'}] },
  { id: 'media', title: 'media' , subMenuItems: [{title:'add file',value:'addFile'}] },
  { id: 'addBlogs', title: 'Add blogs' , subMenuItems: [{title:'add Blogs',value:'addBlogs'},{title:'add Meta Data',value:'addMetaData'}] },];
interface FormProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="rounded-lg mb-2" dir='rtl'>
      <button
        className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-full flex justify-between items-center"
        onClick={onToggle}
      >
        <span className="font-semibold">{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180 text-red-400' : ''}`}>
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



const Form:React.FC<FormProps> = ({setSelectedMenu}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const renderAccordionContent = (item: { subMenuItems?: Array<{ title: string, value: string }> },setSelectedMenu: React.Dispatch<React.SetStateAction<string>>) => {
    return (
      <>
        {item.subMenuItems?.map((subItem, index) => (
          <div key={index} className='text-right  transition-all delay-100 ease-in-out cursor-pointer hover:font-bold text-gray-600 m-2' onClick={() => setSelectedMenu(subItem.value)}>
             <span className='mx-2 '>{`<`}</span>{subItem.title}
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button 
        onClick={toggleMenu}
        className="fixed left-4 top-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 "
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {(isOpen ) && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black  z-40"
            />

            {/* Sliding Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg overflow-y-auto p-6 z-50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6" dir="rtl">
                منوی مدیریت
              </h2>

              {dashboardMenuItems.map((item ) => (
                <AccordionItem
                  key={item.id}
                  title={item.title}
                  isOpen={activeSection === item.id}
                  onToggle={() => toggleSection(item.id)}
                  
                >
                  {renderAccordionContent(item,setSelectedMenu)}
                </AccordionItem>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Form;
