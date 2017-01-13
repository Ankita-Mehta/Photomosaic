let exports = exports || null;

/* RGB to HEX conversion. Adds any required zero padding */
const rgbToHex = (r, g, b) => {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const convertNTSC = (red, green, blue) => {
  return red * 0.29 + green * 0.58 + blue * 0.11;
};

/* Returns the average tile color as a HEX value */
const getAverageHexTileColor = (imageData, filter) => {
  if(filter) {
    imageData = processImageDataForAFilter(imageData, filter);
  }

  let TILE_SUM = [0, 0, 0];

  /* Considering only rgb values */
  for (let i = 3; i < imageData.length; i += 4) {
    const [r, g, b] = [imageData[i - 3], imageData[i - 2], imageData[i - 1]];

    TILE_SUM[2] += b;
    TILE_SUM[1] += g;
    TILE_SUM[0] += r;
  }

  /* Returns the average tile color as a HEX value */
  const color = TILE_SUM.map(index => Math.round(index/(TILE_SIZE)));

  return rgbToHex(...color);
};

if (exports) {
  exports.convertNTSC = convertNTSC;
  exports.getAverageHexTileColor = getAverageHexTileColor;
}


