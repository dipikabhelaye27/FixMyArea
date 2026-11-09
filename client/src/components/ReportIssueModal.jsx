import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  Mic, 
  Square, 
  CheckCircle2, 
  Loader2,
  RotateCcw,
  RefreshCw,
  Users
} from 'lucide-react';
import { submitIssueReport } from '../services/api';

export default function ReportIssueModal({ isOpen, onClose, onSuccess, initialCoords }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [voiceText, setVoiceText] = useState('');
  const [speechLang, setSpeechLang] = useState('en-IN'); // 'en-IN' | 'mr-IN' | 'hi-IN'
  const [detectedVoiceLang, setDetectedVoiceLang] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Automatic language tagger from text content
  const detectLanguage = (text) => {
    if (!text || !text.trim()) return '';

    const latinLetters = (text.match(/[a-zA-Z]/g) || []).length;
    const devanagariLetters = (text.match(/[\u0900-\u097F]/g) || []).length;

    if (latinLetters >= devanagariLetters && latinLetters > 0) {
      return 'English';
    }

    if (devanagariLetters > 0) {
      if (/आहे|आहेत|पडला|झाला|नाही|रस्त्यावर|कचरा|खड्डा|पाणी|गटार|दिवा|चौक|फाटा|तारा|वाकला|गाडी|येथे|इथे/i.test(text)) {
        return 'Marathi';
      }
      return 'Hindi';
    }

    return 'English';
  };
  
  // Geolocation
  const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 });
  const [address, setAddress] = useState('Detecting your location...');
  const [jurisdiction, setJurisdiction] = useState({
    city: 'Alandi',
    district: 'Pune',
    state: 'Maharashtra',
    municipality: 'Alandi Municipal Council'
  });
  const [isLocating, setIsLocating] = useState(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);

  // Media & Speech Recognition refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // Geolocation initialization on open
  useEffect(() => {
    if (isOpen) {
      if (initialCoords) {
        setCoords(initialCoords);
        reverseGeocode(initialCoords.lat, initialCoords.lng);
      } else {
        detectCurrentLocation();
      }
    } else {
      resetForm();
    }
  }, [isOpen, initialCoords]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const resetForm = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setVoiceText('');
    setDetectedVoiceLang('');
    setIsRecording(false);
    setRecordingDuration(0);
    setSubmissionSuccessData(null);
    setIsSubmitting(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddress('Central Ward, Current Area');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        reverseGeocode(newCoords.lat, newCoords.lng);
        setIsLocating(false);
      },
      (err) => {
        const fallback = { lat: 18.5204, lng: 73.8567 };
        setCoords(fallback);
        reverseGeocode(fallback.lat, fallback.lng);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3).join(', ');
        setAddress(parts || data.display_name);

        const a = data.address || {};
        const rawCity = a.city || a.town || a.municipality || a.suburb || a.village || a.county || '';
        const rawDistrict = a.state_district || a.county || rawCity || '';
        const rawState = a.state || 'Maharashtra';

        // Check if Wardha or Alandi or Pune or generic
        let muni = `${rawCity || 'Local'} Municipal Council`;
        let finalCity = rawCity;
        let finalDistrict = rawDistrict;

        const combined = `${data.display_name} ${rawCity} ${rawDistrict}`.toLowerCase();
        if (combined.includes('wardha') || (lat >= 20.5 && lat <= 21.0 && lng >= 78.3 && lng <= 78.9)) {
          finalCity = 'Wardha';
          finalDistrict = 'Wardha';
          muni = 'Wardha Municipal Council';
        } else if (combined.includes('alandi') || (lat >= 18.64 && lat <= 18.72 && lng >= 73.86 && lng <= 73.94)) {
          finalCity = 'Alandi';
          finalDistrict = 'Pune';
          muni = 'Alandi Municipal Council';
        } else if (combined.includes('pune')) {
          finalCity = 'Pune';
          finalDistrict = 'Pune';
          muni = 'Pune Municipal Corporation';
        }

        setJurisdiction({
          city: finalCity || 'Alandi',
          district: finalDistrict || 'Pune',
          state: rawState,
          municipality: muni
        });
      }
    } catch (e) {
      setAddress(`Current Location (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`);
    }
  };

  // Microphone Voice Recorder with Multi-Language Recognition
  const startVoiceRecording = async (overrideLang = null) => {
    const activeLang = overrideLang || speechLang;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = activeLang;

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setVoiceText(transcript);
            const detected = detectLanguage(transcript);
            if (detected) setDetectedVoiceLang(detected);
            else if (activeLang === 'mr-IN') setDetectedVoiceLang('Marathi');
            else if (activeLang === 'hi-IN') setDetectedVoiceLang('Hindi');
            else setDetectedVoiceLang('English');
          }
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition notice:', e.error);
        };

        recognition.start();
      }

    } catch (err) {
      console.warn('Microphone error:', err.message);
      alert('Microphone access unavailable. You can type what is wrong directly in the box below.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handleLangSwitch = (langCode) => {
    setSpeechLang(langCode);
    if (isRecording) {
      stopVoiceRecording();
      setTimeout(() => {
        startVoiceRecording(langCode);
      }, 200);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!photo && !photoPreview) {
      alert('Please take or upload a photo of the issue.');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalFile = photo;
      if (!finalFile && photoPreview) {
        const res = await fetch(photoPreview);
        const blob = await res.blob();
        finalFile = new File([blob], 'issue-photo.jpg', { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('voiceDescription', voiceText);
      formData.append('longitude', coords.lng);
      formData.append('latitude', coords.lat);
      formData.append('address', address);
      formData.append('ward', address.split(',')[0] ? `Ward - ${address.split(',')[0].trim()}` : 'Central Ward');
      formData.append('city', jurisdiction.city);
      formData.append('district', jurisdiction.district);
      formData.append('state', jurisdiction.state);
      formData.append('municipality', jurisdiction.municipality);
      formData.append('citizenName', 'Citizen');
      formData.append('citizenId', `cit-${Date.now()}`);

      const res = await submitIssueReport(formData);

      if (res.success && res.issue) {
        setSubmissionSuccessData({
          ...res.issue,
          isMerged: res.isMerged || res.isDuplicate,
          mergeMessage: res.message
        });
        setIsSubmitting(false);
        if (onSuccess) {
          onSuccess(res.issue);
        }
      } else {
        alert(res.message || 'Could not send report. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.response?.data?.message || 'Server error while sending report.');
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      {/* Expanded, Sleek Card Container */}
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        
        {/* Clean Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100/70 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <img 
              src="/logo-icon.png" 
              alt="FixMyArea" 
              className="h-9 w-auto object-contain drop-shadow-2xs" 
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Report an Issue
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                See a problem in your street? Take a photo and send it.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {submissionSuccessData ? (
          <div className="p-6 sm:p-8 space-y-5">
            <div className={`p-5 rounded-2xl border text-center space-y-2 ${
              submissionSuccessData.isMerged 
                ? 'bg-amber-50/90 border-amber-200' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                submissionSuccessData.isMerged 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {submissionSuccessData.isMerged ? <Users className="w-6 h-6" /> : <CheckCircle2 className="w-7 h-7" />}
              </div>
              <h3 className={`text-base sm:text-lg font-extrabold ${
                submissionSuccessData.isMerged ? 'text-amber-950' : 'text-emerald-950'
              }`}>
                {submissionSuccessData.isMerged ? 'Merged with Existing Neighborhood Issue' : 'Report Sent Successfully'}
              </h3>
              <p className={`text-xs ${
                submissionSuccessData.isMerged ? 'text-amber-900 font-medium' : 'text-emerald-800'
              }`}>
                {submissionSuccessData.mergeMessage || `Ticket #${submissionSuccessData._id.slice(-6)} · Forwarded to local municipal department`}
              </p>

              {submissionSuccessData.reportersCount > 1 && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-200/70 text-amber-950 text-xs font-bold mt-1">
                  <Users className="w-3.5 h-3.5 text-amber-800" />
                  <span>Now backed by {submissionSuccessData.reportersCount} citizens in your area</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Municipal Authority:</span>
                <span className="font-bold text-slate-900">{submissionSuccessData.municipality || 'Alandi Municipal Council'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Assigned Team:</span>
                <span className="font-bold text-slate-900">{submissionSuccessData.department}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Priority Score:</span>
                <span className="font-bold text-emerald-700 font-mono">{submissionSuccessData.priorityScore}/100 (Urgency Boosted)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Estimated Fix Time:</span>
                <span className="font-bold text-emerald-700">{submissionSuccessData.aiAnalysis?.estimatedTurnaroundHours || 24} hours</span>
              </div>
              {submissionSuccessData.translatedEnglishText && (
                <div className="pt-1">
                  <span className="text-slate-500 font-semibold block mb-1">Issue Summary:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed">
                    {submissionSuccessData.translatedEnglishText}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Back to Home
            </button>
          </div>
        ) : (

          /* Cohesive, Modern Form (No Nested Boxes) */
          <div className="p-6 sm:p-7 space-y-4">

            {/* 1. LOCATION ROW (Seamless Clean Design) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                    <span>Location Detected</span>
                    <span className="text-emerald-700 font-extrabold">· {jurisdiction.municipality}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {address}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={detectCurrentLocation}
                disabled={isLocating}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 shrink-0 ml-3 py-1 px-2.5 rounded-lg hover:bg-emerald-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Update'}</span>
              </button>
            </div>

            {/* 2. PHOTO (Completely Visible Preview / Spacious Dropzone) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Add a Photo <span className="text-rose-500">*</span>
                </label>
                {photoPreview && (
                  <label className="cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-700">
                    Change photo
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                  </label>
                )}
              </div>

              {photoPreview ? (
                /* Completely visible photo without cropping */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 h-44 sm:h-52 flex items-center justify-center">
                  <img 
                    src={photoPreview} 
                    alt="Defect Preview" 
                    className="w-full h-full object-contain p-1" 
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-3 py-1 bg-black/75 text-white text-[11px] font-bold rounded-lg backdrop-blur-sm flex items-center space-x-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Photo attached</span>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 sm:h-40 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl cursor-pointer transition duration-200 group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center mb-2 transition shadow-2xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition">
                    Click a photo or choose from gallery
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Your photo will be completely visible here
                  </span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* 3. VOICE OR TEXT DESCRIPTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  What is the issue? <span className="text-rose-500">*</span>
                </label>

                {/* Clean Language Chips */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-slate-400 mr-1 font-medium">Speak in:</span>
                  <button
                    type="button"
                    onClick={() => handleLangSwitch('en-IN')}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition ${
                      speechLang === 'en-IN' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangSwitch('mr-IN')}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition ${
                      speechLang === 'mr-IN' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangSwitch('hi-IN')}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full transition ${
                      speechLang === 'hi-IN' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Integrated Clean Input Field */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={voiceText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVoiceText(val);
                    const detected = detectLanguage(val);
                    if (detected) setDetectedVoiceLang(detected);
                  }}
                  placeholder="Type what is wrong here, or tap the mic to speak in English, मराठी, or हिंदी..."
                  className="w-full pl-3.5 pr-14 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50/60 rounded-2xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none transition leading-relaxed"
                />

                {/* Mic & Clear Action Buttons aligned neatly inside input */}
                <div className="absolute right-2.5 bottom-3.5 flex items-center space-x-1.5">
                  {voiceText && !isRecording && (
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceText('');
                        setDetectedVoiceLang('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
                      title="Clear text"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : () => startVoiceRecording(speechLang)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition active:scale-95 ${
                      isRecording 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={isRecording ? 'Stop recording' : 'Tap to speak'}
                  >
                    {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isRecording && (
                <div className="text-[11px] font-semibold text-rose-600 animate-pulse flex items-center space-x-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Listening in {speechLang === 'mr-IN' ? 'मराठी' : speechLang === 'hi-IN' ? 'हिंदी' : 'English'}... {formatTimer(recordingDuration)}</span>
                </div>
              )}
            </div>

            {/* SEND REPORT BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || (!photo && !photoPreview)}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-md transition duration-150 flex items-center justify-center space-x-2 ${
                  isSubmitting || (!photo && !photoPreview)
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-600/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending your report...</span>
                  </>
                ) : (
                  <span>Send Report</span>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}