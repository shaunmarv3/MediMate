'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CloudinaryUpload({ 
  onUpload, 
  folder = 'medications',
  className = '',
  buttonText = 'Upload Image',
  showPreview = true 
}) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload to Cloudinary
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unsigned_upload');
      formData.append('folder', folder);
      formData.append('cloud_name', 'dx0znhi8d');

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const imageUrl = response.secure_url;

          // Show success animation
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);

          // Call parent callback with image URL
          if (onUpload) {
            onUpload(imageUrl);
          }

          setUploading(false);
        } else {
          throw new Error('Upload failed');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        alert('Failed to upload image. Please try again.');
        setUploading(false);
        setPreview(null);
      });

      // Send request
      xhr.open('POST', `https://api.cloudinary.com/v1_1/dx0znhi8d/image/upload`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
      setPreview(null);
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button or Preview */}
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.button
            key="upload-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-slate-50 dark:bg-slate-800/50"
          >
            <Upload className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {buttonText}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            {/* Preview Image */}
            {showPreview && (
              <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />

                {/* Remove button */}
                {!uploading && (
                  <button
                    type="button"
                    onClick={clearPreview}
                    className="absolute top-2 right-2 p-2 bg-danger-500 hover:bg-danger-600 text-white rounded-lg shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Upload Progress Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <div className="w-3/4 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-primary-500"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-white text-sm font-medium">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Success Overlay */}
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-success-500/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                    <p className="text-white text-sm font-medium">
                      Uploaded Successfully!
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Upload Info */}
            {!showPreview && uploading && (
              <div className="flex items-center space-x-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Uploading image...
                  </p>
                  <div className="mt-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
