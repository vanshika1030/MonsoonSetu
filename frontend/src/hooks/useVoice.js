import { useState, useEffect, useCallback } from 'react';

// Maps for intent detection
const cropMap = {
  // English
  'soybean': 'soybean', 'cotton': 'cotton', 'rice': 'rice', 'jowar': 'jowar', 
  'tur': 'tur', 'bajra': 'bajra', 'maize': 'maize', 'groundnut': 'groundnut',
  // Hindi & Marathi
  'सोयाबीन': 'soybean', 'कापूस': 'cotton', 'भात': 'rice', 'ज्वारी': 'jowar', 
  'तूर': 'tur', 'बाजरी': 'bajra', 'मका': 'maize', 'भुईमूग': 'groundnut'
};

const stageMap = {
  'pre-sowing': 'pre_sowing', 'pre sowing': 'pre_sowing',
  'germination': 'germination',
  'vegetative': 'vegetative',
  'flowering': 'flowering',
  'grain filling': 'grain_filling', 'grain': 'grain_filling',
  'maturity': 'maturity'
};

const feedbackMap = {
  'yes': 'yes', 'हो': 'yes', 'हां': 'yes', 'हाँ': 'yes',
  'no': 'no', 'नाही': 'no', 'नहीं': 'no'
};

export function useVoice(defaultLang = 'hi-IN') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [detectedCrop, setDetectedCrop] = useState(null);
  const [detectedStage, setDetectedStage] = useState(null);
  const [detectedFeedback, setDetectedFeedback] = useState(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, [SpeechRecognition]);

  const parseTranscript = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check crops
    for (const [key, val] of Object.entries(cropMap)) {
      if (lowerText.includes(key)) {
        setDetectedCrop(val);
      }
    }
    
    // Check stages
    for (const [key, val] of Object.entries(stageMap)) {
      if (lowerText.includes(key)) {
        setDetectedStage(val);
      }
    }
    
    // Check feedback
    for (const [key, val] of Object.entries(feedbackMap)) {
      if (lowerText.includes(key)) {
        setDetectedFeedback(val);
      }
    }
  };

  const startListening = useCallback((lang = defaultLang) => {
    if (!SpeechRecognition) return;
    
    setError(null);
    setDetectedCrop(null);
    setDetectedStage(null);
    setDetectedFeedback(null);
    setTranscript('');
    
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      parseTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      setError('Could not start listening');
    }
  }, [SpeechRecognition, defaultLang]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    // Note: Since we are using continuous=false, it naturally stops, 
    // but if we were storing the recognition instance, we could call recognition.stop()
  }, []);

  const speak = useCallback((text, lang = defaultLang) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(v => v.lang.startsWith(lang));
    // fallback to any hi-IN or mr-IN if default not found
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('hi-IN') || v.lang.startsWith('mr-IN'));
    }
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.lang = preferredVoice ? preferredVoice.lang : lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [defaultLang]);

  const speakAdvisory = useCallback((advisoryText) => {
    speak(advisoryText);
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    supported,
    detectedCrop,
    detectedStage,
    detectedFeedback,
    speak,
    speakAdvisory,
    stopSpeaking,
    isSpeaking
  };
}
