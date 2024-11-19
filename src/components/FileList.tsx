import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Upload,
    Download,
    Trash2,
    X,
    AlertCircle,
    Tag as TagIcon,
    Search
} from 'lucide-react';
import {
    getFiles,
    uploadFile,
    deleteFile,
    downloadFile,
    getFileMetadata,
    type FileData,
    type Tag,
} from '../services/api';
import ImagePreview from './ImagePreview';
import TagSelectionModal from './TagSelectionModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FileListProps {
    bucketName: string;
    onBack: () => void;
}

const FileList: React.FC<FileListProps> = ({ bucketName, onBack }) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFileTags, setSelectedFileTags] = useState<Tag[]>([]);
    const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFiles();
    }, [bucketName]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError(null);

            const filesData = await getFiles(bucketName);

            const filesWithTags = await Promise.all(
                filesData.map(async (file) => {
                    try {
                        const metadata = await getFileMetadata(bucketName, file.name);
                        return { ...file, tags: metadata.tags || [] };
                    } catch (err) {
                        console.error(`Error fetching metadata for ${file.name}:`, err);
                        return file;
                    }
                })
            );

            setFiles(filesWithTags);
        } catch (err: any) {
            console.error('Error loading files:', err);
            setError(err.message || 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files) {
            setSelectedFiles(Array.from(files));
            setShowTagModal(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles.length || uploading) return;

        try {
            setUploading(true);
            setError(null);

            for (const file of selectedFiles) {
                await uploadFile(bucketName, file, selectedFileTags);
            }

            await loadFiles();
            setSelectedFiles([]);
            setSelectedFileTags([]);
            setShowTagModal(false);
        } catch (err: any) {
            setError(err.message || 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileNames: string[]) => {
        if (window.confirm('Are you sure you want to delete the selected file(s)?')) {
            try {
                setError(null);
                for (const fileName of fileNames) {
                    await deleteFile(bucketName, fileName);
                }
                await loadFiles();
                setSelectedFileNames([]);
            } catch (err: any) {
                setError(err.message || 'Failed to delete file(s)');
            }
        }
    };

    const handleDownload = async (fileNames: string[]) => {
        try {
            for (const fileName of fileNames) {
                const blob = await downloadFile(bucketName, fileName);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to download file(s)');
        }
    };

    const isImageFile = (filename: string) => {
        const ext = filename.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    };

    const toggleFileSelection = (fileName: string) => {
        setSelectedFileNames((prevSelected) =>
            prevSelected.includes(fileName)
                ? prevSelected.filter((name) => name !== fileName)
                : [...prevSelected, fileName]
        );
    };

    // Filter files by search term (search across file name, tags, and keys)
    const filteredFiles = files.filter((file) => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTags = file.tags?.some(
            (fileTag) =>
                (fileTag.key || fileTag.Key || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (fileTag.value || fileTag.Value || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matchesSearch || matchesTags;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-gray-600">Loading files...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center text-red-800">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="flex items-center space-x-4">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search files, tags, or keys..."
                    className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* File List Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">{bucketName}</h2>
                </div>
                <div className="space-x-4">
                    <button
                        onClick={() => handleDownload(selectedFileNames)}
                        disabled={selectedFileNames.length === 0}
                        className={`inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium text-white ${selectedFileNames.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Selected
                    </button>
                    <button
                        onClick={() => handleDelete(selectedFileNames)}
                        disabled={selectedFileNames.length === 0}
                        className={`inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium text-white ${selectedFileNames.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                    </button>
                    <label
                        className={`inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* File List */}
            {filteredFiles.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
                    No files found in this bucket.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFileNames(filteredFiles.map((file) => file.name));
                                            } else {
                                                setSelectedFileNames([]);
                                            }
                                        }}
                                        checked={selectedFileNames.length === filteredFiles.length && filteredFiles.length > 0}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tags
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFiles.map((file) => (
                                <tr key={file.name}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedFileNames.includes(file.name)}
                                            onChange={() => toggleFileSelection(file.name)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {isImageFile(file.name) && (
                                            <img
                                                src={`${API_URL}/files/${bucketName}/${file.name}`}
                                                alt={file.name}
                                                onClick={() => setPreviewImage(`${API_URL}/files/${bucketName}/${file.name}`)}
                                                className="h-10 w-10 rounded-lg object-cover cursor-pointer"
                                            />
                                        )}
                                        {file.name}
                                    </td>
                                    <td className="px-6 py-4">{Math.round((file.size || 0) / 1024)} KB</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {file.tags && file.tags.length > 0 ? (
                                                file.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                    >
                                                        <TagIcon className="h-3 w-3 mr-1" />
                                                        {`${(tag.key || tag.Key || 'No Key').toLowerCase()}: ${(tag.value || tag.Value || 'No Value').toLowerCase()}`}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No tags</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDownload([file.name])} className="text-gray-400 hover:text-gray-500">
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete([file.name])} className="text-red-400 hover:text-red-500">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showTagModal && selectedFiles.length > 0 && (
                <TagSelectionModal
                    isOpen={showTagModal}
                    fileName={selectedFiles.map((file) => file.name).join(', ')}
                    selectedTags={selectedFileTags}
                    onTagsChange={setSelectedFileTags}
                    onClose={() => {
                        setShowTagModal(false);
                        setSelectedFiles([]);
                    }}
                    onConfirm={handleUpload}
                />
            )}

            {previewImage && (
                <ImagePreview
                    src={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
};

export default FileList;
