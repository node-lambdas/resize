import { lambda, Format } from '@node-lambdas/core';
import sharp from 'sharp';

const MAX_DIMENSION = 3840;
const FORMATS = ['webp', 'png', 'jpeg', 'raw'];

const configutation = {
  version: 2,
  actions: {
    default: {
      input: Format.Buffer,
      handler: async (input, output) => {
        const { options } = input;
        const { width, height } = readDimensions(options);
        const { format } = options;

        const validFormat = (format && FORMATS.includes(format) && format) || '';
        const resizeOptions = width && height ? {
          fit: sharp.fit.inside,
          withoutEnlargement: !options.zoom
        } : undefined;

        let image = sharp(input.body).resize(width, height, resizeOptions);

        image = options.withMetadata ? image.withMetadata() : image;
        image = validFormat ? image[validFormat]() : image;

        output.send(image.toBuffer());
      },
    },
  },
};

function readDimensions(options) {
  const inputWidth = Number(options.width) || undefined;
  const inputHeight = Number(options.height) || undefined;

  const width = inputWidth ? Math.min(MAX_DIMENSION, inputWidth) : inputWidth;
  const height = inputHeight ? Math.min(MAX_DIMENSION, inputHeight) : inputHeight;

  return {
    width: width > 0 ? width : undefined,
    height: height > 0 ? height : undefined,
  };
}

lambda(configutation);
