from PIL import Image, ImageDraw, ImageFont, ImageOps
import random
import math

def create_detailed_image(image: Image.Image, text: str, filter_type: str = None) -> Image.Image:
    print(f"Original image format: {image.format}")  
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    draw = ImageDraw.Draw(image)
    font_path = "static/fonts/Verdana.ttf"
    
    try:
        font_size = 100
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        font = ImageFont.load_default()

    # Apply filters if specified
    if filter_type:
        if 'negative' in filter_type:
            image = image.convert('RGB')  # Ensure image is RGB for negative filter
            image = ImageOps.invert(image)
        if 'black_and_white' in filter_type:
            image = image.convert('L')  # Convert to grayscale
            threshold = 128
            image = image.point(lambda p: 255 if p > threshold else 0, mode='1')

    # Add random patternful shapes
    for _ in range(5):
        shape_type = random.choice(['polygon', 'star', 'spiral'])
        
        if shape_type == 'polygon':
            sides = random.randint(3, 8) 
            radius = random.randint(20, 50)  # Random radius
            center_x, center_y = random.randint(radius, image.width - radius), random.randint(radius, image.height - radius)
            
           
            vertices = []
            for i in range(sides):
                angle = 2 * math.pi * i / sides
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                vertices.append((x, y))
            
            draw.polygon(vertices, outline=(255, 255, 255), width=3)
        
        elif shape_type == 'star':
            num_points = random.randint(5, 9) * 2  
            radius = random.randint(20, 50)  
            center_x, center_y = random.randint(radius, image.width - radius), random.randint(radius, image.height - radius)
            inner_radius = radius // 2  # Inner radius
            
            points = []
            for i in range(num_points):
                angle = math.pi / 2 + 2 * math.pi * i / num_points
                if i % 2 == 0:
                    x = center_x + radius * math.cos(angle)
                    y = center_y + radius * math.sin(angle)
                else:
                    x = center_x + inner_radius * math.cos(angle)
                    y = center_y + inner_radius * math.sin(angle)
                points.append((x, y))
            
            draw.polygon(points, outline=(255, 255, 255), width=3)
        
        elif shape_type == 'spiral':
            turns = random.randint(2, 4)  # Random number of turns
            line_length = random.randint(10, 30)  # Length of each segment of the spiral
            start_x, start_y = random.randint(0, image.width), random.randint(0, image.height)
            angle = 0
            
            for _ in range(turns * 360 // 10):  # 360 degrees divided by 10 degree steps per turn
                end_x = start_x + line_length * math.cos(math.radians(angle))
                end_y = start_y + line_length * math.sin(math.radians(angle))
                draw.line((start_x, start_y, end_x, end_y), fill=(255, 255, 255), width=2)
                start_x, start_y = end_x, end_y
                angle += 10
        
    
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_position = ((image.width - text_width) // 2, 20)
    text_color = (255, 255, 255)  
    draw.text(text_position, text, font=font, fill=text_color, stroke_width=10, stroke_fill=(0,0,0))

    # random lines
    for _ in range(3):
        x0, y0 = random.randint(0, image.width), random.randint(0, image.height)
        x1, y1 = random.randint(0, image.width), random.randint(0, image.height)
        draw.line((x0, y0, x1, y1), fill=(255, 255, 255), width=2)  

    # random points
    for _ in range(100):
        x, y = random.randint(0, image.width), random.randint(0, image.height)
        draw.point((x, y), fill=(255, 255, 255))  

    return image
