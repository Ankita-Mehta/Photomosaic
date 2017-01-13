let exports = exports || null;

const enhance = (imageData) => {
  const newImageData = imageData;
  const n = newImageData.length;

  for (let i = 0; i < n; i += 4) {
    newImageData[i] = newImageData[i] * 1.24;         // red
    newImageData[i + 1] = newImageData[i + 1] * 1.33; // green
    newImageData[i + 2] = newImageData[i + 2] * 1.21; // blue
  }

  return newImageData;
};

const grayscale = (imageData) => {
  const newImageData = imageData;
  const n = newImageData.length;

  for (let i = 0; i < n; i += 4) {
    const red = newImageData[i];
    const green = newImageData[i + 1];
    const blue = newImageData[i + 2];

    const grayscale = convertNTSC(red, green, blue);

    newImageData[i] = grayscale;
    newImageData[i + 1] = grayscale;
    newImageData[i + 2] = grayscale;
  }

  return newImageData;
};

const sepia = (imageData) => {
  const newImageData = imageData;
  const n = newImageData.length;

  for (let i = 0; i < n; i += 4) {
    newImageData[i] = newImageData[i] * 1.07;
    newImageData[i + 1] = newImageData[i + 1] * 0.74;
    newImageData[i + 2] = newImageData[i + 2] * 0.43;
  }

  return newImageData;
};

const processImageDataForAFilter = (imageData, filter) => {
  const FILTER_FUNCTION_MAPPING = {
    ENHANCE: enhance,
    GRAYSCALE: grayscale,
    SEPIA: sepia
  };

  return FILTER_FUNCTION_MAPPING[filter](imageData);
};


if (exports) {
  exports.processImageDataForAFilter = processImageDataForAFilter;
}


