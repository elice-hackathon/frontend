type SpeechRecognition =
  | typeof window.webkitSpeechRecognition
  | typeof window.SpeechRecognition;

interface Window {
  SpeechRecognition: SpeechRecognition;
  webkitSpeechRecognition: SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}
