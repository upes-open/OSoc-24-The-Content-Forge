from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from tempfile import NamedTemporaryFile
import whisper
import torch
import os
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

app = FastAPI()

# Checking if NVIDIA GPU is available
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Load the Whisper model
model = whisper.load_model("base", device=DEVICE)

@app.get("/")
async def read_root():
    return {"message": "Whisper Hello World!"}

@app.post("/whisper")
async def transcribe_audio(
    file: UploadFile = File(...),
    s3_access_key: str = Form(None),
    s3_secret_key: str = Form(None),
    s3_bucket_name: str = Form(None)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Create a temporary file.
    temp = NamedTemporaryFile(delete=False)
    temp.write(file.file.read())
    temp.close()

    file_url = None
    if s3_access_key and s3_secret_key and s3_bucket_name:
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=s3_access_key,
                aws_secret_access_key=s3_secret_key
            )
            s3_client.upload_file(temp.name, s3_bucket_name, file.filename)
            file_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{file.filename}"
        except (NoCredentialsError, PartialCredentialsError):
            raise HTTPException(status_code=403, detail="S3 credentials are not valid.")

    # Get the transcript of the temporary file.
    result = model.transcribe(temp.name)

    # Delete the temporary file
    os.remove(temp.name)

    response = {
        'filename': file.filename,
        'transcript': result['text'],
    }
    if file_url:
        response['file_url'] = file_url

    return response
