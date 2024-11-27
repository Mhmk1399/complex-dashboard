import React, { useEffect, useState } from 'react'
import { TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline'


interface ProductSetting {
    imageWidth: string;
    imageHeight?: string;
    imageheight?: string;
    imageRadius: string;
    productNameColor?: string;
    productNameFontSize?: string;
    productNameFontWeight?: string;
    nameColor?: string;
    nameFontSize?: string;
    nameFontWeight?: string;
    priceColor?: string;
    pricecolor?: string;
    priceFontSize: string;
    descriptionColor: string;
    descriptionFontSize: string;
    descriptionFontWeight?: string;
    btnBackgroundColor: string;
    btnTextColor: string;
    cardBorderRadius?: string;
    cardBackground?: string;
  }
  
  interface ProductImages {
    imageSrc: string;
    imageAlt: string;
  }
  
  interface Product {
    setting: ProductSetting;
    images?: ProductImages;
    _id: string;
    imageSrc?: string;
    imageAlt?: string;
    name: string;
    description: string;
    category: string;
    price: string;
    status: string;
    discount: string;
    id: string;
    innventory: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  

  export const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products', {
            method: 'GET',
        })
        .then(result => result.json())
        .then(data => {
            setProducts(data.products);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error:', error);
            setIsLoading(false);
        });
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                });
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Product Inventory</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img 
                                                className="h-10 w-10 rounded-full object-cover" 
                                                src={product.images?.imageSrc || '/placeholder.png'} 
                                                alt={product.images?.imageAlt || product.name}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">${product.price}</div>
                                    {product.discount !== "0" && (
                                        <div className="text-xs text-green-600">-{product.discount}% off</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.innventory}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button className="text-indigo-600 hover:text-indigo-900">
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
