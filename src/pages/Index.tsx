
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

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<any | null>(null);
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleVideoSelect = (file: File) => {
    setSelectedFile(file);
    setShowAPIKeyDialog(true);
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
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
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
