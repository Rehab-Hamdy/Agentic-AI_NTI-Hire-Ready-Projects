# Flower Classification: CNN vs Transfer Learning

Image classification on the [Flowers Recognition dataset](https://www.kaggle.com/datasets/alxmamaev/flowers-recognition) (5 classes: daisy, dandelion, rose, sunflower, tulip), comparing a CNN trained from scratch against four transfer-learning backbones (VGG19, EfficientNetB0, MobileNetV2, ResNet50).

## Results

| Model | Accuracy | Weighted F1 | Macro F1 |
|---|---|---|---|
| **EfficientNetB0** | **0.9316** | **0.9316** | **0.9296** |
| VGG19 | 0.9166 | 0.9166 | 0.9148 |
| ResNet50 | 0.9131 | 0.9133 | 0.9094 |
| MobileNetV2 | 0.8864 | 0.8869 | 0.8846 |
| CNN From Scratch | 0.7509 | 0.7503 | 0.7444 |

EfficientNetB0 achieved the best performance across all metrics, followed closely by VGG19 and ResNet50. All transfer-learning models substantially outperformed the CNN trained from scratch, confirming the benefit of ImageNet-pretrained features on this relatively small dataset.

## Project Structure

- `flowers_recognition_cnn.ipynb` — main notebook: data loading/exploration, augmentation, model training, evaluation, and comparison
- Trained model weights (`.keras`) saved per model (VGG19, EfficientNetB0, MobileNetV2, ResNet50, CNN)

## Approach

1. **Data loading** — images loaded via `tf.keras.utils.image_dataset_from_directory` with an 80/20 train/validation split (fixed seed for reproducibility across models)
2. **Augmentation** — random flip, rotation, zoom, and translation applied during training
3. **Models**
   - CNN from scratch (custom architecture)
   - VGG19, EfficientNetB0, MobileNetV2, ResNet50 — pretrained on ImageNet, with a custom classification head and each backbone's appropriate preprocessing
4. **Evaluation** — accuracy, weighted F1, macro F1, classification report, and confusion matrix per model
5. **Comparison** — all results collected into a single table and visualized