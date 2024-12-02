'use client'
import { useEffect, useState } from 'react'
import Form from './form'
import { ProductsSettings } from './components/forms/productsSettings'
import { Inventory } from './components/forms/inventory'
import { Collection } from './components/forms/collections'
import { AddBlog } from './components/forms/addBlog'
import { EditBlogs } from './components/forms/editBlogs'
 


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
      case'collections':
      return <Collection />;
      case 'addBlogs': 
      return <AddBlog />;
      case 'editBlogs':
        return <EditBlogs/>
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
