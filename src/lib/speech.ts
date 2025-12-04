
'use client';

/**
 * Speaks the given text using the browser's speech synthesis API.
 * This is a simple implementation and may have issues with long texts or browser compatibility.
 * @param text The text to be spoken.
 */
export function speak(text: string) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported or text is empty.');
    return;
  }

  // Cancel any ongoing speech to prevent conflicts
  window.speechSynthesis.cancel();

  // Create a new speech utterance
  const utter = new SpeechSynthesisUtterance(text);

  // Find a high-quality voice
  const voices = window.speechSynthesis.getVoices();
  const googleVoice = voices.find(
    (v) => v.name === 'Google US English'
  );
  const bestVoice = googleVoice || voices.find(v => v.lang.startsWith('en'));

  if (bestVoice) {
    utter.voice = bestVoice;
  }
  
  // Log errors for debugging
  utter.onerror = (e) => {
    console.error('Speech Synthesis Error:', e.error || e);
  };

  // Speak the text
  window.speechSynthesis.speak(utter);
}
