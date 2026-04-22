"use client";

import { useState, useRef } from "react";

interface UploadMapImageProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  preview?: string;
}

export default function UploadMapImage({
  onFileSelect,
  onError,
  preview,
}: UploadMapImageProps) {
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Formato inválido. Usa PNG, JPG o WebP.";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "Imagen demasiado grande. Máximo 10MB.";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setError("");
    onFileSelect(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-prose-soft text-sm font-cinzel mb-2">
        Imagen del Mapa
      </label>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gold/30 rounded-lg p-6 text-center cursor-pointer hover:border-gold/60 transition-colors"
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded"
            />
            <div className="text-prose-soft text-sm">
              <span>Imagen seleccionada. Haz click aquí para cambiar</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="space-y-3 py-8"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-gold/60"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-prose-soft">
              <span className="text-gold hover:text-gold/80">Arrastra una imagen</span>
              {" o haz click para seleccionar"}
            </div>
            <p className="text-prose-muted text-xs">PNG, JPG o WebP. Máximo 10MB.</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          hidden
        />
      </div>

      {error && (
        <p className="text-blood-light text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

