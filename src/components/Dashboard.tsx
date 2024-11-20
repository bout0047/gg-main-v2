import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import BucketList from './BucketList';
import FileList from './FileList';
import logo from '../assets/Marjane-Emploi-Recrutement-1.webp'; // Corrected path

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24"> {/* Increased height of the navbar */}
                        <div className="flex items-center">
                            <img
                                src={logo}
                                alt="Marjane Logo"
                                className="h-20 w-auto" // Adjusted height to 20 (80px) for a larger logo
                            />
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
};

export default Dashboard;
