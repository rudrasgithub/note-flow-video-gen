
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  isProcessing: boolean;
}

const VideoUploader = ({ onVideoSelect, isProcessing }: VideoUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file.');
      return;
    }
    
    setSelectedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a video first.');
      return;
    }
    
    onVideoSelect(selectedFile);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="w-full animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-full h-60 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-noteflow-light-purple transition-colors"
            onClick={triggerFileInput}
          >
            {videoPreviewUrl ? (
              <video 
                src={videoPreviewUrl} 
                controls 
                className="max-h-full max-w-full rounded-lg"
              />
            ) : (
              <div className="text-center p-6">
                <div className="mx-auto h-12 w-12 text-noteflow-purple mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a3 3 0 01-3-3V6a3 3 0 013-3h10a3 3 0 013 3v7a3 3 0 01-3 3H7zm6-6l-3 3m0 0l-3-3m3 3V6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop<br />your video here
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  MP4, MOV, WEBM, AVI (max 500MB)
                </p>
              </div>
            )}
          </div>
          
          <input 
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
            className="w-full bg-noteflow-purple hover:bg-noteflow-dark-purple"
          >
            {isProcessing ? 'Processing...' : 'Generate Notes'}
          </Button>
          
          {selectedFile && (
            <p className="text-sm text-gray-500">
              Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoUploader;
