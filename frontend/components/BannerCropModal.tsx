'use client';

import Cropper, { Area } from 'react-easy-crop';
import { useCallback, useState } from 'react';

type Props = {
  image: string;
  open: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => void;
};

export default function BannerCropModal({
  image,
  open,
  onClose,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null
  );

  const onCropComplete = useCallback(
    (_: Area, cropped: Area) => {
      setCroppedAreaPixels(cropped);
    },
    []
  );

  if (!open) return null;

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const blob = await getCroppedImg(image, croppedAreaPixels);
    onSave(blob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-3xl p-4">
        <div className="relative w-full aspect-[4/1] bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-full"
          />

          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-slate-900 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
