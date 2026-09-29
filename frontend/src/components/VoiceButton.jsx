import React, { useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function VoiceButton({ 
  onCropDetected, 
  onStageDetected, 
  onFeedback, 
  advisoryText,
  lang = 'hi-IN' 
}) {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    supported,
    detectedCrop,
    detectedStage,
    detectedFeedback,
    speakAdvisory,
    stopSpeaking,
    isSpeaking
  } = useVoice(lang);

  // Trigger callbacks when entities are detected
  useEffect(() => {
    if (detectedCrop && onCropDetected) onCropDetected(detectedCrop);
    if (detectedStage && onStageDetected) onStageDetected(detectedStage);
    if (detectedFeedback && onFeedback) onFeedback(detectedFeedback);
  }, [detectedCrop, detectedStage, detectedFeedback, onCropDetected, onStageDetected, onFeedback]);

  if (!supported) return null;

  return (
    <div className="fixed bottom-44 right-4 z-40 flex flex-col items-end gap-3">
      {/* Transcript Bubble */}
      {isListening && transcript && (
        <div className="bg-white border border-gray-100 shadow-md rounded-xl p-3 text-sm max-w-[250px] animate-fade-in mb-2 text-gray-700">
          "{transcript}"
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Speaker Button */}
        {advisoryText && (
          <button
            onClick={isSpeaking ? stopSpeaking : () => speakAdvisory(advisoryText)}
            className="bg-gray-100 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-gray-200 transition-colors self-end"
            aria-label={isSpeaking ? "Stop speaking" : "Read advisory aloud"}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Mic Button */}
        <button
          onClick={isListening ? stopListening : () => startListening(lang)}
          className={`text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors relative ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
