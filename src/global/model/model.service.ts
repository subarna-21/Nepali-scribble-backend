/* eslint-disable prefer-const */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import * as tfn from '@tensorflow/tfjs-node';
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import * as textToImage from 'text-to-image';
// import ssim from 'ssim.js';
// import * as canvas from 'ca'

const training_set = {
  0: 'ञ',
  1: 'ट',
  2: 'ठ',
  3: 'ड',
  4: 'ढ',
  5: 'ण',
  6: 'त',
  7: 'थ',
  8: 'द',
  9: 'ध',
  10: 'क',
  11: 'न',
  12: 'प',
  13: 'फ',
  14: 'ब',
  15: 'भ',
  16: 'म',
  17: 'य',
  18: 'र',
  19: 'ल',
  20: 'व',
  21: 'ख',
  22: 'श',
  23: 'ष',
  24: 'स',
  25: 'ह',
  26: 'क्ष',
  27: 'त्र',
  28: 'ज्ञ',
  29: 'ग',
  30: 'घ',
  31: 'ङ',
  32: 'च',
  33: 'छ',
  34: 'ज',
  35: 'झ',
  36: '०',
  37: '१',
  38: '२',
  39: '३',
  40: '४',
  41: '५',
  42: '६',
  43: '७',
  44: '८',
  45: '९',
};

@Injectable()
export class ModelService {
  private readonly logger = new ConsoleLogger(ModelService.name);
  private model: tf.LayersModel;
  constructor() {
    const handler = tfn.io.fileSystem('./model/model.json');

    tf.loadLayersModel(handler)
      .then((model) => {
        this.model = model;
        // const example = t;
        this.logger.log('Model loaded');
      })
      .catch((err) => {
        this.logger.error('Model loading failed', err);
        process.exit(1);
      });
  }

  async predict(file: Express.Multer.File): Promise<string> {
    const imgTensor = await this.loadImage(file);
    // Make prediction
    const example = this.model.predict(imgTensor) as tf.Tensor;

    const prediction = await example.data();

    // Determine the predicted class
    const predictedClassIndex = tf.argMax(prediction).dataSync()[0];

    // Here, you need to map the index to the corresponding class label
    const classLabels = Object.keys(training_set);
    const predictedClass = classLabels[predictedClassIndex];

    return training_set[predictedClass];
  }

  private async loadImage(file: Express.Multer.File) {
    const image = await loadImage(file.buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Convert the image to a tensor
    const imgTensor = tf.browser
      .fromPixels(canvas as unknown as HTMLCanvasElement)
      .resizeNearestNeighbor([32, 32]) // Assuming your model expects 28x28 images
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims(0); // Add batch dimension

    return imgTensor;
  }

  private async generateImageFromChar(char: string) {
    const imageUri = await textToImage.generate(char, {
      debug: true,
      maxWidth: 720,
      fontSize: 18,
      fontFamily: 'Preeti',
      bgColor: 'white',
      textColor: 'black',
    });

    const image = this.dataURLtoFile(imageUri, 'char.png');

    return image;
  }

  private dataURLtoFile(dataurl: string, filename: string) {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // async checkSimilarity(testing: Express.Multer.File, tester: string) {
  //   const test = await this.generateImageFromChar(tester);
  //   const testingImage = await this.getImageDataFromFile(testing);
  //   const testerImage = await this.getImageDataFromFile(test);

  //   const sim = ssim(testingImage, testerImage, {
  //     ssim: 'fast',
  //   });

  //   return sim;
  // }
}
