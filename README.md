# MinIO App Documentation

## Overview
The MinIO App is a high-performance, scalable, and secure object storage platform built to manage unstructured data efficiently. It leverages the MinIO backend for storage and integrates with a user-friendly frontend to support seamless file uploads, metadata handling, and robust file management.

## Features
- **File Upload**: Upload files with metadata (size, content-type, last modified, version ID, eTag, and tags).
- **Metadata Management**: Allows saving and displaying tags and keys in a table in the frontend.
- **Compatibility**: Fully functional backend integrated with multiple frontend systems.
- **Scalable Storage**: Leverages MinIO for reliable, object-based storage.
- **Security**: End-to-end encryption to ensure data protection.

## Prerequisites
To run the MinIO App, ensure you have the following:

- **MinIO Server**: Installed and configured.
- **Backend Requirements**:
  - .NET 8 runtime.
  - SQL Server (database setup completed).
- **Frontend Requirements**:
  - A modern browser for accessing the app.
- **Environment Configuration**:
  - Ensure all necessary configurations are in place (e.g., database connection strings, API keys).

## Installation and Setup

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MinIOApp
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Update the `appsettings.json` file with your database connection string and MinIO credentials.
4. Run the backend:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

### File Upload
1. Access the app through the frontend interface.
2. Navigate to the **Upload File** section.
3. Select a file and add metadata as required.
4. Submit the file for upload.

### Metadata Display
Uploaded files along with their metadata will be displayed in a table format. Metadata includes:
- Size
- Content-Type
- Last Modified
- Version ID
- ETag
- Tags

### Configuration
- To update the metadata keys or tags, edit the appropriate configuration in the frontend and backend.
- Ensure proper tagging during the upload process for better file management.

## Deployment

### Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t minio-app .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:80 minio-app
   ```

### Kubernetes Deployment
1. Apply the deployment manifest:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```
2. Expose the service:
   ```bash
   kubectl expose deployment minio-app --type=LoadBalancer --name=minio-service
   ```

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature/fix.
3. Commit your changes and push the branch.
4. Submit a pull request for review.

## Troubleshooting
- **File Upload Errors**: Check the backend logs for error details.
- **Metadata Issues**: Verify the metadata structure in the frontend configuration.
- **Database Connectivity**: Ensure the database server is running and accessible.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For questions or support, contact:
- **Email**: support@minioapp.com
- **GitHub Issues**: [Submit an issue](https://github.com/<repository-url>/issues)

