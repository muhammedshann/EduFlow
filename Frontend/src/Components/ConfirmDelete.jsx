import {Trash2} from 'lucide-react';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 animate-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <div className="p-2 bg-red-50 rounded-full">
                        <Trash2 size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {title || "Confirm Delete"}
                    </h2>
                </div>
                
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    {message || "Are you sure you want to delete this item? This action cannot be undone."}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 active:scale-95 transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
// const [bundleToDelete, setBundleToDelete] = useState(null);
// 
// <DeleteConfirmModal 
//     isOpen={isDeleteModalOpen}
//     onClose={() => setIsDeleteModalOpen(false)}
//     onConfirm={handleConfirmDelete}
//     title="Delete Bundle?"
//     message={`Are you sure you want to delete "${bundleToDelete?.name}"? All users will lose access to this purchase option.`}
// />