# Use the official Python image from the Docker Hub
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file and install dependencies
COPY requirements.txt .
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install "git+https://github.com/openai/whisper.git"

# Copy the rest of the application code
COPY . .

# Command to run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
