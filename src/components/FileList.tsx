import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Trash2, Eye, X, AlertCircle, Tag as TagIcon } from 'lucide-react';
import { getFiles, uploadFile, deleteFile, downloadFile, getFileMetadata, type FileData, type Tag } from '../services/api';
import ImagePreview from './ImagePreview';
import TagSelectionModal from './TagSelectionModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FileListProps {
    bucketName: string;
    onBack: () => void;
    searchTerm: string;
    selectedTags: string[];
}

const FileList: React.FC<FileListProps> = ({ bucketName, onBack, searchTerm, selectedTags }) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileTags, setSelectedFileTags] = useState<Tag[]>([]);

    useEffect(() => {
        loadFiles();
    }, [bucketName]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const filesData = await getFiles(bucketName);

            const filesWithMetadata = await Promise.all(
                filesData.map(async (file) => {
                    try {
                        const metadata = await getFileMetadata(bucketName, file.name);
                        return { ...file, tags: metadata.tags };
                    } catch (err) {
                        console.error(`Error fetching metadata for ${file.name}:`, err);
                        return file;
                    }
                })
            );

            setFiles(filesWithMetadata);
        } catch (err: any) {
            console.error('Error loading files:', err);
            setError(err.message || 'Failed to load files');
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setSelectedFileTags([]);
        setShowTagModal(true);
    };

    const handleUpload = async () => {
        if (!selectedFile || uploading) return;

        try {
            setUploading(true);
            setUploadProgress(0);
            setError(null);

            // Prepare tags
            const tags = selectedFileTags.map(tag => ({
                key: tag.key,
                value: tag.value
            }));

            // Upload file with tags
            await uploadFile(bucketName, selectedFile, tags);
            setUploadProgress(100);
            await loadFiles();  // Load files again to refresh the file list
            setShowTagModal(false);
            setSelectedFile(null);
            setSelectedFileTags([]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload file');
            console.error('Upload error:', err);
        } finally {
            setTimeout(() => {
                setUploadProgress(null);
                setUploading(false);
            }, 1000);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                setError(null);
                await deleteFile(bucketName, fileName);
                await loadFiles();
            } catch (err: any) {
                setError(err.message || 'Failed to delete file');
            }
        }
    };

    const handleDownload = async (fileName: string) => {
        try {
            setError(null);
            const blob = await downloadFile(bucketName, fileName);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(err.message || 'Failed to download file');
        }
    };

    const isImageFile = (filename: string) => {
        const ext = filename.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => file.tags?.some(fileTag => fileTag.value.toLowerCase() === tag.toLowerCase()));
        return matchesSearch && matchesTags;
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

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">{bucketName}</h2>
                </div>
                <div className="flex space-x-4">
                    <label className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload File'}
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(file);
                            }}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {filteredFiles.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
                    No files found in this bucket.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFiles.map((file) => (
                                <tr key={file.name} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {isImageFile(file.name) && (
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover cursor-pointer"
                                                        src={`${API_URL}/files/${bucketName}/${file.name}`}
                                                        alt=""
                                                        onClick={() => setPreviewImage(`${API_URL}/files/${bucketName}/${file.name}`)}
                                                    />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Math.round((file.size || 0) / 1024)} KB
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {file.tags?.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                                >
                                                    <TagIcon className="h-3 w-3 mr-1" />
                                                    {tag.value}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            {isImageFile(file.name) && (
                                                <button
                                                    onClick={() => setPreviewImage(`${API_URL}/files/${bucketName}/${file.name}`)}
                                                    className="text-gray-400 hover:text-gray-500"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownload(file.name)}
                                                className="text-gray-400 hover:text-gray-500"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file.name)}
                                                className="text-red-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showTagModal && selectedFile && (
                <TagSelectionModal
                    isOpen={showTagModal}
                    fileName={selectedFile.name}
                    selectedTags={selectedFileTags}
                    onTagsChange={setSelectedFileTags}
                    onClose={() => {
                        setShowTagModal(false);
                        setSelectedFile(null);
                        setSelectedFileTags([]);
                    }}
                    onConfirm={handleUpload}
                    uploadProgress={uploadProgress}
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
