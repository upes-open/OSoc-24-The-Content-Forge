from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import boto3
from botocore.exceptions import NoCredentialsError
import moviepy.editor as mp
from moviepy.video.tools.subtitles import SubtitlesClip
from typing import List
import os
import asyncio
import aiohttp
import tempfile

app = FastAPI()

# Configure S3 client
s3_client = boto3.client('s3')
BUCKET_NAME = 'your-s3-bucket-name'
S3_ACCESS_KEY = 'your-s3-access-key'
S3_SECRET_KEY = 'your-s3-secret-key'

# Whisper service URL
WHISPER_SERVICE_URL = "http://localhost:8000/whisper"  # Update with actual URL

class SubtitleStyle(BaseModel):
    font: str = 'Arial'
    fontsize: int = 24
    color: str = 'white'
    stroke_color: str = 'black'
    stroke_width: int = 1

class VideoCreationRequest(BaseModel):
    subtitle_style: SubtitleStyle
    output_format: str = 'mp4'

async def extract_audio(video_path: str) -> str:
    audio_path = video_path.rsplit('.', 1)[0] + '.wav'
    video = mp.VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)
    return audio_path

async def generate_subtitles(audio_path: str) -> List[dict]:
    async with aiohttp.ClientSession() as session:
        with open(audio_path, 'rb') as f:
            form_data = aiohttp.FormData()
            form_data.add_field('file', f)
            form_data.add_field('s3_access_key', S3_ACCESS_KEY)
            form_data.add_field('s3_secret_key', S3_SECRET_KEY)
            form_data.add_field('s3_bucket_name', BUCKET_NAME)

            async with session.post(WHISPER_SERVICE_URL, data=form_data) as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail="Failed to generate subtitles")
                result = await response.json()

    # Convert the transcript to subtitle format
    # This is a simple conversion, you may need to adjust it based on your needs
    words = result['transcript'].split()
    subtitles = []
    for i, word in enumerate(words):
        subtitles.append({
            'start': i * 0.5,  # Assume each word takes 0.5 seconds
            'end': (i + 1) * 0.5,
            'text': word
        })
    return subtitles

async def process_video(video_file: UploadFile, request: VideoCreationRequest):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(await video_file.read())
        temp_video_path = temp_video.name

    try:
        # Extract audio
        audio_path = await extract_audio(temp_video_path)

        # Generate subtitles
        subtitles = await generate_subtitles(audio_path)

        # Create video with subtitles
        video = mp.VideoFileClip(temp_video_path)
        subtitled_video = add_subtitles_to_video(video, subtitles, request.subtitle_style)

        # Save the final video
        output_path = f"output_{video_file.filename}"
        subtitled_video.write_videofile(output_path, codec='libx264', audio_codec='aac')

        # Upload to S3
        s3_key = f"videos/{output_path}"
        s3_client.upload_file(output_path, BUCKET_NAME, s3_key)

        # Clean up temporary files
        os.remove(temp_video_path)
        os.remove(audio_path)
        os.remove(output_path)

        return s3_key
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def add_subtitles_to_video(video: mp.VideoFileClip, subtitles: List[dict], style: SubtitleStyle):
    def make_textclip(txt):
        return mp.TextClip(txt, font=style.font, fontsize=style.fontsize, color=style.color,
                           stroke_color=style.stroke_color, stroke_width=style.stroke_width)

    subtitles_clip = SubtitlesClip(subtitles, make_textclip)
    return mp.CompositeVideoClip([video, subtitles_clip.set_pos(('center', 'bottom'))])

@app.post("/create-video/")
async def create_video(video: UploadFile = File(...), request: VideoCreationRequest = None):
    if not video:
        raise HTTPException(status_code=400, detail="No video file provided")

    if not request:
        request = VideoCreationRequest(subtitle_style=SubtitleStyle())

    s3_key = await process_video(video, request)
    return {"message": "Video processed successfully", "s3_key": s3_key}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)