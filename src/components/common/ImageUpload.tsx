import { useState, useEffect } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
  initialImageUrl?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onImageUploaded,
  bucketName = 'event-images',
  folderPath = '',
  initialImageUrl = '',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const uploadImage = async (file: File) => {
    try {
      setError(null);
      setUploading(true);

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSizeMB}MB`);
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      console.log(`Attempting to upload to ${bucketName}/${filePath}`);

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          // Log the full error for debugging
          error: uploadError
        });
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      setImageUrl(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      } else {
        console.error('Unknown error type:', typeof err);
      }
      setError(err instanceof Error ? err.message : 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    uploadImage(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageUploaded('');
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Event banner"
            className="w-full h-48 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-pulse text-gray-500">Uploading...</div>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or WebP (Max {maxSizeMB}MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 