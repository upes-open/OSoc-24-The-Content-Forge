import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        'text/javascript'
      ),
    });

    ffmpeg.on('log', ({ message }) => {
      // console.log('FFmpeg Log:', message);
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      console.log(
        `FFmpeg Progress: ${(progress * 100).toFixed(2)}% (${time.toFixed(
          2
        )} seconds)`
      );
    });

    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  }
};

export const convertVideo = async (inputFile, outputFormat) => {
  const ffmpeg = await loadFFmpeg();

  const inputFileName =
    'input' + inputFile.name.substring(inputFile.name.lastIndexOf('.'));
  const outputFileName = `output.${outputFormat}`;

  await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

  let ffmpegCommand = ['-i', inputFileName];

  ffmpegCommand.push(outputFileName);

  console.log('FFmpeg command:', ffmpegCommand.join(' '));

  await ffmpeg.exec(ffmpegCommand);

  const data = await ffmpeg.readFile(outputFileName);
  return new Blob([data.buffer], { type: `video/${outputFormat}` });
};
