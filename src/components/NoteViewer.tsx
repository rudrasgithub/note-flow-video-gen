
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Reference {
  title: string;
  url: string;
  description: string;
}

interface VideoReference {
  title: string;
  url: string;
  timestamp: string;
}

interface Note {
  title: string;
  content: string;
  sections: {
    title: string;
    content: string;
    timestamp?: string;
  }[];
  references: Reference[];
  videoReferences: VideoReference[];
  summaryPoints: string[];
}

interface NoteViewerProps {
  note: Note;
  videoUrl: string;
}

const NoteViewer = ({ note, videoUrl }: NoteViewerProps) => {
  return (
    <div className="w-full animate-fade-in">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{note.content}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notes">Structured Notes</TabsTrigger>
          <TabsTrigger value="summary">Key Points</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="video">Video Clips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4">
          {note.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                  {section.timestamp && (
                    <span className="text-xs bg-noteflow-light-purple text-noteflow-dark-purple px-2 py-1 rounded-full">
                      {section.timestamp}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {note.summaryPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="min-w-5 h-5 rounded-full bg-noteflow-purple text-white flex items-center justify-center text-xs mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle>References & Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {note.references.map((reference, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-medium text-noteflow-dark-purple">{reference.title}</h3>
                    <p className="text-sm text-gray-600 my-1">{reference.description}</p>
                    <a 
                      href={reference.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-noteflow-purple hover:underline"
                    >
                      {reference.url}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {note.videoReferences.map((reference, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium">{reference.title}</h3>
                    <p className="text-xs text-gray-500 my-1">Timestamp: {reference.timestamp}</p>
                    <div className="aspect-video mt-2 bg-gray-100 rounded overflow-hidden">
                      <video 
                        src={`${videoUrl}#t=${reference.timestamp}`} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoteViewer;
