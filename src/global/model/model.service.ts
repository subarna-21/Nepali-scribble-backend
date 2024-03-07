import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import * as tfn from '@tensorflow/tfjs-node';
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
// import * as canvas from 'ca'

const training_set = {
  0: 'character_10_yna',
  1: 'character_11_taamatar',
  2: 'character_12_thaa',
  3: 'character_13_daa',
  4: 'character_14_dhaa',
  5: 'character_15_adna',
  6: 'character_16_tabala',
  7: 'character_17_tha',
  8: 'character_18_da',
  9: 'character_19_dha',
  10: 'character_1_ka',
  11: 'character_20_na',
  12: 'character_21_pa',
  13: 'character_22_pha',
  14: 'character_23_ba',
  15: 'character_24_bha',
  16: 'character_25_ma',
  17: 'character_26_yaw',
  18: 'character_27_ra',
  19: 'character_28_la',
  20: 'character_29_waw',
  21: 'character_2_kha',
  22: 'character_30_motosaw',
  23: 'character_31_petchiryakha',
  24: 'character_32_patalosaw',
  25: 'character_33_ha',
  26: 'character_34_chhya',
  27: 'character_35_tra',
  28: 'character_36_gya',
  29: 'character_3_ga',
  30: 'character_4_gha',
  31: 'character_5_kna',
  32: 'character_6_cha',
  33: 'character_7_chha',
  34: 'character_8_ja',
  35: 'character_9_jha',
  36: 'digit_0',
  37: 'digit_1',
  38: 'digit_2',
  39: 'digit_3',
  40: 'digit_4',
  41: 'digit_5',
  42: 'digit_6',
  43: 'digit_7',
  44: 'digit_8',
  45: 'digit_9',
};

@Injectable()
export class ModelService {
  private readonly logger = new ConsoleLogger(ModelService.name);
  private model: tf.LayersModel;
  constructor() {
    const handler = tfn.io.fileSystem(
      '/Users/mac/aitc/college-projects/subarna/devanagari-character-recognition/model/model.json',
    );
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

  async predict(file: Express.Multer.File) {
    const imgTensor = await this.loadImage(file);
    // Make prediction
    const example = this.model.predict(imgTensor) as tf.Tensor;

    const prediction = await example.data();

    // Determine the predicted class
    const predictedClassIndex = tf.argMax(prediction).dataSync()[0];

    console.log(predictedClassIndex);

    // Here, you need to map the index to the corresponding class label
    const classLabels = Object.keys(training_set);
    const predictedClass = classLabels[predictedClassIndex];

    console.log('Predicted class:', training_set[predictedClass]);
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
}
