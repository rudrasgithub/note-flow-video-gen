
import React, { useState } from 'react';
import Header from '@/components/Header';
import VideoUploader from '@/components/VideoUploader';
import LoadingState from '@/components/LoadingState';
import NoteViewer from '@/components/NoteViewer';
import { processVideoWithOpenAI } from '@/services/openaiService';
import { generateReferences, generateVideoReferences } from '@/services/referenceService';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<any | null>(null);
  
  const handleVideoSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setProcessingStage('Initializing');
      setVideoUrl(URL.createObjectURL(file));
      
      // Process the video with mocked data (no API key needed)
      const noteData = await processVideoWithOpenAI(file, '', (progress, stage) => {
        setProgress(progress);
        setProcessingStage(stage);
      });
      
      // Generate references
      const references = await generateReferences(noteData.content);
      
      // Generate video references
      const videoReferences = await generateVideoReferences(URL.createObjectURL(file));
      
      // Combine all data
      setGeneratedNote({
        ...noteData,
        references,
        videoReferences
      });
      
      toast.success('Notes generated successfully!');
    } catch (error: any) {
      console.error('Error processing video:', error);
      toast.error(error.message || 'Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-noteflow-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-noteflow-purple to-noteflow-dark-purple text-transparent bg-clip-text">
              Transform Videos into Structured Notes
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your video and get AI-powered comprehensive notes with references, timestamps, and key points in seconds.
            </p>
          </div>
          
          <Alert className="mb-6 border-noteflow-purple">
            <Info className="h-4 w-4" />
            <AlertTitle>100% Free Processing</AlertTitle>
            <AlertDescription>
              <p>We use free methods to process your videos with no API keys required:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><span className="font-medium">Audio Extraction:</span> Free (browser-based)</li>
                <li><span className="font-medium">Transcription:</span> Free (browser-based)</li>
                <li><span className="font-medium">Summarization & Analysis:</span> Free (browser-based)</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {!generatedNote && !isProcessing && (
            <VideoUploader onVideoSelect={handleVideoSelect} isProcessing={isProcessing} />
          )}
          
          {isProcessing && (
            <LoadingState progress={progress} stage={processingStage} />
          )}
          
          {generatedNote && videoUrl && !isProcessing && (
            <NoteViewer note={generatedNote} videoUrl={videoUrl} />
          )}
          
          {generatedNote && !isProcessing && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  setGeneratedNote(null);
                  setVideoUrl(null);
                }}
                className="text-noteflow-purple hover:text-noteflow-dark-purple text-sm font-medium"
              >
                Process another video
              </button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="container text-center">
          <p className="text-sm text-gray-500">
            © 2025 NoteFlow Video Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
