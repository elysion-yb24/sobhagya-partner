import imageCompression ,{Options}from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File | null> => {
  const options: Options = {
    maxSizeMB: 0.5,
    useWebWorker: true,
    preserveExif: true,
    fileType: 'image/jpeg',
    // alwaysKeepResolution: true // Uncomment if needed
  };

  try {
    const result: File = await imageCompression(file, options);
    return result;
  } catch (err: any) {
    console.error('Err in compressing image', err.message);
    return null;
  }
};
