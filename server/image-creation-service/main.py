from fastapi import FastAPI, File, UploadFile, Form, Query, HTTPException
from create_image import create_detailed_image
from PIL import Image
from io import BytesIO
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/generate_image/")
async def generate_image(
    file: UploadFile = File(...),
    text: str = Form(""),
    filter_type: str = Query(None, description="Type of filter to apply (black_and_white, negative)")
):

    try:
        # Reading the given uploaded file
        contents = await file.read()
        
        # Opening image from bytes
        image = Image.open(BytesIO(contents))
        
       
        processed_image = create_detailed_image(image, text, filter_type)
        
      
        img_byte_arr = BytesIO()
        processed_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        # Return the processed image as a streaming response
        return StreamingResponse(img_byte_arr, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
