
import React, { useState } from 'react';
import Header from '@/components/Header';
import VideoUploader from '@/components/VideoUploader';
import LoadingState from '@/components/LoadingState';
import NoteViewer from '@/components/NoteViewer';
import { processVideoWithOpenAI } from '@/services/openaiService';
import { generateReferences, generateVideoReferences } from '@/services/referenceService';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<any | null>(null);
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const handleVideoSelect = (file: File) => {
    setSelectedFile(file);
    setShowAPIKeyDialog(true);
    // Clear any previous errors
    setApiError(null);
  };
  
  const handleProcessVideo = async () => {
    if (!selectedFile || !openAIKey) {
      toast.error('Please provide both a video file and an OpenAI API key.');
      return;
    }
    
    setShowAPIKeyDialog(false);
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setProcessingStage('Initializing');
      setVideoUrl(URL.createObjectURL(selectedFile));
      setApiError(null);
      
      // Process the video with OpenAI
      const noteData = await processVideoWithOpenAI(selectedFile, openAIKey, (progress, stage) => {
        setProgress(progress);
        setProcessingStage(stage);
      });
      
      // Generate references
      const references = await generateReferences(noteData.content);
      
      // Generate video references
      const videoReferences = await generateVideoReferences(URL.createObjectURL(selectedFile));
      
      // Combine all data
      setGeneratedNote({
        ...noteData,
        references,
        videoReferences
      });
      
      toast.success('Notes generated successfully!');
    } catch (error: any) {
      console.error('Error processing video:', error);
      // Set the error message for display
      setApiError(error.message || 'Failed to process video. Please try again.');
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
            <AlertTitle>Credit Usage Information</AlertTitle>
            <AlertDescription>
              <p>We use free methods wherever possible to save your OpenAI credits:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><span className="font-medium">Audio Extraction:</span> Free (browser-based)</li>
                <li><span className="font-medium">Transcription:</span> Free (browser Speech API with OpenAI fallback)</li>
                <li><span className="font-medium">Summarization & Analysis:</span> Uses OpenAI credits (delivers the highest quality)</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {apiError && !isProcessing && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {apiError}
              </AlertDescription>
            </Alert>
          )}
          
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
      
      <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OpenAI API Key</DialogTitle>
            <DialogDescription>
              To process your video, we need your OpenAI API key. This key is only used for this request and is not stored.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {apiError}
                </AlertDescription>
              </Alert>
            )}
            <Alert className="mb-2">
              <Info className="h-4 w-4" />
              <AlertTitle>Credit Usage Information</AlertTitle>
              <AlertDescription>
                <p className="text-sm">Your OpenAI credits will only be used for the final summarization step. We use free methods for audio extraction and attempt free transcription first.</p>
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="col-span-4">
                OpenAI API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                className="col-span-4"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
              />
              <div className="col-span-4 text-xs text-gray-500">
                <p>Make sure your OpenAI account has sufficient credits. Free trial accounts may have usage limitations.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAPIKeyDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessVideo}
              className="bg-noteflow-purple hover:bg-noteflow-dark-purple"
              disabled={!openAIKey}
            >
              Process Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
