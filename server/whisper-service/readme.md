# Whisper Microservice

This is a FastAPI microservice that uses OpenAI's Whisper model to process audio files and extract subtitles. The audio files can be optionally stored in an S3 bucket.

## Setup

1. Build the Docker image:
    ```sh
    docker build -t whisper_microservice .
    ```

2. Run the Docker container:
    ```sh
    docker run -d -p 8000:8000 whisper_microservice
    ```

3. Access the application:
...Open your web browser and navigate to http://127.0.0.1:8000/docs#/default/transcribe_audio_whisper_post to access the Swagger UI.

... Test the `/whisper` endpoint using the Swagger UI by uploading an audio file.

## Configuration

Update the `app/main.py` file with your S3 bucket name, access key, and secret key.

## API Endpoints

- **GET /**:  Returns a simple "Whisper Hello World!" message.
- **POST /whisper**: Accepts audio files and returns their transcriptions. Optionally stores the file in an S3 bucket if configured.

To enable S3 integration, uncomment the relevant sections in `app/main.py`.
