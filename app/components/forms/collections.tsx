import React, { useEffect, useState } from 'react'
import { TrashIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline'
import { CreateCollectionModal } from './createCollectionModal';
import { toast } from 'react-toastify';
import { EditCollectionModal } from './editCollectionModal';

interface Collection {
    _id: string;
    name: string;
    products: Product[]; // Changed from string[] to Product[]
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
export const Collection = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    
    const handleCreateCollection = async (collectionData: { name: string; products: Product[] }) => {
        try {
            const response = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(collectionData),
            });
            
            if (response.ok) {
                fetchCollections();
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating collection:', error);
        }
    };
    
    // Fetch collections on component mount
    useEffect(() => {
        fetchCollections();
        fetchProducts();
    }, []);
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/collections');
            const data = await response.json();
            setCollections(data.collections);
            setIsLoading(false);
        } catch (error) {
            console.log('Error fetching collections:', error);
            setIsLoading(false);
        }
    };


    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            try {
                const response = await fetch(`/api/collections/${id}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    setCollections(collections.filter(collection => collection._id !== id));
                    toast.success('Collection deleted successfully');
                } else {
                    toast.error('Failed to delete collection');
                }
            } catch (error) {
                console.error('Error deleting collection:', error);
                toast.error('Error deleting collection');
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

    const handleEdit = async (collection: Collection) => {
        try {
            const response = await fetch(`/api/collections/${collection._id}`);
            const data = await response.json();
            setSelectedCollection({
                ...collection,
                products: data.products // This will contain only the products in this collection
            });
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching collection details:', error);
        }
    };
    
    

    const handleSaveEdit = async (editedCollection: Collection) => {
        try {
            const response = await fetch(`/api/collections/${editedCollection._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editedCollection,
                    products: editedCollection.products.map(product => product._id) // Convert Product objects to IDs
                }),
            });
            
            if (response.ok) {
                await fetchCollections(); // Refresh the collections data
                setIsEditModalOpen(false);
                toast.success('Collection updated successfully');
            } else {
                toast.error('Failed to update collection');
            }
        } catch (error) {
            console.log('Error updating collection:', error);
            toast.error('Error updating collection');
        }
    };
    
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Collections</h2>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Create Collection
                </button>
            </div>
            {isCreateModalOpen && (
    <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateCollection}
    />
)}
            {isEditModalOpen && selectedCollection && (
                <EditCollectionModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    collection={selectedCollection}
                    onSave={handleSaveEdit}
                />
            )}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {collections.map((collection) => (
                            <tr key={collection._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                                </td>
                              
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{collection.products.length}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(collection.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button className="text-indigo-600 hover:text-indigo-900">
                                            <PencilIcon className="h-5 w-5" onClick={() => handleEdit(collection)} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(collection._id)}
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