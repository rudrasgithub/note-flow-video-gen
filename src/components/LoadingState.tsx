
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LoadingStateProps {
  progress: number;
  stage: string;
}

const LoadingState = ({ progress, stage }: LoadingStateProps) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-noteflow-light-purple flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-noteflow-purple to-noteflow-dark-purple animate-pulse-gentle"></div>
        </div>
        <h3 className="text-xl font-medium text-center">{stage}</h3>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-500 text-center">
          Please wait while we analyze your video and generate comprehensive notes
        </p>
        <div className="grid grid-cols-3 gap-4 w-full mt-4">
          <div 
            className={`p-3 rounded-lg text-center text-sm font-medium relative ${
              progress >= 33 ? 'bg-noteflow-purple text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span>Extracting audio</span>
            <Badge variant="outline" className="absolute -top-2 -right-2 bg-white text-xs">Free</Badge>
          </div>
          <div 
            className={`p-3 rounded-lg text-center text-sm font-medium relative ${
              progress >= 66 ? 'bg-noteflow-purple text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span>Transcribing content</span>
            <Badge variant="outline" className="absolute -top-2 -right-2 bg-white text-xs">Free</Badge>
          </div>
          <div 
            className={`p-3 rounded-lg text-center text-sm font-medium relative ${
              progress >= 90 ? 'bg-noteflow-purple text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span>Generating notes</span>
            <Badge variant="outline" className="absolute -top-2 -right-2 bg-white text-xs">Free+</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
