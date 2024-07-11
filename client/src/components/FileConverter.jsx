import React, { useState, useEffect } from 'react';
import { convertVideo } from '../util/videoConvertService';

const FileConverter = () => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const convertedBlob = await convertVideo(file, 'mp4');
      const url = URL.createObjectURL(convertedBlob);
      setOutput(url);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept="video/*"
        className="mb-4"
      />

      <button
        onClick={handleConvert}
        disabled={!file || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Converting...' : 'Convert'}
      </button>

      {output && (
        <div className="mt-4">
          <video controls src={output} className="w-full max-w-md" />
          <a
            href={output}
            download={`converted.mp4`}
            className="block mt-2 text-blue-500"
          >
            Download converted file
          </a>
        </div>
      )}
    </div>
  );
};

export default FileConverter;
