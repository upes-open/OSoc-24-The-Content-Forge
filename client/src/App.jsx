import { useState, useRef } from "react";
import "./styles/global.css";
import Video_Upload_Component from "../components/Video_Upload_Component";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

  const fileInputRef = useRef(null);
  const acceptedFileExtensions = ["mp3", "wav", "aac", "ogg"];

  const acceptedFileTypesString = acceptedFileExtensions
    .map((ext) => `.${ext}`)
    .join(",");

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError("File is required");
    } else if (!error) {

      setSelectedFiles([]);
      setError("");
      setUploadProgress({});
    }
  };

  const handleFileChange = (event) => {
    const newFilesArray = Array.from(event.target.files);
    processFiles(newFilesArray);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (filesArray) => {
    const newSelectedFiles = [...selectedFiles];
    let hasError = false;
    const fileTypeRegex = new RegExp(acceptedFileExtensions.join("|"), "i");
    filesArray.forEach((file) => {
      if (newSelectedFiles.some((f) => f.name === file.name)) {
        setError("File names must be unique");
        hasError = true;
      } else if (!fileTypeRegex.test(file.name.split(".").pop())) {
        setError(`Only ${acceptedFileExtensions.join(", ")} files are allowed`);
        hasError = true;
      } else {
        newSelectedFiles.push(file);
        uploadFile(file); // Start upload for each file
      }
    });

    if (!hasError) {
      setError("");
      setSelectedFiles(newSelectedFiles);
    }
  };

  const uploadFile = (file) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "your_upload_endpoint_here"); // Replace with desired upload endpoint
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const copy = { ...uploadProgress };
        copy[file.name] = (event.loaded / event.total) * 100;
        setUploadProgress(copy);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const copy = { ...uploadProgress };
        copy[file.name] = 100; // Ensuring it shows as complete
        setUploadProgress(copy);
      } else {
        setError("Failed to upload file");
      }
    };

    xhr.onerror = () => setError("Failed to upload file");

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileDelete = (index) => {
    const updatedFiles = [...selectedFiles];
    const [deletedFile] = updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    const updatedProgress = { ...uploadProgress };
    delete updatedProgress[deletedFile.name];
    setUploadProgress(updatedProgress);
  };

  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-blue-200">
        <div className="w-full max-w-5xl p-8 bg-white custom-rounded shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">Upload Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="min-h-[23rem] border-4 border-dashed border-blue-500 bg-blue-100 rounded-3xl p-4 flex flex-col justify-center items-center space-y-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e)}
            >
              <img
                src="/assets/svg/upload.svg"
                alt="Upload Icon"
                className="w-24 h-24 mb-2"
              />
              <p className="text-lg font-semibold">Drag and Drop the files</p>
              <p className="text-lg font-bold">or</p>
              <button
                type="button"
                onClick={handleCustomButtonClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Upload
              </button>
              <input
                type="file"
                id="files"
                name="files"
                multiple
                accept={acceptedFileTypesString}
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                onClick={(event) => {
                  event.target.value = null;
                }}
              />
            </div>

            <div className="border-2 border-gray-300 rounded-3xl py-4 max-h-[23rem] overflow-auto">
              {selectedFiles.length > 0 ? (
                <ul className="px-4">
                  {selectedFiles.map((file, index) => (
                    <li
                      key={file.name}
                      className="flex flex-col justify-between items-center border-b py-2"
                    >
                      <div className="flex items-center w-full">
                        <span className="text-base">{file.name}</span>
                      </div>
                      <audio controls src={URL.createObjectURL(file)} className="w-full mt-2">
                        Your browser does not support the audio element.
                      </audio>
                      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between w-full mt-2">
                        <button
                          type="button"
                          onClick={() => handleFileDownload(file)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:bg-green-600"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFileDelete(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="w-6 h-6"
                          >
                            <path
                              stroke="currentColor"
                              strokeWidth="2"
                              d="M6 4l8 8M14 4l-8 8"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex justify-center items-center">
                  <p className="text-lg font-semibold text-gray-500 text-center">
                    No Files Uploaded Yet
                  </p>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="video-component bg-blue-200">
        <Video_Upload_Component/>
      </div>
    </>
  );
}

export default App;
