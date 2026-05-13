import { useState } from "react";
import styles from "./ImageCropper.module.css";

const createImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const createCenteredSquareBlob = async (imageSrc, zoom) => {
  const img = await createImage(imageSrc);
  const sourceSize = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
  const sourceX = (img.naturalWidth - sourceSize) / 2;
  const sourceY = (img.naturalHeight - sourceSize) / 2;
  const canvas = document.createElement("canvas");
  const outputSize = 512;
  const ctx = canvas.getContext("2d");

  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
};

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [zoom, setZoom] = useState(1);

  const handleCrop = async () => {
    try {
      const croppedImageBlob = await createCenteredSquareBlob(image, zoom);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.title}>프로필 사진 크롭</h3>
        <div className={styles.cropperContainer}>
          <img
            src={image}
            alt=""
            className={styles.previewImage}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
        <div className={styles.controls}>
          <div className={styles.zoomControl}>
            <label>Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.zoomRange}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
            <button className={styles.cropBtn} onClick={handleCrop}>확인</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
