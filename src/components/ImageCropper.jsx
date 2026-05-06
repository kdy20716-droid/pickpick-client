import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImgBlob } from '../utils/cropImage';
import styles from './ImageCropper.module.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImgBlob(image, croppedAreaPixels);
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
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            cropShape="round"
            showGrid={false}
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
              onChange={(e) => setZoom(e.target.value)}
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
