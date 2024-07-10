from moviepy.editor import TextClip
from typing import List

def create_subtitle_clips(subtitles: List[dict], video_duration: float) -> List[TextClip]:
    subtitle_clips = []
    for sub in subtitles:
        start, end = sub['start'], sub['end']
        text = sub['text']
        clip = TextClip(text, fontsize=24, font='Arial', color='white',
                        stroke_color='black', stroke_width=1)
        clip = clip.set_position(('center', 'bottom')).set_duration(end - start).set_start(start)
        subtitle_clips.append(clip)
    return subtitle_clips