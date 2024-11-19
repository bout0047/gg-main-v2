import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export interface Tag {
    Key: string;
    Value: string;
}

export interface FileData {
    name: string;
    size?: number;
    contentType?: string;
    tags?: Tag[];
    lastModified?: Date;
}

export interface BucketData {
    name: string;
    created: string;
    access: string;
    size?: string;
    objects?: number;
}

const handleApiError = (error: any) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('API Error:', {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers,
            url: axiosError.config?.url
        });

        if (axiosError.response?.status === 404) {
            throw new Error(`Resource not found: ${axiosError.config?.url}`);
        }

        throw new Error(axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred');
    }
    throw error;
};

export const getBuckets = async (): Promise<BucketData[]> => {
    try {
        const response = await api.get('/buckets');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createBucket = async (name: string): Promise<BucketData> => {
    try {
        const response = await api.post('/buckets/create', { bucketName: name });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFiles = async (bucketName: string): Promise<FileData[]> => {
    try {
        const response = await api.get(`/buckets/${bucketName}/files`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

export const uploadFile = async (bucketName: string, file: File, tags?: Tag[]): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    if (tags && tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
    }

    try {
        await axios.post(`${API_URL}/files/${bucketName}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteFile = async (bucketName: string, fileName: string): Promise<void> => {
    try {
        await api.delete(`/files/${bucketName}/${fileName}`);
    } catch (error) {
        throw handleApiError(error);
    }
};

export const downloadFile = async (bucketName: string, fileName: string): Promise<Blob> => {
    try {
        const response = await axios.get(`${API_URL}/files/${bucketName}/${fileName}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFileMetadata = async (bucketName: string, fileName: string): Promise<{ tags: Tag[] }> => {
    try {
        const response = await api.get(`/files/${bucketName}/${fileName}/metadata`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};