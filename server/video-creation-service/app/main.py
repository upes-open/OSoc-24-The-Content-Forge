from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from moviepy.editor import VideoFileClip, CompositeVideoClip
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import os
import requests
from tempfile import NamedTemporaryFile
from .utils import create_subtitle_clips

app = FastAPI()

# Whisper service URL
WHISPER_SERVICE_URL = "http://localhost:8000/whisper"  

class VideoCreationRequest(BaseModel):
    output_format: str = 'mp4'

@app.get("/")
async def read_root():
    return {"message": "Video Creation Service"}

@app.post("/create_video/")
async def create_video(
    video: UploadFile = File(...),
    request: VideoCreationRequest = VideoCreationRequest(),
    s3_access_key: str = Form(...),
    s3_secret_key: str = Form(...),
    s3_bucket_name: str = Form(...)
):
    try:
        # Save uploaded video temporarily
        temp_video = NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_video.write(video.file.read())
        temp_video.close()

        # Extract audio from video
        video_clip = VideoFileClip(temp_video.name)
        audio = video_clip.audio
        temp_audio = NamedTemporaryFile(delete=False, suffix=".wav")
        audio.write_audiofile(temp_audio.name)

        # Call Whisper service for transcription and subtitles
        with open(temp_audio.name, "rb") as audio_file:
            files = {"file": ("audio.wav", audio_file, "audio/wav")}
            whisper_response = requests.post(WHISPER_SERVICE_URL, files=files)
        
        if whisper_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio and generate subtitles")
        
        subtitles = whisper_response.json()["transcript"]

        # Create subtitle clips
        subtitle_clips = create_subtitle_clips(subtitles, video_clip.duration)

        # Combine video with subtitles
        final_clip = CompositeVideoClip([video_clip] + subtitle_clips)

        # Write the final video
        output_path = f"output_{video.filename}"
        final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")

        # Upload to S3
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=s3_access_key,
                aws_secret_access_key=s3_secret_key
            )
            s3_key = f"videos/{output_path}"
            s3_client.upload_file(output_path, s3_bucket_name, s3_key)
            file_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{s3_key}"
        except (NoCredentialsError, PartialCredentialsError):
            raise HTTPException(status_code=403, detail="S3 credentials are not valid.")

        # Clean up temporary files
        os.remove(temp_video.name)
        os.remove(temp_audio.name)
        os.remove(output_path)

        return {
            "message": "Video created successfully",
            "file_url": file_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)