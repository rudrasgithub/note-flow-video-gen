
import { toast } from '@/components/ui/sonner';
import OpenAI from 'openai';

// This interface represents the structure of the notes we expect from OpenAI
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

// Initialize OpenAI client with API key
let openai: OpenAI;

// Helper function to extract audio from video
const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
  // Mock extraction instead of actual processing
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

// Fallback function to transcribe audio using OpenAI
const transcribeAudioWithOpenAI = async (audioBlob: Blob): Promise<string> => {
  try {
    // In a real implementation, we would send the audio to OpenAI
    // For now, return a mock transcript with a delay
    console.log("Mocking OpenAI transcription fallback", audioBlob);
    
    return new Promise((resolve) => {
      setTimeout(() => {
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
      }, 1500);
    });
  } catch (error: any) {
    console.error('Error transcribing audio with OpenAI:', error);
    
    // Check for specific OpenAI error types
    if (error.status === 429) {
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('Your OpenAI account has reached its quota limit. Please check your billing details on OpenAI website.');
      } else {
        throw new Error('Too many requests to OpenAI API. Please try again later.');
      }
    }
    
    throw new Error('Failed to transcribe audio content');
  }
};

// Function to generate notes from transcript using free methods first, with OpenAI as fallback
const generateNotesFromTranscript = async (transcript: string): Promise<NoteData> => {
  try {
    // First try to generate notes using free browser-based NLP
    return await generateFreeNotes(transcript);
  } catch (error) {
    console.log("Free note generation failed, attempting fallback to OpenAI:", error);
    // If free generation fails, fallback to OpenAI
    toast.warning('Free note generation produced insufficient results. Falling back to OpenAI (will use credits).');
    return await generateNotesWithOpenAI(transcript);
  }
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

// Helper function to extract key phrases from text
const extractKeyPhrases = (text: string, count: number): string[] => {
  // Simple algorithm to find potentially important sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Sort sentences by length (assuming longer sentences might contain more information)
  const sortedSentences = [...sentences].sort((a, b) => b.length - a.length);
  
  // Take top N sentences and clean them up
  return sortedSentences.slice(0, count).map(sentence => {
    let cleaned = sentence.trim();
    // Truncate if too long
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + '...';
    }
    return cleaned;
  });
};

// Format seconds to HH:MM:SS
const formatTimestamp = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Function to generate notes using OpenAI (as fallback)
const generateNotesWithOpenAI = async (transcript: string): Promise<NoteData> => {
  try {
    // In a real implementation, we would send the transcript to OpenAI
    // For now, return mock data with a delay to simulate API call
    console.log("Mocking OpenAI note generation", transcript.substring(0, 50) + "...");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockNotes: NoteData = {
          title: "Introduction to Machine Learning",
          content: "A comprehensive overview of machine learning concepts, methodologies, and applications. This lecture covers the foundations of machine learning, including supervised and unsupervised approaches, as well as real-world use cases across various industries.",
          sections: [
            {
              title: "Foundations of Machine Learning",
              content: "Machine learning is a subset of artificial intelligence focused on building systems that can learn from and make decisions based on data. Unlike traditional programming, where explicit instructions are provided for every scenario, machine learning algorithms improve through experience and data analysis.",
              timestamp: "00:00:45"
            },
            {
              title: "Supervised Learning Approaches",
              content: "Supervised learning involves training algorithms using labeled examples, where both input data and desired output are provided. The algorithm learns to map inputs to outputs based on these examples. Common supervised learning algorithms include linear regression for numerical prediction, logistic regression for binary classification, decision trees for multi-class problems, and neural networks for complex pattern recognition tasks.",
              timestamp: "00:04:12"
            },
            {
              title: "Unsupervised Learning Techniques",
              content: "Unsupervised learning deals with unlabeled data where the algorithm must discover patterns and relationships without explicit guidance. Key techniques include clustering (grouping similar data points), dimensionality reduction (simplifying data while preserving important information), and anomaly detection (identifying unusual patterns). K-means clustering and Principal Component Analysis (PCA) are widely used algorithms in this domain.",
              timestamp: "00:12:07"
            },
            {
              title: "Applications in Healthcare",
              content: "Machine learning has transformative applications in healthcare, including disease prediction from patient records, medical image analysis for early detection of conditions like cancer, personalized treatment recommendation systems, and drug discovery acceleration. These applications help improve diagnostic accuracy, treatment effectiveness, and overall patient outcomes while potentially reducing healthcare costs.",
              timestamp: "00:18:22"
            },
            {
              title: "Future Directions and Ethical Considerations",
              content: "As machine learning continues to advance, we must consider ethical implications including data privacy, algorithm bias, decision transparency, and accountability. Responsible AI development requires diverse teams, comprehensive testing, ongoing monitoring, and clear explanations of how algorithms reach conclusions, especially in sensitive domains like healthcare, criminal justice, and financial services.",
              timestamp: "00:23:40"
            }
          ],
          summaryPoints: [
            "Machine learning enables systems to learn from data without explicit programming",
            "Supervised learning uses labeled data to train algorithms for prediction and classification",
            "Unsupervised learning discovers patterns in unlabeled data through techniques like clustering",
            "Healthcare applications include disease prediction, medical imaging analysis, and personalized treatment",
            "Ethical considerations include data privacy, algorithmic bias, and decision transparency"
          ]
        };
        
        resolve(mockNotes);
      }, 3500);
    });
  } catch (error: any) {
    console.error('Error generating notes with OpenAI:', error);
    
    // Check for specific OpenAI error types
    if (error.status === 429) {
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('Your OpenAI account has reached its quota limit. Please check your billing details on OpenAI website.');
      } else {
        throw new Error('Too many requests to OpenAI API. Please try again later.');
      }
    }
    
    throw new Error('Failed to generate notes from transcript');
  }
};

// Main function to process video
export const processVideoWithOpenAI = async (
  videoFile: File, 
  apiKey: string,
  progressCallback: (progress: number, stage: string) => void
): Promise<NoteData> => {
  try {
    // Initialize OpenAI client with provided API key
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
    });
    
    // Stage 1: Preparing video
    progressCallback(10, "Preparing video for analysis");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stage 2: Extracting audio (free)
    progressCallback(25, "Extracting audio from video");
    const audioBlob = await extractAudioFromVideo(videoFile);
    
    // Stage 3: Transcribing content (free when possible)
    progressCallback(40, "Transcribing audio content (free method)");
    let transcript;
    try {
      transcript = await transcribeAudioFree(audioBlob);
      toast.success("Successfully transcribed using free method (no credits used)");
    } catch (error) {
      console.error("Free transcription failed, falling back to OpenAI", error);
      progressCallback(40, "Free transcription failed, using OpenAI (uses credits)");
      toast.warning("Free transcription failed. Falling back to OpenAI (will use credits)");
      transcript = await transcribeAudioWithOpenAI(audioBlob);
    }
    
    // Stage 4: Generating notes with free methods first
    progressCallback(60, "Generating notes using free methods");
    const notes = await generateNotesFromTranscript(transcript);
    
    // Stage 5: Finalizing
    progressCallback(90, "Finalizing and formatting notes");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    progressCallback(100, "Complete!");
    
    return notes;
  } catch (error: any) {
    console.error("Error processing video:", error);
    
    // Provide better error message
    if (error.message.includes('quota')) {
      toast.error("OpenAI API quota exceeded. Please check your billing details on the OpenAI website.");
    } else {
      toast.error(error.message || "Failed to process video. Please try again.");
    }
    
    throw error;
  }
};
