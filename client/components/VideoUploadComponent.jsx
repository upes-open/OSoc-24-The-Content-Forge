import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './VideoUploadComponent.css'

function VideoUploadComponent() {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedFile, setUploadedFile] = useState(null);

    const onDrop = acceptedFiles => {
        setFiles(acceptedFiles);
        handleUpload(acceptedFiles);
    };

    const handleUpload = (files) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        // this is for the backend route
        axios.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;
                let percent = Math.floor((loaded * 100) / total);
                setUploadProgress({ ...uploadProgress, [files[0].name]: percent });
            }
        }).then(response => {
            setUploadedFile(files[0]);
        }).catch(error => {
            console.error('Error uploading file', error);
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'video/*'
    });

    return (
        <div className='flex justify-center items-center h-screen bg-blue-200'>
            <div className='box mt-10 max-w-5xl p-8 bg-white custom-rounded shadow-lg'>
                <h1 className='text-2xl font-bold text-center mb-8'><b>Video Compenent</b></h1>
                <div className="video-upload-container">
                    <div className='container'>
                        <div {...getRootProps({ className: 'dropzone  bg-blue-100 rounded-3xl border-4 border-dashed border-blue-500' })}>
                            <input {...getInputProps()} />
                            <p className='text-lg font-semibold'>Drag 'n' drop some files here</p>
                            <p className="text-lg font-bold">or</p>
                            <p className="text-lg font-semibold">click to select files</p>
                        </div>
                        {files.length > 0 && (
                            <div className="progress-bar">
                                <div style={{ width: `${uploadProgress[files[0].name]}%` }}></div>
                            </div>
                        )}
                    </div>
                    <div className="side-panel bg-gray-200 rounded-3xl">
                        {uploadedFile != null ? (
                            <div>
                                <h3>Uploaded File:</h3>
                                <p>{uploadedFile.name}</p>
                                <video controls>
                                    <source src={URL.createObjectURL(uploadedFile)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <div className="h-full flex justify-center items-center">
                                <p className="text-lg font-semibold text-gray-500 text-center">
                                    No Files Uploaded Yet
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoUploadComponent
