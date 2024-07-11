from fastapi import FastAPI, File, UploadFile, HTTPException
import moviepy.editor as mp
from moviepy.video.tools.subtitles import SubtitlesClip
import os
import tempfile
from typing import List

app = FastAPI()

# Sample transcript
SAMPLE_TRANSCRIPT = """
0.0,2.0,Hello and welcome to this video.
2.0,4.0,Today, we're going to discuss an interesting topic.
4.0,6.0,I hope you find this information useful.
6.0,8.0,Let's get started with our main points.
8.0,10.0,First, we'll cover the basics.
10.0,12.0,Then, we'll dive into more advanced concepts.
12.0,14.0,Finally, we'll summarize what we've learned.
14.0,16.0,Thank you for watching!
"""

def generate_sample_subtitles() -> List[tuple]:
    subtitles = []
    for line in SAMPLE_TRANSCRIPT.strip().split('\n'):
        start, end, text = line.split(',', 2)
        subtitles.append(((float(start), float(end)), text))
    return subtitles

async def process_video(video_file: UploadFile):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(await video_file.read())
        temp_video_path = temp_video.name
    
    try:
        # Generate sample subtitles
        subtitles = generate_sample_subtitles()
        
        # Create video with subtitles
        video = mp.VideoFileClip(temp_video_path)
        subtitled_video = add_subtitles_to_video(video, subtitles)
        
        # Save the final video
        output_path = f"output_{video_file.filename}"
        subtitled_video.write_videofile(output_path, codec='libx264', audio_codec='aac')
        
        # Clean up temporary files
        os.remove(temp_video_path)
        
        return output_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def add_subtitles_to_video(video: mp.VideoFileClip, subtitles: List[tuple]):
    def make_textclip(txt):
        return mp.TextClip(txt, font='Arial-Bold', fontsize=90, color='white',
                           stroke_color='black', stroke_width=3, method='caption',
                           size=(video.w * 0.9, None), align='center')
    
    subtitles_clip = SubtitlesClip(subtitles, make_textclip)
    return mp.CompositeVideoClip([video, subtitles_clip.set_pos(('center', 'center'))])

@app.post("/create-video/")
async def create_video(video: UploadFile = File(...)):
    if not video:
        raise HTTPException(status_code=400, detail="No video file provided")
    
    try:
        output_path = await process_video(video)
        return {"message": "Video processed successfully", "output_path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)