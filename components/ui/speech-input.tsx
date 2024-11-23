"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface SpeechInputProps {
  onTranscript: (transcript: string) => void;
}

export function SpeechInput({ onTranscript }: SpeechInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "speech.wav");

      try {
        const response = await fetch("/api/whisper", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        onTranscript(data.text);
      } catch (error) {
        console.error("Error transcribing speech:", error);
      }

      audioChunks.current = [];
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      variant={isRecording ? "destructive" : "default"}
    >
      {isRecording ? (
        <MicOff className="mr-2 h-4 w-4" />
      ) : (
        <Mic className="mr-2 h-4 w-4" />
      )}
      {/* {isRecording ? "Stop Recording" : "Start Recording"} */}
    </Button>
  );
}
