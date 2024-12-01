import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface EditCollectionModalProps {
    collection: Collection;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedCollection: Collection) => void;
}
interface Collection {
    _id: string;
    name: string;
    products: Product[];
    createdAt: string;
    updatedAt: string;
}
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

export const EditCollectionModal = ({ collection, isOpen, onClose, onSave }: EditCollectionModalProps) => {
    const [name, setName] = useState(collection.name);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
    const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 0 });
    useEffect(() => {
        if (allProducts.length > 0) {
            const prices = allProducts.map(p => parseFloat(p.price));
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setPriceRange({ min, max });
            setSelectedPriceRange({ min, max });
        }
    }, [allProducts]);

    useEffect(() => {
        fetch(`/api/collections/${collection._id}`)
            .then(res => res.json())
            .then(data => {
                setSelectedProducts(data.collection.products);
                setAvailableProducts(data.collection.products);
            });

        fetch('/api/products')
            .then(res => res.json())
            .then(data => setAllProducts(data.products));
    }, [collection._id]);
    const handleRemoveProduct = (product: Product) => {
        setAvailableProducts(prev => prev.filter(p => p._id !== product._id));
        setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
    };

    const handleAddProduct = (product: Product) => {
        setAvailableProducts(prev => [...prev, product]);
        setSelectedProducts(prev => [...prev, product]);
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/collections/${collection._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    products: selectedProducts
                }),
            });

            if (response.ok) {
                const updatedCollection = await response.json();
                onSave(updatedCollection);
                onClose();
            }
        } catch (error) {
            console.error('Error updating collection:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="w-full fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black opacity-30" />

                <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <Dialog.Title className="text-xl font-bold mb-4">Edit Collection</Dialog.Title>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Collection Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded "
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-4 justify-evenly">
                            <div className="items-center">

                                <input
                                    type="text"
                                    placeholder="Search products by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 border rounded mb-2 text-sm"
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm mr-2">Min: {selectedPriceRange.min}</span>
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={selectedPriceRange.min}
                                    onChange={(e) => setSelectedPriceRange(prev => ({
                                        ...prev,
                                        min: Math.min(parseFloat(e.target.value), prev.max)
                                    }))}
                                    className="w-24"
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm mr-2">Max: {selectedPriceRange.max}</span>
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={selectedPriceRange.max}
                                    onChange={(e) => setSelectedPriceRange(prev => ({
                                        ...prev,
                                        max: Math.max(parseFloat(e.target.value), prev.min)
                                    }))}
                                    className="w-24"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                           
                            <div className="mb-4 h-[150px] border p-1 overflow-y-auto">
                                {allProducts
                                    .filter(product =>
                                        // Existing filters
                                        !availableProducts.some(existingProduct => existingProduct._id === product._id) &&
                                        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                                        // Add price range filter
                                        parseFloat(product.price) >= selectedPriceRange.min &&
                                        parseFloat(product.price) <= selectedPriceRange.max
                                    )
                                    .map(product => (
                                        <div key={`available-${product._id}`} className="flex items-center border rounded-lg justify-between p-2 hover:bg-gray-50 ">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.images?.imageSrc || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-8 h-8 rounded-full object-cover mr-2"
                                                />
                                            </div>
                                            <span>name:{product.name}</span>
                                            <span> category:{product.category}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddProduct(product)}
                                                className="text-green-500 hover:text-green-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}</div>

                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Select Products</label>

                            <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                                {availableProducts.map((product, index) => (
                                    <div key={`selected-${product._id}-${index}`} className="flex items-center justify-between p-2 hover:bg-gray-50">
                                        <div className="flex  justify-around gap-x-3">
                                            <img
                                                src={product.images?.imageSrc || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-8 h-8 rounded-full object-cover mr-2"
                                            />
                                        </div>
                                        <span>name:{product.name}</span>
                                        <span> category:{product.category}</span>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(product)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Dialog>
    );
};
