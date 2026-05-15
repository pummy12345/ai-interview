import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import "./Interview.css";

type LocaleCode = "en-IN" | "en-US" | "hi-IN" | "kn-IN";

type StartResponse = {
  success?: boolean;
  sessionId: string;
  language: LocaleCode;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  completed: boolean;
  repeatedAttempt?: boolean;
};

type FinalResult = {
  averageScore: number;
  relevanceScore: number;
  completenessScore: number;
  clarityScore: number;
  confidenceScore: number;
  confidenceBand: string;
  category: string;
  skillCategory: string;
  decision: string;
  decisionExplanation: string;
  integritySummary?: {
    riskLevel?: string;
    reasons?: string[];
  };
  flaggedReasons?: string[];
  repeatedAttempt?: boolean;
  attemptCount?: number;
};

type NextResponse = {
  success: boolean;
  score: number;
  averageScore: number;
  feedback: string;
  assessment?: {
    relevance?: number;
    completeness?: number;
    clarity?: number;
    confidence?: number;
  };
  integrity?: {
    reasons?: string[];
    riskLevel?: string;
  };
  nextQuestion: string | null;
  question?: string | null;
  questionNumber: number;
  totalQuestions: number;
  completed: boolean;
  finalResult?: FinalResult | null;
  skillMismatch?: boolean;
detectedSkill?: string;
selectedSkill?: string;

};

type MediaSnapshot = {
  faceVisible: boolean;
  presenceScore: number;
  brightness: number;
  motion: number;
  videoFrozen: boolean;
  frozenStreak: number;
  audioAverageLevel: number;
  audioPeakLevel: number;
  audioContinuity: number;
  audioClear: boolean;
  videoReady: boolean;
  tabHiddenDuringAnswer: boolean;
  trackMuted: boolean;
};

type QAItem = {
  questionNumber: number;
  question: string;
  answer: string;
};

const TOTAL_QUESTIONS = 5;

const completionMessage: Record<LocaleCode, string> = {
  "en-IN": "Interview complete. Please review your answers.",
  "en-US": "Interview complete. Please review your answers.",
  "hi-IN": "इंटरव्यू पूरा हो गया। कृपया अपने उत्तर देख लें।",
  "kn-IN": "ಸಂದರ್ಶನ ಪೂರ್ಣವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
};

function getNavbarTheme() {
  const saved = localStorage.getItem("theme");
  return saved === "light" ? "light" : "dark";
}

function getNavbarLanguage(): LocaleCode {
  const saved = localStorage.getItem("language");

  if (saved === "hi") return "hi-IN";
  if (saved === "kn") return "kn-IN";

  return "en-IN";
}

function resolveInitialLanguage(value?: string): LocaleCode {
  const normalized = String(value || "").trim().toLowerCase();

  if (["hi-in", "hi", "hindi", "हिंदी"].includes(normalized)) return "hi-IN";
  if (["kn-in", "kn", "kannada", "ಕನ್ನಡ"].includes(normalized)) return "kn-IN";
  if (["en-us", "us"].includes(normalized)) return "en-US";
  if (["en-in", "en", "english"].includes(normalized)) return "en-IN";

  return getNavbarLanguage();
}

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate: authCandidate, logout } = useAuth();
  const routeState = (location.state as any) || {};
  const [theme, setTheme] = useState(() => getNavbarTheme());

  
useEffect(() => {
  const syncTheme = () => setTheme(getNavbarTheme());

  window.addEventListener("storage", syncTheme);
  window.addEventListener("theme-change", syncTheme);

  return () => {
    window.removeEventListener("storage", syncTheme);
    window.removeEventListener("theme-change", syncTheme);
  };
}, []);
  useEffect(() => {
  const cleanupInterview = () => {
  sessionStorage.setItem("interviewEnded", "true");

  window.speechSynthesis.cancel();

  if (mediaRecorderRef.current?.state === "recording") {
    mediaRecorderRef.current.stop();
  }

  streamRef.current?.getTracks().forEach((track) => track.stop());
  streamRef.current = null;

  if (videoRef.current) {
    videoRef.current.pause();
    videoRef.current.srcObject = null;
    videoRef.current.removeAttribute("src");
    videoRef.current.load();
  }
};

  window.addEventListener("beforeunload", cleanupInterview);
  window.addEventListener("pagehide", cleanupInterview);

  return () => {
    cleanupInterview();

    window.removeEventListener("beforeunload", cleanupInterview);
    window.removeEventListener("pagehide", cleanupInterview);
  };
}, []);
  const selectedSkill =
  routeState.selectedSkill ||
  routeState.skill ||
  authCandidate?.selectedSkill ||
  authCandidate?.skills?.[0] ||
  "";

  const [language, setLanguage] = useState<LocaleCode>(() =>
    resolveInitialLanguage(routeState.language)
  );

  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState("Interview is starting...");
  const [feedback, setFeedback] = useState("");
  const [finalFeedback, setFinalFeedback] = useState("");
  const [decision, setDecision] = useState("");
  const [decisionExplanation, setDecisionExplanation] = useState("");

  const [score, setScore] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [completed, setCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("auto");
  const [tabWarning, setTabWarning] = useState(false);

  const [mediaSnapshot, setMediaSnapshot] = useState<MediaSnapshot | null>(null);
  const [assessmentCards, setAssessmentCards] = useState<any[]>([]);
  const [integrityNotes, setIntegrityNotes] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [repeatedAttempt, setRepeatedAttempt] = useState(false);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const transcriptRef = useRef("");
  const autoStartedRef = useRef(false);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioMonitorTimerRef = useRef<number | null>(null);
  const videoMonitorTimerRef = useRef<number | null>(null);
  const visibilityLostRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioMetricsRef = useRef({
    sampleCount: 0,
    voicedSamples: 0,
    levelTotal: 0,
    peakLevel: 0,
  });

  const videoMetricsRef = useRef({
    sampleCount: 0,
    visibleSamples: 0,
    frozenStreak: 0,
    maxFrozenStreak: 0,
    motionTotal: 0,
    brightnessTotal: 0,
    lastSignature: "",
  });

  useEffect(() => {
    if (!authCandidate) navigate("/register");
  }, [authCandidate, navigate]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
      setVoiceList(voices);
    };
  

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 300);
    setTimeout(loadVoices, 1000);

    return () => {
      window.speechSynthesis.cancel();
      stopQualityMonitoring();
      stopRecording(true);
  stopCamera();
  autoStartedRef.current = false;
    };
  }, []);

 useEffect(() => {
  const handleVisibility = () => {
  if (document.hidden) {
    visibilityLostRef.current = true;

    window.speechSynthesis.cancel();

    stopRecording(true);

    stopCamera();

    setIsRecording(false);

    setTabWarning(true);

    setStatus("Interview paused");

    setErrorMessage(
      "Tab switching detected. Interview stopped for integrity protection."
    );
  }
};

  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );
  };
}, []);

  if (!authCandidate) return null;

  const stopQualityMonitoring = () => {
    if (audioMonitorTimerRef.current) {
      window.clearInterval(audioMonitorTimerRef.current);
      audioMonitorTimerRef.current = null;
    }

    if (videoMonitorTimerRef.current) {
      window.clearInterval(videoMonitorTimerRef.current);
      videoMonitorTimerRef.current = null;
    }

    audioSourceRef.current?.disconnect();
    audioAnalyserRef.current?.disconnect();

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close().catch(() => {});
    }

    audioContextRef.current = null;
    audioAnalyserRef.current = null;
    audioSourceRef.current = null;
  };

 const stopCamera = () => {
  stopQualityMonitoring();

  if (mediaRecorderRef.current?.state === "recording") {
    mediaRecorderRef.current.stop();
  }

  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.enabled = false;
      track.stop();
    });

    streamRef.current = null;
  }

  if (videoRef.current) {
    const video = videoRef.current;
    const stream = video.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    }

    video.pause();
    video.srcObject = null;
    video.removeAttribute("src");
    video.load();
  }

  setCameraReady(false);
  setIsMuted(false);
  setIsCameraOff(true);
};

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
    setMediaSnapshot(buildMediaSnapshot());
  };

  const toggleCamera = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
    setMediaSnapshot(buildMediaSnapshot());
  };

  const buildMediaSnapshot = (): MediaSnapshot | null => {
    if (!streamRef.current) return null;

    const audioMetrics = audioMetricsRef.current;
    const videoMetrics = videoMetricsRef.current;

    const audioAverageLevel = audioMetrics.sampleCount
      ? audioMetrics.levelTotal / audioMetrics.sampleCount
      : 0;

    const audioContinuity = audioMetrics.sampleCount
      ? audioMetrics.voicedSamples / audioMetrics.sampleCount
      : 0;

    const presenceScore = videoMetrics.sampleCount
      ? videoMetrics.visibleSamples / videoMetrics.sampleCount
      : 0;

    const brightness = videoMetrics.sampleCount
      ? videoMetrics.brightnessTotal / videoMetrics.sampleCount
      : 0;

    const motion = videoMetrics.sampleCount
      ? videoMetrics.motionTotal / videoMetrics.sampleCount
      : 0;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    const audioTrack = streamRef.current.getAudioTracks()[0];

    const videoReady = Boolean(
      videoTrack?.enabled &&
        videoRef.current?.readyState &&
        videoRef.current.readyState >= 2
    );

    return {
      faceVisible:
        presenceScore >= 0.45 &&
        brightness >= 28 &&
        Boolean(videoTrack?.enabled) &&
        !videoTrack?.muted,
      presenceScore: Number(presenceScore.toFixed(2)),
      brightness: Number(brightness.toFixed(0)),
      motion: Number(motion.toFixed(2)),
      videoFrozen: videoMetrics.maxFrozenStreak >= 3,
      frozenStreak: videoMetrics.maxFrozenStreak,
      audioAverageLevel: Number(audioAverageLevel.toFixed(3)),
      audioPeakLevel: Number(audioMetrics.peakLevel.toFixed(3)),
      audioContinuity: Number(audioContinuity.toFixed(2)),
      audioClear:
        audioAverageLevel >= 0.02 &&
        audioMetrics.peakLevel >= 0.05 &&
        Boolean(audioTrack?.enabled) &&
        !audioTrack?.muted,
      videoReady,
      tabHiddenDuringAnswer: visibilityLostRef.current,
      trackMuted: Boolean(
        videoTrack?.muted ||
          audioTrack?.muted ||
          videoTrack?.enabled === false ||
          audioTrack?.enabled === false
      ),
    };
  };

  const startQualityMonitoring = async (stream: MediaStream) => {
    stopQualityMonitoring();

    audioMetricsRef.current = {
      sampleCount: 0,
      voicedSamples: 0,
      levelTotal: 0,
      peakLevel: 0,
    };

    videoMetricsRef.current = {
      sampleCount: 0,
      visibleSamples: 0,
      frozenStreak: 0,
      maxFrozenStreak: 0,
      motionTotal: 0,
      brightnessTotal: 0,
      lastSignature: "",
    };

    visibilityLostRef.current = false;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      audioAnalyserRef.current = analyser;
      audioSourceRef.current = source;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);

      audioMonitorTimerRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(frequencyData);

        const average =
          frequencyData.reduce((sum, value) => sum + value, 0) /
          frequencyData.length /
          255;

        audioMetricsRef.current.sampleCount += 1;
        audioMetricsRef.current.levelTotal += average;
        audioMetricsRef.current.peakLevel = Math.max(
          audioMetricsRef.current.peakLevel,
          average
        );

        if (average >= 0.02) audioMetricsRef.current.voicedSamples += 1;
      }, 450);
    } catch {
      audioContextRef.current = null;
    }

    if (!analysisCanvasRef.current) {
      analysisCanvasRef.current = document.createElement("canvas");
      analysisCanvasRef.current.width = 32;
      analysisCanvasRef.current.height = 24;
    }

    videoMonitorTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;

      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

      let brightnessTotal = 0;
      let signatureTotal = 0;

      for (let index = 0; index < data.length; index += 16) {
        const red = data[index] || 0;
        const green = data[index + 1] || 0;
        const blue = data[index + 2] || 0;

        const brightness = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

        brightnessTotal += brightness;
        signatureTotal += Math.round(brightness / 8);
      }

      const averageBrightness = brightnessTotal / (data.length / 16);
      const signature = `${Math.round(averageBrightness)}-${signatureTotal}`;

      videoMetricsRef.current.sampleCount += 1;
      videoMetricsRef.current.brightnessTotal += averageBrightness;

      if (averageBrightness > 28 && averageBrightness < 235) {
        videoMetricsRef.current.visibleSamples += 1;
      }

      if (
        videoMetricsRef.current.lastSignature &&
        videoMetricsRef.current.lastSignature === signature
      ) {
        videoMetricsRef.current.frozenStreak += 1;
      } else {
        videoMetricsRef.current.motionTotal += videoMetricsRef.current.lastSignature
          ? 1
          : 0.4;
        videoMetricsRef.current.frozenStreak = 0;
      }

      videoMetricsRef.current.maxFrozenStreak = Math.max(
        videoMetricsRef.current.maxFrozenStreak,
        videoMetricsRef.current.frozenStreak
      );

      videoMetricsRef.current.lastSignature = signature;
      setMediaSnapshot(buildMediaSnapshot());
    }, 1600);
  };

  const ensureCamera = async () => {
    if (streamRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: true,
    });

    streamRef.current = stream;

    if (videoRef.current) videoRef.current.srcObject = stream;

    setCameraReady(true);
    setIsMuted(false);
    setIsCameraOff(false);

    await startQualityMonitoring(stream);
  };

  const chooseVoice = (locale: LocaleCode) => {
    const latestVoices = window.speechSynthesis.getVoices();

    if (latestVoices.length) {
      voicesRef.current = latestVoices;
      setVoiceList(latestVoices);
    }

    const allVoices = latestVoices.length ? latestVoices : voicesRef.current;
    const lower = (value: string) => value.toLowerCase();

    if (selectedVoice !== "auto") {
      const manualVoice = allVoices.find((voice) => voice.name === selectedVoice);
      if (manualVoice) return manualVoice;
    }

    const naturalVoices = allVoices.filter((voice) => {
      const name = lower(voice.name);
      return (
        name.includes("natural") ||
        name.includes("online") ||
        name.includes("google") ||
        name.includes("microsoft")
      );
    });

    const voicesToSearch = naturalVoices.length ? naturalVoices : allVoices;

    if (locale === "hi-IN") {
  return (
    voicesToSearch.find((voice) => voice.lang === "hi-IN") ||
    voicesToSearch.find((voice) =>
      lower(voice.lang).startsWith("hi")
    ) ||
    voicesToSearch.find((voice) =>
      lower(voice.name).includes("hindi")
    ) ||
    voicesToSearch.find((voice) =>
      lower(voice.name).includes("swara")
    ) ||

    // fallback to Indian English
    voicesToSearch.find((voice) => voice.lang === "en-IN") ||
    voicesToSearch.find((voice) =>
      lower(voice.name).includes("india")
    ) ||

    allVoices.find((voice) =>
      lower(voice.lang).startsWith("en")
    ) ||
    allVoices[0] ||
    null
  );
}

  if (locale === "kn-IN") {
  return (
    voicesToSearch.find((voice) => voice.lang === "kn-IN") ||
    voicesToSearch.find((voice) =>
      lower(voice.lang).startsWith("kn")
    ) ||
    voicesToSearch.find((voice) =>
      lower(voice.name).includes("kannada")
    ) ||

    // fallback to Indian English
    voicesToSearch.find((voice) => voice.lang === "en-IN") ||
    voicesToSearch.find((voice) =>
      lower(voice.name).includes("india")
    ) ||

    allVoices.find((voice) =>
      lower(voice.lang).startsWith("en")
    ) ||
    allVoices[0] ||
    null
  );
}
    return (
      voicesToSearch.find((voice) => voice.lang === "en-IN") ||
      voicesToSearch.find((voice) => lower(voice.name).includes("india")) ||
      voicesToSearch.find((voice) => voice.lang === "en-US") ||
      voicesToSearch.find((voice) => lower(voice.lang).startsWith("en")) ||
      allVoices[0] ||
      null
    );
  };

  const speak = (text: string, locale: LocaleCode) =>
    new Promise<void>((resolve) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      setIsSpeaking(true);
      setStatus("AI speaking");

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = chooseVoice(locale);

      if (voice) utterance.voice = voice;

      utterance.lang = locale;
      utterance.rate = locale === "kn-IN" ? 0.78 : locale === "hi-IN" ? 0.82 : 0.95;
      utterance.pitch = locale === "en-IN" || locale === "en-US" ? 1 : 0.95;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      setTimeout(() => {
        synth.resume();
        synth.speak(utterance);
      }, 150);
    });

  const startRecording = async () => {
    try {
      await ensureCamera();

      if (!streamRef.current) throw new Error("Camera or microphone stream not available.");

      const audioTracks = streamRef.current.getAudioTracks();
      if (!audioTracks.length) throw new Error("Microphone not found.");

      const audioTrack = audioTracks[0];

      if (!audioTrack.enabled) {
        audioTrack.enabled = true;
        setIsMuted(false);
      }

      const audioOnlyStream = new MediaStream([audioTrack]);

      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      visibilityLostRef.current = false;

      const getSupportedMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const mimeType = getSupportedMimeType();

const mediaRecorder = mimeType
  ? new MediaRecorder(audioOnlyStream, { mimeType })
  : new MediaRecorder(audioOnlyStream);

console.log("Laptop recording mimeType:", mediaRecorder.mimeType);

      mediaRecorderRef.current = mediaRecorder;

      setTranscript("");
      transcriptRef.current = "";
      setInterimTranscript("");
      setErrorMessage("");
      setStatus("Recording answer...");

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onerror = () => {
        setErrorMessage("Recording failed. Please try again.");
        setStatus("Mic error");
        setIsRecording(false);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setMediaSnapshot(buildMediaSnapshot());

        if (discardRecordingRef.current) {
          audioChunksRef.current = [];
          discardRecordingRef.current = false;
          setStatus("Ready");
          return;
        }

        try {
          if (!audioChunksRef.current.length) {
            setErrorMessage("No audio recorded. Please try again.");
            setStatus("Ready");
            return;
          }

             const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || "audio/webm",
          });

          if (audioBlob.size < 1000) {
            setErrorMessage("Voice not captured. Please speak clearly.");
            setStatus("Ready");
            return;
          }

          setStatus("Transcribing answer...");

          const formData = new FormData();
          formData.append("audio", audioBlob, "answer.webm");
          formData.append("languageCode", language);

          const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                data.error?.message ||
                `Transcription failed with ${response.status}`
            );
          }

          const answerText = String(data.text || "").trim();

          if (!answerText) {
            setErrorMessage("No speech detected. Please record again.");
            setStatus("Ready");
            return;
          }

          setTranscript(answerText);
          transcriptRef.current = answerText;
          setStatus("Ready for submit");

          setQaItems((prev) =>
            prev.map((item) =>
              item.questionNumber === questionNumber
                ? { ...item, answer: answerText }
                : item
            )
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to transcribe audio.";

          setErrorMessage(message);
          setStatus("Transcription failed");
        }
      };

      mediaRecorder.start();

      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording(false);
        }
      }, 25000);

      setIsRecording(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to access camera or microphone.";

      setErrorMessage(message);
      setStatus("Permission needed");
      setIsRecording(false);
    }
  };

  const stopRecording = (discard = false) => {
    discardRecordingRef.current = discard;

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") recorder.stop();
    else setIsRecording(false);
  };

  const retryAnswer = async () => {
    stopRecording(true);
    setTranscript("");
    transcriptRef.current = "";
    setInterimTranscript("");
    setFeedback("");
    setErrorMessage("");
    setStatus("Retrying answer");

    setQaItems((prev) =>
      prev.map((item) =>
        item.questionNumber === questionNumber ? { ...item, answer: "" } : item
      )
    );

    await startRecording();
  };

  const resetInterview = () => {
    stopRecording(true);
    stopCamera();
    window.speechSynthesis.cancel();

    setSessionId("");
    setQuestion("Interview is starting...");
    setFeedback("");
    setFinalFeedback("");
    setDecision("");
    setDecisionExplanation("");
    setScore(null);
    setAverageScore(null);
    setAssessmentCards([]);
    setIntegrityNotes([]);
    setRiskLevel("");
    setMediaSnapshot(null);
    setQuestionNumber(0);
    setTotalQuestions(TOTAL_QUESTIONS);
    setTranscript("");
    transcriptRef.current = "";
    setInterimTranscript("");
    setStatus("Ready");
    setErrorMessage("");
    setCompleted(false);
    setReviewMode(false);
    setRepeatedAttempt(false);
    setQaItems([]);
  };

  const startInterview = async () => {
    try {
      sessionStorage.removeItem("interviewEnded");
      resetInterview();
      setIsStarting(true);
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          totalQuestions: TOTAL_QUESTIONS,
          candidate: {
            name: authCandidate.name,
            phone: authCandidate.phone,
            district: authCandidate.district,
            skill: selectedSkill,
            trade: selectedSkill,
            deviceId: authCandidate.deviceId,
          },
        }),
      });

      if (!response.ok) throw new Error(`Backend responded with ${response.status}`);

      const data: StartResponse = await response.json();

      setSessionId(data.sessionId);
      setLanguage(data.language);
      setQuestionNumber(data.questionNumber || 1);
      setTotalQuestions(data.totalQuestions || TOTAL_QUESTIONS);
      setRepeatedAttempt(Boolean(data.repeatedAttempt));
      setStatus("Interview started");

      await ensureCamera();

      setQuestion(data.question);

      setQaItems([
        {
          questionNumber: data.questionNumber || 1,
          question: data.question,
          answer: "",
        },
      ]);

      await speak(data.question, data.language);
      await startRecording();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start interview.";

      setErrorMessage(message);
      setStatus("Start failed");
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = async () => {
    const answer = transcriptRef.current.trim();

    if (!sessionId || !answer) {
      setErrorMessage("Record an answer before submitting.");
      return;
    }

    try {
      stopRecording(true);

      setQaItems((prev) =>
        prev.map((item) =>
          item.questionNumber === questionNumber ? { ...item, answer } : item
        )
      );

      setIsSubmitting(true);
      setStatus("AI reviewing answer");
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/next`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          answer,
          media: buildMediaSnapshot() || mediaSnapshot,
        }),
      });

      if (!response.ok) throw new Error(`Backend responded with ${response.status}`);

      const data: NextResponse = await response.json();
      if (data.skillMismatch && data.detectedSkill) {
      setIntegrityNotes((prev) => [
        ...prev,
        `Skill mismatch detected: selected ${data.selectedSkill}, answer sounds like ${data.detectedSkill}`,
      ]);
        }

      setScore(data.score ?? 0);
      setAverageScore(data.averageScore ?? data.score ?? 0);
      setRiskLevel(data.integrity?.riskLevel || "");
      setIntegrityNotes(data.integrity?.reasons || []);
      setFeedback("");

      setAssessmentCards([
        { label: "Relevance", value: data.assessment?.relevance ?? 0 },
        { label: "Completeness", value: data.assessment?.completeness ?? 0 },
        { label: "Clarity", value: data.assessment?.clarity ?? 0 },
        { label: "Confidence", value: data.assessment?.confidence ?? 0 },
      ]);

      setStatus("Answer evaluated");

      if (data.completed) {
  const final = data.finalResult;

  stopRecording(true);

  window.speechSynthesis.cancel();

  stopCamera();

  setCompleted(true);
  setReviewMode(true);

  setQuestionNumber(TOTAL_QUESTIONS);

  setStatus("Interview completed");

  setDecision(final?.decision || "Manual verification");

  setDecisionExplanation(
    final?.decisionExplanation ||
      "Interview completed and saved for review."
  );

  setFinalFeedback(final?.category || "Interview completed.");

  setRiskLevel(
    final?.integritySummary?.riskLevel ||
      data.integrity?.riskLevel ||
      ""
  );

  setIntegrityNotes(
    final?.flaggedReasons ||
      final?.integritySummary?.reasons ||
      data.integrity?.reasons ||
      []
  );

  setAverageScore(
    final?.averageScore ??
      data.averageScore ??
      data.score ??
      0
  );

  setAssessmentCards([
    {
      label: "Relevance",
      value:
        final?.relevanceScore ??
        data.assessment?.relevance ??
        0,
    },
    {
      label: "Completeness",
      value:
        final?.completenessScore ??
        data.assessment?.completeness ??
        0,
    },
    {
      label: "Clarity",
      value:
        final?.clarityScore ??
        data.assessment?.clarity ??
        0,
    },
    {
      label: "Confidence",
      value:
        final?.confidenceScore ??
        data.assessment?.confidence ??
        0,
    },
  ]);

  await speak(
    completionMessage[language],
    language
  );

  setStatus("Generating AI report...");
  setShowResultPopup(true);
  return;
}

      if (data.nextQuestion) {
        await ensureCamera();

        setQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions || TOTAL_QUESTIONS);
        setTranscript("");
        transcriptRef.current = "";
        setInterimTranscript("");
        setFeedback("");

        setQaItems((prev) => [
          ...prev,
          {
            questionNumber: data.questionNumber,
            question: data.nextQuestion || "",
            answer: "",
          },
        ]);

        await speak(data.nextQuestion, language);
        await startRecording();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit answer.";

      setErrorMessage(message);
      setStatus("Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

 const stopInterview = () => {
  stopRecording(true);
  stopCamera();
  window.speechSynthesis.cancel();

  setSessionId("");
  setQuestion("Interview stopped. You can start again anytime.");
  setFeedback("");
  setFinalFeedback("");
  setDecision("");
  setDecisionExplanation("");
  setScore(null);
  setAverageScore(null);
  setAssessmentCards([]);
  setIntegrityNotes([]);
  setRiskLevel("");
  setMediaSnapshot(null);
  setQuestionNumber(0);
  setTranscript("");
  transcriptRef.current = "";
  setInterimTranscript("");
  setStatus("Stopped");
  setCompleted(true);
  setReviewMode(false);
  setShowStopConfirm(false);
  setTabWarning(false);
};

useEffect(() => {
  sessionStorage.removeItem("interviewEnded");

  if (!authCandidate || !selectedSkill || autoStartedRef.current) return;

  autoStartedRef.current = true;

  startInterview();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [authCandidate, selectedSkill]);

  const activeTranscript = interimTranscript
    ? `${transcript}${transcript && interimTranscript ? " " : ""}${interimTranscript}`.trim()
    : transcript;

  const hasAnswer = Boolean(transcriptRef.current.trim());
  if (showResultPopup) {
  return (
    <div className={`scorecard-page ${theme === "light" ? "scorecard-light" : "scorecard-dark"}`}>
      <div className="scorecard-card">
        <div className="scorecard-header">
          <div className="scorecard-trophy">🏆</div>

          <div>
            <p className="scorecard-eyebrow">AI Interview Result</p>
            <h1>Interview Completed</h1>
            <p>Your AI interview review is ready.</p>
          </div>
        </div>

        <div className="scorecard-main">
          <div className="score-ring">
            <span>{averageScore || 0}</span>
            <small>/100</small>
          </div>

          <div className="score-summary">
            <div>
              <span>Decision</span>
              <strong>{decision || "Manual verification"}</strong>
            </div>

            <div>
              <span>Risk Level</span>
              <strong>{riskLevel || "Low"}</strong>
            </div>

            <div>
              <span>Skill</span>
              <strong>{selectedSkill || "Interview"}</strong>
            </div>
          </div>
        </div>

        <div className="score-metric-grid">
          {assessmentCards.map((card) => (
            <div key={card.label} className="score-metric-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>

        {decisionExplanation && (
          <div className="scorecard-note">
            <h3>AI Review</h3>
            <p>{decisionExplanation}</p>
          </div>
        )}

        {integrityNotes.length > 0 && (
          <div className="scorecard-note warning">
            <h3>Integrity Notes</h3>
            <ul>
              {integrityNotes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="scorecard-actions">
          <button
            className="action-btn secondary-light-btn"
            onClick={() => setShowResultPopup(false)}
          >
            Review Answers
          </button>

          <button
            className="action-btn primary-btn"
            onClick={() => {
            stopRecording(true);

            stopCamera();

            window.speechSynthesis.cancel();

            navigate("/candidate-dashboard");
            }}
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <>
    <div className={`interview-fullscreen ${theme === "light" ? "interview-light" : "interview-dark"}`}>
      <aside className="interview-chat-panel">
        <div className="bot-header">
          <div className="bot-icon">🤖</div>

          <div>
            <h2>AI Interviewer</h2>
            <p>{selectedSkill || "Interview"}</p>
          </div>
        </div>

        <div className="voice-panel compact">
          <label>AI Voice</label>

          <select
            value={selectedVoice}
            onChange={(event) => setSelectedVoice(event.target.value)}
          >
            <option value="auto">Auto best local voice</option>

            {voiceList.map((voice) => (
              <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                {voice.name} — {voice.lang}
              </option>
            ))}
          </select>
        </div>

        {repeatedAttempt && (
          <div className="warning-banner">
            Repeated attempt detected. This interview may require manual verification.
          </div>
        )}

        <div className="interview-status-row">
          <span className={`status-pill ${isRecording ? "recording" : ""}`}>
            {isSpeaking ? "Bot speaking" : isRecording ? "Listening" : status}
          </span>

          <span>
            {questionNumber}/{totalQuestions || TOTAL_QUESTIONS}
          </span>
        </div>

        <div className="qa-timeline">
          {qaItems.map((item) => (
            <div
              key={item.questionNumber}
              className={
                item.questionNumber === questionNumber ? "qa-card active" : "qa-card"
              }
            >
              <h3>Question {item.questionNumber}</h3>

              <p className="qa-question">{item.question}</p>

              <div className="qa-answer-box">
                <strong>Answer</strong>

                <p>
                  {item.answer ||
                    (item.questionNumber === questionNumber
                      ? activeTranscript || "Your answer will appear here..."
                      : "Not answered yet")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {reviewMode && (
  <div className="review-box">
    <h3 className="review-title">Review completed</h3>

    <p className="review-subtitle">
      Please check your answers before final submission.
    </p>

    {decision && (
      <strong className="review-warning">
        {decision}
      </strong>
    )}

    {decisionExplanation && (
      <p className="review-subtitle">
        {decisionExplanation}
      </p>
    )}

    {finalFeedback && (
      <p className="review-category">
        Category: {finalFeedback}
      </p>
    )}

    {riskLevel && (
      <p className="review-risk">
        Risk level: {riskLevel}
      </p>
    )}
  </div>
)}
      </aside>

      <main className="interview-camera-panel">
        <div className="camera-topbar">
          <button
            className="back-btn"
            onClick={() => {
              stopRecording(true);
              stopCamera();
              window.speechSynthesis.cancel();

              setSessionId("");
              setStatus("Interview ended");

              navigate("/candidate-dashboard");
            }}
          >
            ← Dashboard
          </button>

          <div className="camera-meta">
            <span>
              {isSpeaking
                ? "🔊 Bot asking question"
                : isRecording
                ? "🎤 Recording answer"
                : status}
            </span>

            <span>{language}</span>
          </div>

          <button
            className="profile-chip"
            onClick={() => setShowProfile((prev) => !prev)}
            aria-label="Open candidate profile"
          >
            {authCandidate.name?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>

        {showProfile && (
          <div className="profile-dropdown camera-profile">
            <div className="employee-profile-card">
              <div className="employee-top-row">
                <div className="employee-avatar">
                  {authCandidate.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="employee-main-info">
                  <h2>{authCandidate.name}</h2>
                  <p>Candidate Profile</p>
                </div>

                <button
                  className="logout-btn"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>

              <div className="employee-info-grid">
                <div className="employee-info-item">
                  <span>Skill</span>
                  <strong>{selectedSkill || "Not selected"}</strong>
                </div>

                <div className="employee-info-item">
                  <span>Phone</span>
                  <strong>{authCandidate.phone}</strong>
                </div>

                <div className="employee-info-item">
                  <span>District</span>
                  <strong>{authCandidate.district}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="camera-stage">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="candidate-video-full"
          />

          {isCameraOff && (
            <div className="camera-off-layer">
              <div className="camera-off-avatar">
                {authCandidate.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <p>Camera is off</p>
            </div>
          )}

          {!cameraReady && (
            <div className="camera-loader">
              <span>📷</span>
              <p>Starting camera...</p>
            </div>
          )}

          <div className="quality-floating">
  <span className={mediaSnapshot?.faceVisible ? "quality-ok" : "quality-bad"}>
    {mediaSnapshot?.faceVisible ? "✅ Face Visible" : "⚠️ Face Off"}
  </span>

  <span className={mediaSnapshot?.audioClear ? "quality-ok" : "quality-bad"}>
    {mediaSnapshot?.audioClear ? "✅ Audio Clear" : "⚠️ Audio Off"}
  </span>

  <span className={!isMuted ? "quality-ok" : "quality-bad"}>
    {isMuted ? "🔇 Mic Off" : "🎙️ Mic On"}
  </span>
</div>

          <div className="floating-question">
            <p className="question-number">
            Question {questionNumber} of {totalQuestions}
          </p>
            <span>Current Question</span>
            <p>{question}</p>
          </div>
        </div>

        <div className="camera-actions">
          {!completed && (
            <>
              <button
                className={`round-control ${isRecording ? "active" : ""}`}
                onClick={isRecording ? () => stopRecording(false) : startRecording}
                disabled={!sessionId || isSpeaking || completed || isSubmitting}
                title={isRecording ? "Stop answer recording" : "Start answer recording"}
              >
                {isRecording ? "⏹" : "🎤"}
              </button>

              <button
                className={`round-control ${isMuted ? "muted" : ""}`}
                onClick={toggleMute}
                disabled={!streamRef.current || completed}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? "🔇" : "🎙️"}
              </button>

              <button
                className={`round-control ${isCameraOff ? "muted" : ""}`}
                onClick={toggleCamera}
                disabled={!streamRef.current || completed}
                title={isCameraOff ? "Turn camera on" : "Turn camera off"}
              >
                {isCameraOff ? "📷" : "📹"}
              </button>
              
              <button
                className="round-control retry"
                onClick={retryAnswer}
                disabled={!sessionId || isSpeaking || isSubmitting || completed}
                title="Retry answer"
              >
                🔁
              </button>

              <button
                className="action-btn primary-btn"
                onClick={submitAnswer}
                disabled={!hasAnswer || isSubmitting || !sessionId || completed}
              >
                {isSubmitting
                  ? "Saving..."
                  : questionNumber === totalQuestions
                  ? "Save Last Answer"
                  : "Save & Next"}
              </button>
            </>
          )}

          {reviewMode && (
            <button
              className="action-btn primary-btn"
              onClick={() => setShowResultPopup(true)}
            >
              View Score Card
            </button>
          )}

          <button
            className="round-control danger"
            onClick={() => setShowStopConfirm(true)}
            disabled={!sessionId && !isRecording && !isSpeaking}
            title="End interview"
          >
            ☎
          </button>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}
      </main>
     {tabWarning && (
  <div className="confirm-overlay">
    <div className="confirm-modal">
      <h3>⚠ Tab Switching Detected</h3>

      <p>
        Camera and microphone were stoped automatically
        for interview integrity.
      </p>

      <div className="confirm-actions">
        <button
          className="action-btn secondary-light-btn"
          onClick={() => {
            stopRecording(true);

  stopCamera();

  window.speechSynthesis.cancel();

  setTabWarning(false);

  navigate("/candidate-dashboard");
          }}
        >
          Go To Dashboard
        </button>

        <button
          className="action-btn primary-btn"
          onClick={() => {
            setTabWarning(false);
            startInterview();
          }}
        >
          Restart Interview
        </button>
      </div>
    </div>
  </div>
)}
      {showStopConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Stop interview?</h3>

            <p>This will stop the camera, microphone, and AI voice.</p>

            <div className="confirm-actions">
              <button
                className="action-btn secondary-light-btn"
                onClick={() => setShowStopConfirm(false)}
              >
                Continue Interview
              </button>

              <button className="action-btn danger-btn" onClick={stopInterview}>
                Yes, Stop
              </button>
            </div>
          </div>
        </div>
      )}
          </div>

    
  </>
);
};

export default Interview;