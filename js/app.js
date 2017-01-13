(function init() {
  const uploadInputEl = document.getElementById('upload-container__input');
  const imageDropperEl = document.getElementById('image__file-dropper');
  const imageEl = document.getElementById('image');
  const uploadImageLabelEl = document.querySelector('.upload-container__label');

  const filterContainerEl = document.querySelector('.filter');
  const filterValueEls = document.querySelectorAll('.filter__dd__value');

  let canvas, context;
  let CANVAS_HEIGHT, CANVAS_WIDTH;

  let TITLE_COLOR_CACHE = {};

  /* The last selected image will be used for filters */
  let lastImageUsed;

  const DIR_COLOR = '/color';
  const CHUNKS_COUNT = 10;

  /* Resets the image container */
  function clearImage() {
    imageEl.innerHTML = '';
  }

  /* Toggle progress bar on Upload Image Label container */
  function toggleUploading(show) {
    uploadImageLabelEl.classList.toggle('uploading', show);
  }

  /* Upload an image from the local machine */
  function uploadImage(imageFile, callback, filter) {
    const reader = new FileReader();

    reader.onload = e => {
      let image = new Image();

      image.src = e.target.result;

      callback(image, filter);
    };

    reader.readAsDataURL(imageFile);
  }

  /* Gets an image to be used for a tile belonging to a particular row and col */
  function getTileImage(resolve, reject, col, row, filter) {
    const [TILE_X, TILE_Y] = [col * TILE_WIDTH, row * TILE_HEIGHT];

    const imageData = context.getImageData(TILE_X, TILE_Y, TILE_WIDTH, TILE_HEIGHT);

    const color = getAverageHexTileColor(imageData.data, filter);
    const cachedImage = TITLE_COLOR_CACHE[color];

    // Use the cached image instead of fetching for a new one.
    if (cachedImage) {
      return resolve({
        image: cachedImage,
        x: TILE_X,
        y: TILE_Y
      });
    }

    let image = new Image();

    image.onload = () => {
      TITLE_COLOR_CACHE[color] = image;

      resolve({
        image,
        x: TILE_X,
        y: TILE_Y
      });
    };

    image.src = `${DIR_COLOR}/${color}`;
  }

  function getRowChunk (resolve, reject, rowsStart, rowsCount, filter) {
    const COLS = Math.floor(CANVAS_WIDTH / TILE_WIDTH);

    const rowEnd = rowsStart + rowsCount;

    let promises = [];

    for (let row = rowsStart; row < rowEnd; row++) {
      for (let col = 0; col < COLS; col++) {
        let promise = new Promise((resolve, reject) => {
          getTileImage(resolve, reject, col, row, filter);
        });

        promises.push(promise);
      }
    }

    Promise.all(promises).then((images) => {
      resolve(images);
    }, (error) => console.log('Failed to load the images. Error:', error));
  }

  /* Converts an image to a mosaic form */
  function convertImageToMosaic (context, filter) {
    /* Draw the image in proportion to fit every tile.
    * Handles the case when a pure white image is uploaded and the borders are shown as black.
    */
    const ROWS = Math.floor(CANVAS_HEIGHT / TILE_HEIGHT);
    const COLS = Math.floor(CANVAS_WIDTH / TILE_WIDTH);
    const ROW_CHUNKS = Math.floor(ROWS / CHUNKS_COUNT);

    /* To care of the case when:
    * Row size is a not multiple of chunk count,
    * so the last chunk should take the remaining rows
    */
    const LAST_CHUNK_START_INDEX = (ROW_CHUNKS * (CHUNKS_COUNT - 1));

    let promises = [];

    /*
     Image Rows is divided between the chunks
     + - - - - - - - +
     | + - - - - - + |
     | |           | |
     | |   Chunk1  | |
     | |           | |
     | + - - - - - + |
     | + - - - - - + |
     | |           | |
     | |   Chunk2  | |
     | |           | |
     | + - - - - - + |
     | + - - - - - + |
     | |           | |
     | |    ...    | |
     | |           | |
     | + - - - - - + |
     | + - - - - - + |
     | |           | |
     | |   ChunkN  | |
     | |           | |
     | + - - - - - + |
     + - - - - - - - +
     */

    for (let index = 0; index < (ROW_CHUNKS * CHUNKS_COUNT); index += ROW_CHUNKS) {
      /* To care of the case when rows is not divisible by chunk count */
      const isLastChunkStartIndex = (index === LAST_CHUNK_START_INDEX);

      let promise = new Promise((resolve, reject) => {
        getRowChunk(resolve, reject, index, isLastChunkStartIndex ? (ROWS - LAST_CHUNK_START_INDEX) : ROW_CHUNKS, filter);
      });

      promises.push(promise);
    }

    /* Renders tile images one by one, after all the images are fetched for each chunk */
    Promise.all(promises).then((chunkImages) => {
      /* Clear the already rendered original image */
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      /* To make the image in proportion to the tile height and width */
      CANVAS_HEIGHT = canvas.height = ROWS * TILE_HEIGHT;
      CANVAS_WIDTH = canvas.width = COLS * TILE_WIDTH;

      for (let images of chunkImages) {
        for (let image of images) {
          context.drawImage(image.image, image.x, image.y);
        }
      }

      toggleUploading(false);
      filterContainerEl.classList.remove('hide');
    }, (error) => console.log('Failed to load the images while rendering for each row. Error:', error));
  }

  /* Renders an image on a canvas */
  function renderImageOnCanvas(image, filter) {
    canvas = document.createElement('canvas');

    CANVAS_HEIGHT = canvas.height = image.height;
    CANVAS_WIDTH = canvas.width = image.width;

    if (!canvas.getContext) {
      console.log('Canvas not supported. Please install a HTML5 compatible browser.');
      return;
    }

    context = canvas.getContext('2d');

    /* Set the image background as black when transparent images are uploaded */
    context.fillStyle = 'rgb(0,0,0)';

    context.drawImage(image, 0, 0);

    imageEl.appendChild(canvas);

    convertImageToMosaic(context, filter);
  }

  function preUploadImage() {
    clearImage();
    toggleUploading(true);
  }

  /* Listen to image upload and mosaic render actions. */
  uploadInputEl.onchange = event => {
    /* If the user presses cancel instead of uploading an image */
    if (!event.target || !event.target.files.length) {
      return;
    }

    preUploadImage();

    lastImageUsed = event.target.files[0];

    uploadImage(event.target.files[0], renderImageOnCanvas);
  };

  imageDropperEl.ondragover = (event) => {
    event.preventDefault();

    imageDropperEl.classList.add('image__file-dropper--drop');
  };

  imageDropperEl.ondragleave = (event) =>  {
    event.preventDefault();

    imageDropperEl.classList.remove('image__file-dropper--drop');
  };

  imageDropperEl.ondrop = (event) =>  {
    event.stopPropagation();
    event.preventDefault();

    imageDropperEl.classList.remove('image__file-dropper--drop');

    preUploadImage();

    lastImageUsed = event.dataTransfer.files[0];

    uploadImage(event.dataTransfer.files[0], renderImageOnCanvas);
  };

  function onFilterSelect(event) {
    event.stopPropagation();

    const targetEl = event.currentTarget;
    const filter = targetEl.getAttribute('data-filter');

    preUploadImage();

    uploadImage(lastImageUsed, renderImageOnCanvas, filter);
  }

  Array.from(filterValueEls).forEach((filterEl) => {
    filterEl.addEventListener('click', onFilterSelect);
  });
})();