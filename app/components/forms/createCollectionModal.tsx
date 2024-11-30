import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
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
interface ProductImages {
    imageSrc: string;
    imageAlt: string;
}
interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collection: { name: string; products: Product[] }) => void;
}


export const CreateCollectionModal = ({ isOpen, onClose, onSave }: CreateCollectionModalProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [collectionName, setCollectionName] = useState('');

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data.products));
    }, []);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: collectionName,
            products: selectedProducts
        });
        onClose();
    };
    
    const toggleProduct = (product: Product) => {
        setSelectedProducts(prev => 
            prev.some(p => p._id === product._id)
                ? prev.filter(p => p._id !== product._id)
                : [...prev, product]
        );
    };
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Collection</h2>
                    <button onClick={onClose}>
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Collection Name</label>
                        <input
                            type="text"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className={`border rounded p-3 cursor-pointer ${
                                    selectedProducts.some(p => p._id === product._id) ? 'border-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => toggleProduct(product)}
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={product.images?.imageSrc || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-500">${product.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            disabled={!collectionName || selectedProducts.length === 0}
                        >
                            Create Collection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
