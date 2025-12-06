import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden bg-white shadow-sm
          ${dragActive ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-slate-300 hover:border-green-400 hover:bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment" // Prefers rear camera on mobile
          className="hidden"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center p-6 text-center space-y-4">
          <div className="p-4 bg-green-100 rounded-full text-green-600">
            <Camera size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-700">Snap or Upload</h3>
            <p className="text-sm text-slate-500 mt-2">
              Take a photo of your meal or drag & drop an image here to analyze.
            </p>
          </div>
          <div className="flex gap-3 text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="flex items-center gap-1"><Upload size={16} /> Upload</span>
            <span className="w-px h-4 bg-green-200 self-center"></span>
            <span className="flex items-center gap-1"><Camera size={16} /> Camera</span>
          </div>
        </div>
      </div>
    </div>
  );
};
