import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Video, Square, RefreshCw, Check, X, AlertTriangle, Circle, Play, Power, MicOff } from 'lucide-react';
import { cyberSound } from '../services/soundService';

export interface FilterOption {
  id: string;
  name: string;
  style: string;
  color: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: 'normal', name: 'NORMAL', style: 'none', color: 'bg-white' },
  { id: 'mono', name: 'MONO_SYN', style: 'grayscale(100%) contrast(1.2) brightness(1.1)', color: 'bg-neutral-500' },
  { id: 'sepia', name: 'NERVE_SEPIA', style: 'sepia(100%) saturate(1.8) hue-rotate(-15deg)', color: 'bg-amber-600' },
  { id: 'cyberpink', name: 'CYBER_PINK', style: 'hue-rotate(280deg) saturate(2.5) contrast(1.1) brightness(1.05)', color: 'bg-[#ff007f]' },
  { id: 'cybercyan', name: 'CYBER_CYAN', style: 'hue-rotate(150deg) saturate(3) contrast(1.2)', color: 'bg-[#00f0ff]' },
  { id: 'matrix', name: 'MATRI_X', style: 'hue-rotate(50deg) saturate(2.5) brightness(0.9) contrast(1.4)', color: 'bg-green-500' },
  { id: 'invert', name: 'GLITCH_INV', style: 'invert(100%) hue-rotate(180deg) contrast(1.2)', color: 'bg-purple-600' }
];

export function getFilterStyle(filterId: string | undefined): string {
  if (!filterId) return 'none';
  const found = FILTER_OPTIONS.find(f => f.id === filterId);
  return found ? found.style : 'none';
}

interface VideoReactionRecorderProps {
  postId: string;
  onReactionPosted: (text: string, videoBase64: string, filterId: string) => Promise<void>;
  onCancel: () => void;
}

export default function VideoReactionRecorder({ postId, onReactionPosted, onCancel }: VideoReactionRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("normal");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const maxDuration = 8; // 8 seconds limit for lightweight storage in base64

  // Initialize and stop stream in cleanup
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCameraStream = async () => {
    setErrorMsg(null);
    cyberSound.playTick();
    try {
      // Prompt user for camera
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      cyberSound.playSuccess();
    } catch (err: any) {
      console.error("Camera access error:", err);
      cyberSound.playGlitch();
      setErrorMsg("Synapse Link Refused: Failed to access camera/audio. Grant system permissions.");
    }
  };

  const startRecording = () => {
    if (!stream) return;
    cyberSound.playGlitch();
    setRecordedChunks([]);
    setPreviewUrl(null);
    setVideoBase64(null);
    setIsRecording(true);
    setRecordingTime(0);

    // MimeType detection for cross-browser compatibility (Mac/iOS uses mp4/webm depending on version)
    let options = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
    }

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      // Start recording with 200ms slices
      recorder.start(200);

      // Start Countdown Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      setErrorMsg("Codec Error: HTML5 MediaRecorder failed to initiate stream recording.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      cyberSound.playSuccess();
    }
    setIsRecording(false);
  };

  // Convert chunk Blobs to Base64 whenever recordedChunks changes and is not recording
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const processVideoData = async () => {
        const blob = new Blob(recordedChunks, { type: recordedChunks[0].type || 'video/webm' });
        
        // Local preview URL
        const localUrl = URL.createObjectURL(blob);
        setPreviewUrl(localUrl);

        // Convert blob to low-bitrate base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setVideoBase64(base64data);
        };
      };
      processVideoData();
    }
  }, [recordedChunks, isRecording]);

  const handlePublish = async () => {
    if (!videoBase64) return;
    setIsSaving(true);
    cyberSound.playSuccess();
    try {
      await onReactionPosted(caption, videoBase64, selectedFilter);
      // Clean up local resources
      stopCameraStream();
      onCancel();
    } catch (err) {
      console.error("Failed to upload comment video:", err);
      setErrorMsg("TRANSMISSION_FAILED: Refused by secure cloud grid.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    cyberSound.playTick();
    setPreviewUrl(null);
    setVideoBase64(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    // Restart video preview stream
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  return (
    <div className="glass-card rounded-[40px] border border-cyber-pink/20 p-6 space-y-6 bg-black/80 shadow-[0_0_30px_rgba(255,0,127,0.1)] relative overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-cyber-pink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-pink animate-ping" />
          Neural Frame Capturer // Comments
        </h3>
        <button 
          onClick={() => {
            cyberSound.playTick();
            stopCameraStream();
            onCancel();
          }}
          className="text-white/45 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Recording Interface Area */}
        <div className="md:col-span-7 space-y-4">
          <div className="aspect-video bg-neutral-900 rounded-3xl overflow-hidden relative border border-white/5 shadow-inner flex items-center justify-center">
            
            {/* Live Camera Stream View */}
            {!previewUrl && stream && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect
                style={{ filter: getFilterStyle(selectedFilter) }}
              />
            )}

            {/* Recorded Video Playback Preview */}
            {previewUrl && (
              <video 
                ref={previewRef}
                src={previewUrl} 
                autoPlay 
                loop 
                controls 
                playsInline
                className="w-full h-full object-cover"
                style={{ filter: getFilterStyle(selectedFilter) }}
              />
            )}

            {/* Offline Viewport Layer */}
            {!stream && !previewUrl && (
              <div className="text-center p-6 space-y-4">
                <Camera size={28} className="mx-auto text-white/20 animate-pulse" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">LENS_OFFLINE: ACCESS REQUIRED</p>
                <button 
                  onClick={startCameraStream}
                  className="px-6 py-2 bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/35 text-cyber-cyan text-[9px] font-mono tracking-widest uppercase rounded-full transition-all"
                >
                  SPARK_OPTICAL_GRID
                </button>
              </div>
            )}

            {/* Dynamic Telemetry Layout Overlays */}
            {stream && !previewUrl && (
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-black/70 px-2 py-1 rounded text-[8px] font-mono tracking-widest border border-white/5 uppercase text-cyber-cyan">
                  {isRecording ? "REC_LIVE" : "FEED_IDLE"}
                </span>
                <span className="bg-black/70 px-2 py-1 rounded text-[8px] font-mono tracking-widest border border-white/5 uppercase text-white/50">
                  SHA_256
                </span>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-950/80 border border-red-500/30 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-[9px] font-mono font-bold text-red-400">0:0{recordingTime} / 0:0{maxDuration}s</span>
              </div>
            )}
          </div>

          {/* Real-time Video filter selector (Cyber Optic Shaders) */}
          {(stream || previewUrl) && (
            <div className="space-y-1.5 px-1">
              <span className="text-[8px] font-mono text-white/35 uppercase tracking-[0.25em] flex items-center justify-between">
                <span>Synaptic shaders / lens overlay</span>
                {selectedFilter !== 'normal' && (
                  <span className="text-cyber-pink font-bold animate-pulse">ACTIVE: {selectedFilter.toUpperCase()}</span>
                )}
              </span>
              <div className="flex flex-wrap gap-1.5 py-2 px-3 bg-neutral-950/40 rounded-2xl border border-white/5 justify-start">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      cyberSound.playTick();
                      setSelectedFilter(filter.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-[7.5px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                      selectedFilter === filter.id
                        ? 'bg-gradient-to-r from-cyber-pink/20 to-purple-500/20 text-white border border-cyber-pink/40 shadow-[0_0_8px_rgba(255,0,127,0.15)]'
                        : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60 hover:border-white/10 cursor-pointer'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter.color} ${selectedFilter === filter.id ? 'animate-pulse shadow-[0_0_6px_currentColor]' : ''}`} />
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inline Error Displays */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-400">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="text-[9.5px] font-mono tracking-wide">{errorMsg}</span>
            </div>
          )}

          {/* Context Control Triggers */}
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {stream && !previewUrl && !isRecording && (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 font-mono text-[10px] uppercase tracking-widest font-black text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] rounded-full flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Circle size={12} className="fill-white" /> IGNITE RECORD
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-white text-black hover:bg-neutral-200 font-mono text-[10px] uppercase tracking-widest font-black rounded-full flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg animate-pulse"
              >
                <Square size={10} className="fill-black" /> TERM_CAPTURE
              </button>
            )}

            {previewUrl && (
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-mono text-[10px] uppercase tracking-widest font-black rounded-full flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw size={12} /> RETAKE VIDEO
              </button>
            )}
          </div>
        </div>

        {/* Caption Feed and Final Submission Grid */}
        <div className="md:col-span-5 h-full flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] block">Reaction Text Anchor (Optional)</span>
            <textarea
              placeholder="Add physical caption echo, user signature, or neural logs..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-serif italic outline-none focus:border-cyber-pink/40 text-white min-h-[105px] resize-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handlePublish}
              disabled={!videoBase64 || isSaving}
              className={`w-full py-4 rounded-[20px] font-mono text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
                videoBase64 
                  ? 'premium-gradient text-white shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:scale-102 active:scale-98 cursor-pointer' 
                  : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  SYS_TRANSMITTING...
                </>
              ) : (
                <>
                  <Check size={13} />
                  PUBLISH NEURAL ECHO
                </>
              )}
            </button>
            <p className="text-[7.5px] font-mono text-white/25 text-center leading-normal uppercase">
              REACTION ENCODING IN PROGRESS • VIDEO IS BOUND AS CLIENT-PERSISTENT BASE64 MATRIX SECURELY LOCATED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
