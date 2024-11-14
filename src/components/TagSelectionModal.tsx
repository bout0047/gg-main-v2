import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagSelectionModalProps {
    isOpen: boolean;
    fileName: string;
    selectedTags: { key: string; value: string }[];
    onTagsChange: (tags: { key: string; value: string }[]) => void;
    onClose: () => void;
    onConfirm: () => void;
    uploadProgress?: number | null;
}

const TagSelectionModal: React.FC<TagSelectionModalProps> = ({
    isOpen,
    fileName,
    selectedTags,
    onTagsChange,
    onClose,
    onConfirm,
    uploadProgress,
}) => {
    const [tagKey, setTagKey] = useState('');
    const [tagValue, setTagValue] = useState('');

    const handleAddTag = () => {
        if (tagKey && tagValue) {
            onTagsChange([...selectedTags, { key: tagKey, value: tagValue }]);
            setTagKey('');
            setTagValue('');
        }
    };

    const handleRemoveTag = (key: string) => {
        onTagsChange(selectedTags.filter(tag => tag.key !== key));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Upload: {fileName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={tagKey}
                                onChange={(e) => setTagKey(e.target.value)}
                                placeholder="Key"
                                className="w-1/2 px-2 py-1 border border-gray-300 rounded-md"
                            />
                            <input
                                type="text"
                                value={tagValue}
                                onChange={(e) => setTagValue(e.target.value)}
                                placeholder="Value"
                                className="w-1/2 px-2 py-1 border border-gray-300 rounded-md"
                            />
                            <button onClick={handleAddTag} className="text-indigo-600 hover:text-indigo-900">
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map(tag => (
                                <span key={tag.key} className="inline-flex items-center px-2 py-1 bg-indigo-100 rounded-md">
                                    {tag.key}: {tag.value}
                                    <button onClick={() => handleRemoveTag(tag.key)} className="ml-2 text-red-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {uploadProgress !== null && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={uploadProgress !== null}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadProgress !== null ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagSelectionModal;
