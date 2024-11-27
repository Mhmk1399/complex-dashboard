'use client'
import { useEffect, useState } from 'react'
import Form from './form'
import { ProductsSettings } from './components/forms/productsSettings'
import { Inventory } from './components/forms/inventory'
 


export const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('ProductsSetting');
  useEffect(() => {
    console.log(selectedMenu);
  }, [selectedMenu]);
  const RenderForms=()=>{
    switch (selectedMenu) {
      case 'addProduct':
        return <ProductsSettings />;
      case 'inventory':
        return <Inventory />;
      default:
        return null;
    }
  }
  return (
    <div>
    <Form setSelectedMenu={setSelectedMenu} />
    <RenderForms />
    </div>
  )
}
