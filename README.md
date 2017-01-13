# Photomosaic

## Introduction

This is a client-side application to convert an uploaded image into a photomosaic. Photomosaic, a portmanteau of photo and mosaic, is a picture (usually a photograph) that has been divided into (usually equal sized) tiled sections, each of which is replaced with another photograph that matches the target photo. When viewed at low magnifications, the individual pixels appear as the primary image.

## How do I get set up?

#### Clone photo-mosaic repo (from private repo at Gitlab)
```
$ git clone https://github.com/Ankita-Mehta/Photomosaic.git
```

If you can't access this repo, then extract the code from the zip folder.

#### Install NPM project dependencies
```
npm install
```

## Bundling the Application
```
npm run build:prod
```

## Running the Application
```
npm start
```

## Running the Application in DEV environment (watch mode)
```
npm run build
```

## Running Lint
```
npm run lint
```

## Application Structure

```
.
├── server.js                # Server start script
├── js
│   └── app.js               # Client application entry point
│   └── constants            # Constant shared between server and client
│   └── utils                # Utility methods used by the application
├── css                      # CSS used in the application
├── resources                # Static resources such as images, original Canva README.md
```

## Landing Page
![image](http://i.imgur.com/QZc4QHS.png)

## Before Processing
![image](http://i.imgur.com/pYmSSil.png)

## After Processing
![image](http://i.imgur.com/acFm9Km.png)

## After using a filter
![image](http://i.imgur.com/KjPqqIj.png)

## Notes
* The original images are not resized or scaled before the image rendering starts
* The application has been tested on Chrome and Safari
* For transparent images the image background is set to black color
* In order to make the images in proportion with tile height and width, in some images you may see the image being trimmed from the edges.
