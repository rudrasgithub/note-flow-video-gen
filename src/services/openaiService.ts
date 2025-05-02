
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
  // Create an offscreen HTML5 video element
  const video = document.createElement('video');
  const videoUrl = URL.createObjectURL(videoFile);
  video.src = videoUrl;
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      try {
        // Create an audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const mediaStreamSource = audioContext.createMediaElementSource(video);
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        mediaStreamSource.connect(mediaStreamDestination);
        
        // Create a media recorder to capture the audio
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          resolve(audioBlob);
          URL.revokeObjectURL(videoUrl);
        };
        
        // Play the video to extract audio (muted to avoid playback sound)
        video.muted = true;
        mediaRecorder.start();
        await video.play();
        
        // Record for the duration of the video or max 3 minutes for large videos
        setTimeout(() => {
          video.pause();
          mediaRecorder.stop();
        }, Math.min(video.duration * 1000, 180000)); // 3 minutes max
      } catch (error) {
        console.error('Error extracting audio:', error);
        reject(error);
      }
    };
    
    video.onerror = (error) => {
      console.error('Error loading video:', error);
      reject(error);
    };
  });
};

// Function to transcribe audio using browser's Web Speech API (free)
const transcribeAudioFree = async (audioBlob: Blob): Promise<string> => {
  // Use browser's SpeechRecognition API for audio transcription
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting free transcription...");
      
      // Create an audio element to play the audio
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      let transcript = '';
      
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        audio.pause();
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        audio.pause();
        URL.revokeObjectURL(audioUrl);
        
        if (transcript.trim() === '') {
          // If transcript is empty, fall back to OpenAI (with user warning)
          toast.warning('Free transcription yielded no results. Falling back to OpenAI transcription (will use credits).');
          transcribeAudioWithOpenAI(audioBlob)
            .then(resolve)
            .catch(reject);
        } else {
          resolve(transcript);
        }
      };
      
      // Start recognition when audio starts playing
      audio.onplay = () => {
        recognition.start();
      };
      
      // Start audio playback
      audio.play().catch(error => {
        console.error('Error playing audio for transcription:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });
      
      // Stop after audio duration
      audio.onloadedmetadata = () => {
        setTimeout(() => {
          recognition.stop();
        }, audio.duration * 1000 + 1000); // Add 1 second buffer
      };
    } catch (error) {
      console.error('Error in free transcription:', error);
      reject(error);
    }
  });
};

// Fallback function to transcribe audio using OpenAI
const transcribeAudioWithOpenAI = async (audioBlob: Blob): Promise<string> => {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioBlob as any as File,
      model: 'whisper-1',
    });
    
    return response.text;
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

// Function to generate notes from transcript using OpenAI
const generateNotesFromTranscript = async (transcript: string): Promise<NoteData> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional note-taking assistant. 
          Based on the provided transcript from a video, create comprehensive and well-structured notes. 
          Your response MUST follow this exact JSON format:
          {
            "title": "A clear, concise title for the overall content",
            "content": "A one-paragraph summary of the entire video content",
            "sections": [
              {
                "title": "Section title",
                "content": "Detailed content with key points in well-formatted text",
                "timestamp": "HH:MM:SS format timestamp (approximate based on content position in transcript)"
              }
            ],
            "summaryPoints": [
              "Key point 1",
              "Key point 2",
              "Key point 3",
              "Key point 4",
              "Key point 5"
            ]
          }
          Create 4-6 meaningful sections. Format the content of each section with proper paragraphs, bullet points, and emphasis where appropriate.`
        },
        {
          role: 'user',
          content: `Here is the transcript from a video: ${transcript}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    return JSON.parse(content) as NoteData;
  } catch (error: any) {
    console.error('Error generating notes:', error);
    
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
    
    // Stage 4: Analyzing content with OpenAI (uses credits)
    progressCallback(60, "Using OpenAI to analyze and summarize content (uses credits)");
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
