import  { useState } from 'react';

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

interface EditModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const EditModal = ({ product, isOpen, onClose, onSave }: EditModalProps) => {
    const [formData, setFormData] = useState({
        imageSrc: product.images?.imageSrc || '',
        imageAlt: product.images?.imageAlt || '',
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        status: product.status,
        discount: product.discount,
        innventory: product.innventory,
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/products/${product._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: {
                        imageSrc: formData.imageSrc,
                        imageAlt: formData.imageAlt
                    },
                    ...formData
                }),
            });

            if (response.ok) {
                onSave();
                onClose();
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Image URL</label>
                        <input
                            type="text"
                            value={formData.imageSrc}
                            onChange={(e) => handleChange('imageSrc', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Image Alt Text</label>
                        <input
                            type="text"
                            value={formData.imageAlt}
                            onChange={(e) => handleChange('imageAlt', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Price</label>
                        <input
                            type="text"
                            value={formData.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2">Discount</label>
                        <input
                            type="text"
                            value={formData.discount}
                            onChange={(e) => handleChange('discount', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Inventory</label>
                        <input
                            type="text"
                            value={formData.innventory}
                            onChange={(e) => handleChange('innventory', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="col-span-2 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
    );
};

export default EditModal;
