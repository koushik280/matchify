"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X, Loader2, Star } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  photos: string[];
  onUpload: (file: File) => void;
  onDelete: (url: string) => void;
  onSetMain?: (url: string) => void; // new prop
  isUploading: boolean;
  isDeleting: boolean;
}

export function PhotoUploader({
  photos,
  onUpload,
  onDelete,
  onSetMain,
  isUploading,
  isDeleting,
}: PhotoUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onUpload(acceptedFiles[0]);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: isUploading || photos.length >= 6,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/20 scale-[1.02]"
            : "border-white/20 hover:border-primary/50 bg-white/5"
        } ${isUploading || photos.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <ImagePlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drag & drop or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, WebP up to 5MB
        </p>
        {photos.length >= 6 && (
          <p className="text-xs text-rose-400 mt-2">Max 6 photos reached</p>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-3">
              Your Gallery ({photos.length}/6)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((url, idx) => (
                <motion.div
                  key={url}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-secondary shadow-lg"
                >
                  <Image
                    src={url}
                    alt={`Profile ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onSetMain && idx !== 0 && (
                      <button
                        onClick={() => onSetMain(url)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition"
                        title="Make main photo"
                      >
                        <Star className="h-5 w-5 text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(url)}
                      disabled={isDeleting}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition"
                      title="Delete photo"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <Star className="h-3 w-3" /> Main
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Your first photo is your main profile picture. Click the star on
              any other photo to make it main.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
