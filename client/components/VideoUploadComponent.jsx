import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import axios from 'axios';
import './VideoUploadComponent.css';

function VideoUploadComponent() {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [selectedFormat, setSelectedFormat] = useState('mp4');

    const onDrop = acceptedFiles => {
        setFiles(acceptedFiles);
        handleUpload(acceptedFiles);
    };

    const handleUpload = async (acceptedFiles) => {
        const ffmpeg = createFFmpeg({ log: true });

        // Load FFmpeg
        await ffmpeg.load();

        const promises = [];

        // Convert video for each selected format
        acceptedFiles.forEach(async file => {
            const { name } = file;
            ffmpeg.FS('writeFile', name, await fetchFile(file));

            // Determine output file extension
            let outputExt = selectedFormat;
            await ffmpeg.run('-i', name, `output.${outputExt}`);

            // Fetch the result
            const data = ffmpeg.FS('readFile', `output.${outputExt}`);

            // Prepare FormData for upload
            const formData = new FormData();
            formData.append('file', new File([data.buffer], `output.${outputExt}`));

            // Upload the converted file
            promises.push(
                axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent;
                        let percent = Math.floor((loaded * 100) / total);
                        setUploadProgress(prevProgress => ({
                            ...prevProgress,
                            [name]: percent
                        }));
                    }
                }).then(response => {
                    setUploadedFiles(prevFiles => ({
                        ...prevFiles,
                        [name]: data
                    }));
                }).catch(error => {
                    console.error('Error uploading file', error);
                })
            );
        });

        // Wait for all uploads to complete
        await Promise.all(promises);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'video/*'
    });

    const handleFormatChange = (format) => {
        setSelectedFormat(format);
    };

    const handleDownload = (file) => {
        const url = URL.createObjectURL(new Blob([file.data.buffer], { type: `video/${selectedFormat}` }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace(/\.[^/.]+$/, '')}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className='flex justify-center items-center h-screen bg-blue-200'>
            <div className='box mt-10 max-w-5xl p-8 bg-white custom-rounded shadow-lg'>
                <h1 className='text-2xl font-bold text-center mb-8'><b>Video Component</b></h1>
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
                        <div className="format-select">
                            <label>Select Output Format:</label>
                            <select value={selectedFormat} onChange={(e) => handleFormatChange(e.target.value)}>
                                <option value="mp4">MP4</option>
                                <option value="avi">AVI</option>
                                <option value="webm">WebM</option>
                                <option value="mov">MOV</option>
                                <option value="mkv">MKV</option>
                            </select>
                        </div>
                    </div>
                    <div className="side-panel bg-gray-200 rounded-3xl">
                        {Object.keys(uploadedFiles).length > 0 ? (
                            <div>
                                <h3>Uploaded Files:</h3>
                                {Object.keys(uploadedFiles).map(key => (
                                    <div key={key}>
                                        <p>{key}</p>
                                        <video controls>
                                            <source src={URL.createObjectURL(new Blob([uploadedFiles[key].data.buffer], { type: `video/${selectedFormat}` }))} type={`video/${selectedFormat}`} />
                                            Your browser does not support the video tag.
                                        </video>
                                        <button onClick={() => handleDownload(uploadedFiles[key])}>Download {selectedFormat.toUpperCase()}</button>
                                    </div>
                                ))}
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
    );
}

export default VideoUploadComponent;
