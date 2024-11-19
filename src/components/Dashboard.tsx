import React, { useState } from 'react';
import { FolderOpen, LogOut } from 'lucide-react';
import BucketList from './BucketList';
import FileList from './FileList';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <FolderOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Marjane Secure Storage
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!selectedBucket ? (
                    <BucketList onSelectBucket={setSelectedBucket} />
                ) : (
                    <FileList bucketName={selectedBucket} onBack={() => setSelectedBucket(null)} />
                )}
            </main>
        </div>
    );
}

export default Dashboard;
