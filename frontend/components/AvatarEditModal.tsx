// 'use client';

// import { useCallback, useRef, useState } from 'react';
// import Cropper from 'react-easy-crop';

// type Props = {
//   open: boolean;
//   image: string;
//   onClose: () => void;
//   onSave: (blob: Blob) => void;
//   onDelete: () => void;
//   onChangePhoto: () => void;
// };

// export default function AvatarEditModal({
//   open,
//   image,
//   onClose,
//   onSave,
//   onDelete,
//   onChangePhoto,
// }: Props) {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);

//   const croppedAreaRef = useRef<any>(null);

//   const onCropComplete = useCallback((_: any, areaPixels: any) => {
//     croppedAreaRef.current = areaPixels;
//   }, []);

//   if (!open) return null;

//   const createImage = (url: string) =>
//     new Promise<HTMLImageElement>((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => resolve(img);
//       img.onerror = reject;
//       img.crossOrigin = 'anonymous';
//       img.src = url;
//     });

//   const getCropped = async () => {
//     if (!croppedAreaRef.current) {
//       throw new Error('Crop area not ready');
//     }

//     const img = await createImage(image);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d')!;

//     const { width, height, x, y } = croppedAreaRef.current;

//     const size = Math.max(width, height);
//     canvas.width = size;
//     canvas.height = size;

//     ctx.beginPath();
//     ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
//     ctx.closePath();
//     ctx.clip();

//     ctx.drawImage(img, x, y, width, height, 0, 0, size, size);

//     return new Promise<Blob>(resolve => {
//       canvas.toBlob(b => resolve(b!), 'image/png', 0.95);
//     });
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
//       onClick={onClose}
//     >
//       <div
//         onClick={e => e.stopPropagation()}
//         className="bg-slate-950 w-full max-w-lg rounded-xl overflow-hidden border border-emerald-500/20"
//       >
//         <div className="px-5 py-3 flex items-center justify-between text-white font-medium border-b border-white/10">
//           <span>Edit profile photo</span>

//           <button
//             onClick={onClose}
//             className="text-white/70 hover:text-white text-xl leading-none"
//             aria-label="Close"
//           >
//             ×
//           </button>
//         </div>

//         <div className="relative h-[340px] bg-black">
//           <Cropper
//             image={image}
//             crop={crop}
//             zoom={zoom}
//             aspect={1}
//             cropShape="round"
//             showGrid={false}
//             onCropChange={setCrop}
//             onZoomChange={setZoom}
//             onCropComplete={onCropComplete}
//           />
//         </div>

//         <div className="px-5 py-4 space-y-4">
//           <input
//             type="range"
//             min={1}
//             max={3}
//             step={0.01}
//             value={zoom}
//             onChange={e => setZoom(Number(e.target.value))}
//             className="w-full accent-emerald-500"
//           />

//           <div className="flex justify-between gap-2">
//             <button
//               onClick={onDelete}
//               className="text-sm text-red-400 hover:text-red-300"
//             >
//               Delete photo
//             </button>

//             <div className="flex gap-2">
//               <button
//                 onClick={onChangePhoto}
//                 className="px-3 py-1.5 text-sm rounded-md border border-white/10 text-white"
//               >
//                 Change photo
//               </button>

//               <button
//                 onClick={async () => {
//                   const blob = await getCropped();
//                   onSave(blob);
//                 }}
//                 className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-black font-medium"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
