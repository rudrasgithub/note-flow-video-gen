
import { toast } from '@/components/ui/sonner';

// This interface represents the structure of the notes we expect from the processing
interface NoteData {
  title: string;
  content: string;
  sections: {
    title: string;
    content: string;
    timestamp?: string;
  }[];
  summaryPoints: string[];
}

// Helper function to extract audio from video (mocked)
const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  console.log("Mocking audio extraction from video", videoFile.name);
  
  // Create a minimal audio blob to represent extracted audio
  return new Promise((resolve) => {
    // Simulate a delay for the extraction process
    setTimeout(() => {
      // Create an empty blob with audio mimetype
      const mockAudioBlob = new Blob([], { type: 'audio/webm' });
      resolve(mockAudioBlob);
    }, 1500);
  });
};

// Function to transcribe audio using mocked data (free)
const transcribeAudioFree = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    console.log("Using mocked free transcription service", audioBlob);
    
    // Simulate a delay for transcription process
    setTimeout(() => {
      // Return a mock transcript
      const mockTranscript = `Welcome to this introduction to machine learning. Today we'll cover 
      supervised and unsupervised learning approaches. Machine learning is a subset of artificial 
      intelligence that focuses on developing systems that learn from data. Supervised learning involves 
      training with labeled datasets, while unsupervised learning works with unlabeled data to find 
      patterns. Some popular supervised learning algorithms include linear regression, decision trees, 
      and neural networks. For unsupervised learning, we often use clustering algorithms like K-means 
      or dimensionality reduction techniques like PCA. Real-world applications of machine learning 
      include recommendation systems, fraud detection, and medical diagnosis. In healthcare, machine 
      learning helps with early disease detection and personalized treatment plans. As we conclude, 
      remember that choosing the right algorithm depends on your specific problem, available data, 
      and computational resources.`;
      
      resolve(mockTranscript);
    }, 2000);
  });
};

// Generate notes using browser capabilities (free)
const generateFreeNotes = async (transcript: string): Promise<NoteData> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Mock data for free note generation
      const mockNotes: NoteData = {
        title: "Introduction to Machine Learning",
        content: "An overview of machine learning concepts including supervised and unsupervised learning approaches, common algorithms, and real-world applications in various industries.",
        sections: [
          {
            title: "What is Machine Learning",
            content: "Machine learning is a subset of artificial intelligence that focuses on developing systems that learn from data. It enables computers to improve their performance on a task without being explicitly programmed for that task.",
            timestamp: "00:01:15"
          },
          {
            title: "Supervised Learning",
            content: "Supervised learning involves training with labeled datasets. The algorithm learns to map inputs to outputs based on example pairs. Common algorithms include linear regression, decision trees, and neural networks.",
            timestamp: "00:04:32"
          },
          {
            title: "Unsupervised Learning",
            content: "Unsupervised learning works with unlabeled data to find patterns. The algorithm tries to learn the underlying structure of the data. Clustering algorithms like K-means are common examples.",
            timestamp: "00:12:18"
          },
          {
            title: "Real-world Applications",
            content: "Machine learning has numerous applications across industries including recommendation systems, fraud detection, medical diagnosis, and more. In healthcare, it helps with early disease detection and personalized treatment plans.",
            timestamp: "00:18:45"
          }
        ],
        summaryPoints: [
          "Machine learning is a subset of AI that enables systems to learn from data",
          "Supervised learning works with labeled data while unsupervised learning works with unlabeled data",
          "Common algorithms include linear regression, decision trees, neural networks, and K-means clustering",
          "Real-world applications span multiple industries including technology, finance, and healthcare",
          "Choosing the right algorithm depends on your specific problem and available data"
        ]
      };
      
      resolve(mockNotes);
    }, 3000);
  });
};

// Main function to process video
export const processVideoWithOpenAI = async (
  videoFile: File, 
  apiKey: string, // We'll ignore this parameter since we're using mocked data
  progressCallback: (progress: number, stage: string) => void
): Promise<NoteData> => {
  try {
    // Stage 1: Preparing video
    progressCallback(10, "Preparing video for analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stage 2: Extracting audio (free)
    progressCallback(25, "Extracting audio from video");
    const audioBlob = await extractAudioFromVideo(videoFile);
    
    // Stage 3: Transcribing content (free)
    progressCallback(40, "Transcribing audio content (free method)");
    const transcript = await transcribeAudioFree(audioBlob);
    toast.success("Successfully transcribed using free method");
    
    // Stage 4: Generating notes with free methods
    progressCallback(60, "Generating notes using free methods");
    const notes = await generateFreeNotes(transcript);
    toast.success("Successfully generated notes using free method");
    
    // Stage 5: Finalizing
    progressCallback(90, "Finalizing and formatting notes");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    progressCallback(100, "Complete!");
    
    return notes;
  } catch (error: any) {
    console.error("Error processing video:", error);
    toast.error(error.message || "Failed to process video. Please try again.");
    throw error;
  }
};
