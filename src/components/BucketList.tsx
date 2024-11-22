import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { getBuckets, createBucket } from '../services/api';

interface BucketListProps {
    onSelectBucket: (bucketName: string) => void;
}

const BucketList: React.FC<BucketListProps> = ({ onSelectBucket }) => {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBuckets();
    }, []);

    const loadBuckets = async () => {
        try {
            setLoading(true);
            const data = await getBuckets();
            setBuckets(data);
        } catch (err) {
            setError('Failed to load buckets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateBucketName = (name: string): string | null => {
        const ipAddressPattern = /^\d{1,3}(\.\d{1,3}){3}$/;
        const invalidCharactersPattern = /[^a-z0-9.-]/;

        if (name.length < 3 || name.length > 63) {
            return 'Bucket name must be between 3 and 63 characters long.';
        }
        if (invalidCharactersPattern.test(name)) {
            return 'Bucket name can only contain lowercase letters, numbers, dots, and hyphens.';
        }
        if (name.includes('..') || name.includes('-.') || name.includes('.-')) {
            return 'Bucket name must not contain two adjacent periods or a period adjacent to a hyphen.';
        }
        if (ipAddressPattern.test(name)) {
            return 'Bucket name must not resemble an IP address.';
        }
        if (name.startsWith('xn--')) {
            return 'Bucket name must not start with the prefix "xn--".';
        }
        if (name.endsWith('-s3alias')) {
            return 'Bucket name must not end with the suffix "-s3alias".';
        }
        return null;
    };

    const suggestAlternativeName = (name: string): string => {
        let suggestedName = name.toLowerCase().replace(/[^a-z0-9.-]/g, '');
        suggestedName = suggestedName.replace(/\.\.|-\.|\.\-/g, '-');
        if (suggestedName.length < 3) {
            suggestedName = `bucket-${suggestedName}`;
        } else if (suggestedName.length > 63) {
            suggestedName = suggestedName.substring(0, 63);
        }
        if (suggestedName.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
            suggestedName = `bucket-${suggestedName}`;
        }
        if (suggestedName.startsWith('xn--')) {
            suggestedName = `bucket-${suggestedName}`;
        }
        if (suggestedName.endsWith('-s3alias')) {
            suggestedName = suggestedName.replace(/-s3alias$/, '-bucket');
        }
        return suggestedName;
    };

    const handleCreateBucket = async () => {
        const name = prompt('Enter bucket name:');
        if (name) {
            const validationError = validateBucketName(name);
            let bucketNameToCreate = name;
            if (validationError) {
                bucketNameToCreate = suggestAlternativeName(name);
                alert(`${validationError} Automatically creating bucket with suggested name: ${bucketNameToCreate}`);
            }
            try {
                await createBucket(bucketNameToCreate);
                loadBuckets();
            } catch (err) {
                setError('Failed to create bucket');
                console.error(err);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Les Fichiers</h2>
                <button
                    onClick={handleCreateBucket}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New File
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                File Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Access
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Objects
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {buckets.map((bucket) => (
                            <tr key={bucket.name} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FolderOpen className="h-5 w-5 text-indigo-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">{bucket.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bucket.created ? new Date(bucket.created).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bucket.access === 'Read/Write' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {bucket.access || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bucket.size || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bucket.objects || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onSelectBucket(bucket.name)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Files
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BucketList;
