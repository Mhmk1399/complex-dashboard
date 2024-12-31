import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="bg-white p-6 rounded shadow-lg z-10">
                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                <p className="mb-4">Are you sure you want to delete this product?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Yes
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Modal;