'use client'

// ===== WEBRTC TYPES =====

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  mediaConstraints: MediaConstraints
  recordingOptions: MediaRecorderOptions
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'closed'
  localStream?: MediaStream
  remoteStream?: MediaStream
  peerConnection?: RTCPeerConnection
  recorder?: MediaRecorder
  recordedChunks: Blob[]
}

export interface AudioAnalytics {
  volume: number
  frequency: number
  isSpeaking: boolean
  silenceDuration: number
  voiceActivityDetected: boolean
  speechProbability: number
  turnComplete: boolean
}

export interface VideoCallCallbacks {
  onConnectionStateChange: (state: ConnectionState['status']) => void
  onLocalStream: (stream: MediaStream) => void
  onRemoteStream: (stream: MediaStream) => void
  onAudioChunk: (chunk: Blob) => void
  onError: (error: Error) => void
  onAudioAnalytics: (analytics: AudioAnalytics) => void
  onVoiceActivityStart: () => void
  onVoiceActivityEnd: () => void
  onTurnComplete: (audioData: Blob) => void
}

// ===== DEFAULT CONFIGURATION =====

const DEFAULT_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  mediaConstraints: {
    video: {
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
      frameRate: { min: 15, ideal: 30, max: 30 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1
    }
  },
  recordingOptions: {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000
  }
}

// ===== WEBRTC SERVICE CLASS =====

export class WebRTCService {
  private config: WebRTCConfig
  private connectionState: ConnectionState
  private callbacks: VideoCallCallbacks
  private audioContext?: AudioContext
  private analyser?: AnalyserNode
  private audioWorklet?: AudioWorkletNode
  private volumeThreshold: number = 0.01
  private silenceTimer: number = 0
  private lastVolumeCheck: number = 0
  private stopAudioAnalysis?: () => void
  
  // Voice Activity Detection
  private isUserSpeaking: boolean = false
  private speechStartTime: number = 0
  private speechEndTime: number = 0
  private silenceDuration: number = 0
  private speechBuffer: Blob[] = []
  private vadThreshold: number = 0.02
  private silenceThreshold: number = 1500 // ms of silence before considering turn complete
  private minSpeechDuration: number = 500 // ms minimum speech to consider valid

  constructor(config: Partial<WebRTCConfig> = {}, callbacks: VideoCallCallbacks) {
    this.config = { ...DEFAULT_WEBRTC_CONFIG, ...config }
    this.callbacks = callbacks
    this.connectionState = {
      status: 'disconnected',
      recordedChunks: []
    }
  }

  /**
   * Initialize media devices and get user media
   */
  async initializeMedia(): Promise<MediaStream> {
    try {
      console.log('🎥 Requesting media permissions...')
      
      // Set status to connecting
      this.connectionState.status = 'connecting'
      this.callbacks.onConnectionStateChange('connecting')
      
      // Use a more lenient media configuration for initial connection
      const fallbackConstraints = {
        video: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          frameRate: { min: 15, ideal: 24, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }
      
      let stream: MediaStream
      
      try {
        // Try with full constraints first
        stream = await navigator.mediaDevices.getUserMedia(this.config.mediaConstraints)
      } catch (primaryError) {
        console.warn('Primary media constraints failed, trying fallback:', primaryError)
        // Fallback to more basic constraints
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
      }
      
      // Validate stream
      if (!stream || stream.getTracks().length === 0) {
        throw new Error('No media tracks available')
      }
      
      this.connectionState.localStream = stream
      this.connectionState.status = 'connected'
      
      // Notify callbacks
      this.callbacks.onLocalStream(stream)
      this.callbacks.onConnectionStateChange('connected')
      
      // Set up audio analysis asynchronously to prevent blocking
      this.setupAudioAnalysisAsync(stream)
      
      // Set up recording asynchronously
      this.setupRecordingAsync(stream)
      
      console.log('✅ Media initialized successfully')
      return stream
      
    } catch (error) {
      console.error('❌ Failed to initialize media:', error)
      this.connectionState.status = 'failed'
      this.callbacks.onConnectionStateChange('failed')
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Set up audio analysis asynchronously to prevent blocking
   */
  private async setupAudioAnalysisAsync(stream: MediaStream): Promise<void> {
    try {
      // Use requestIdleCallback or setTimeout to defer this work
      const setupAudio = () => this.setupAudioAnalysis(stream)
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(setupAudio)
      } else {
        setTimeout(setupAudio, 0)
      }
    } catch (error) {
      console.warn('Failed to setup audio analysis:', error)
      // Don't throw - audio analysis is not critical for basic functionality
    }
  }

  /**
   * Set up recording asynchronously to prevent blocking
   */
  private setupRecordingAsync(stream: MediaStream): void {
    try {
      const setupRec = () => this.setupRecording(stream)
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(setupRec)
      } else {
        setTimeout(setupRec, 50) // Increased delay for more reliable initialization
      }
    } catch (error) {
      console.warn('Failed to setup recording:', error)
      // Don't throw - recording setup is not critical for initial connection
    }
  }

  /**
   * Create a simple connection (for video interview, we don't need peer-to-peer)
   */
  async createConnection(): Promise<boolean> {
    try {
      if (!this.connectionState.localStream) {
        await this.initializeMedia()
      }

      // For video interview, we just need media capture, not peer connection
      console.log('✅ Connection established (media only)')
      return true
      
    } catch (error) {
      console.error('❌ Failed to create connection:', error)
      this.connectionState.status = 'failed'
      this.callbacks.onConnectionStateChange('failed')
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Start recording audio for transcription
   */
  startRecording(): void {
    if (!this.connectionState.recorder) {
      console.error('❌ Recorder not initialized, attempting to initialize...')
      // Try to initialize recorder if we have a local stream
      if (this.connectionState.localStream) {
        this.setupRecording(this.connectionState.localStream)
        // Wait a bit for async initialization
        setTimeout(() => this.startRecording(), 100)
        return
      } else {
        console.error('❌ No local stream available for recording')
        return
      }
    }

    if (this.connectionState.recorder.state === 'recording') {
      console.warn('⚠️ Recording already in progress')
      return
    }

    try {
      this.connectionState.recorder.start(1000) // Record in 1-second chunks
      console.log('🎙️ Recording started')
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      this.callbacks.onError(error as Error)
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (!this.connectionState.recorder) {
      return
    }

    if (this.connectionState.recorder.state === 'recording') {
      this.connectionState.recorder.stop()
      console.log('⏹️ Recording stopped')
    }
  }

  /**
   * Set up audio recording
   */
  private setupRecording(stream: MediaStream): void {
    try {
      // Create audio-only stream for recording
      const audioStream = new MediaStream(stream.getAudioTracks())
      
      // Check for supported MIME types
      let mimeType = this.config.recordingOptions.mimeType
      if (!MediaRecorder.isTypeSupported(mimeType!)) {
        const fallbackTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/wav'
        ]
        
        mimeType = fallbackTypes.find(type => MediaRecorder.isTypeSupported(type))
        if (!mimeType) {
          throw new Error('No supported audio recording format found')
        }
        console.warn(`⚠️ Fallback to MIME type: ${mimeType}`)
      }

      const recorder = new MediaRecorder(audioStream, {
        ...this.config.recordingOptions,
        mimeType
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('🎤 Audio chunk generated:', event.data.size, 'bytes')
          this.connectionState.recordedChunks.push(event.data)
          
          // Add to speech buffer if user is speaking
          if (this.isUserSpeaking) {
            this.speechBuffer.push(event.data)
          }
          
          // Still call the legacy callback for compatibility
          this.callbacks.onAudioChunk(event.data)
        } else {
          console.log('⚠️ Empty audio chunk received')
        }
      }

      recorder.onerror = (event) => {
        console.error('❌ Recording error:', event)
        this.callbacks.onError(new Error('Recording failed'))
      }

      this.connectionState.recorder = recorder
      console.log('✅ Audio recording setup complete')
      
    } catch (error) {
      console.error('❌ Failed to setup recording:', error)
      this.callbacks.onError(error as Error)
    }
  }

  /**
   * Set up real-time audio analysis
   */
  private async setupAudioAnalysis(stream: MediaStream): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 48000 })
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8

      // Connect audio stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream)
      source.connect(this.analyser)

      // Start audio analysis loop
      this.startAudioAnalysis()
      
      console.log('✅ Audio analysis setup complete')
      
    } catch (error) {
      console.error('❌ Failed to setup audio analysis:', error)
      // Don't throw here - audio analysis is not critical
    }
  }

  /**
   * Start continuous audio analysis with voice activity detection
   */
  private startAudioAnalysis(): void {
    if (!this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let isAnalyzing = true
    let lastUpdate = 0
    let animationFrameId: number | null = null
    const UPDATE_INTERVAL = 100 // More frequent updates for better VAD
    
    const analyze = (timestamp: number) => {
      // Check if we should stop analyzing
      if (!this.analyser || !isAnalyzing || this.connectionState.status === 'disconnected') {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        return
      }

      // Throttle updates
      if (timestamp - lastUpdate < UPDATE_INTERVAL) {
        animationFrameId = requestAnimationFrame(analyze)
        return
      }
      lastUpdate = timestamp

      try {
        this.analyser.getByteFrequencyData(dataArray)
        
        // Calculate RMS volume for better voice detection
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          const normalized = dataArray[i] / 255
          sum += normalized * normalized
        }
        const volume = Math.sqrt(sum / bufferLength)

        // Voice Activity Detection with hysteresis
        const currentlySpeaking = volume > this.vadThreshold
        const now = Date.now()
        
        // Handle voice activity transitions
        if (currentlySpeaking && !this.isUserSpeaking) {
          // Speech started
          this.isUserSpeaking = true
          this.speechStartTime = now
          this.silenceDuration = 0
          this.speechBuffer = [] // Clear buffer for new speech
          this.callbacks.onVoiceActivityStart()
          console.log('🎤 Voice activity started')
        } else if (!currentlySpeaking && this.isUserSpeaking) {
          // Potential speech ended - start silence timer
          if (this.speechEndTime === 0) {
            this.speechEndTime = now
          }
          this.silenceDuration = now - this.speechEndTime
          
          // Check if silence duration exceeds threshold
          if (this.silenceDuration > this.silenceThreshold) {
            const speechDuration = this.speechEndTime - this.speechStartTime
            
            // Only process if speech was long enough
            if (speechDuration > this.minSpeechDuration) {
              this.isUserSpeaking = false
              this.speechEndTime = 0
              this.callbacks.onVoiceActivityEnd()
              
              // Combine speech buffer into single blob
              if (this.speechBuffer.length > 0) {
                const combinedBlob = new Blob(this.speechBuffer, { type: 'audio/webm' })
                this.callbacks.onTurnComplete(combinedBlob)
                console.log(`🎤 Turn complete: ${speechDuration}ms speech, ${this.speechBuffer.length} chunks`)
                this.speechBuffer = []
              }
            } else {
              // Too short, ignore
              this.isUserSpeaking = false
              this.speechEndTime = 0
              this.speechBuffer = []
              console.log('🎤 Speech too short, ignoring')
            }
          }
        } else if (currentlySpeaking && this.isUserSpeaking) {
          // Continue speaking - reset silence timer
          this.speechEndTime = 0
          this.silenceDuration = 0
        }

        // Calculate speech probability based on volume and frequency content
        const speechProbability = Math.min(volume / this.vadThreshold, 1.0)
        
        // Basic frequency analysis for speech detection
        let speechFrequencyEnergy = 0
        const speechBandStart = Math.floor(300 * bufferLength / (this.audioContext!.sampleRate / 2))
        const speechBandEnd = Math.floor(3000 * bufferLength / (this.audioContext!.sampleRate / 2))
        
        for (let i = speechBandStart; i < speechBandEnd && i < bufferLength; i++) {
          speechFrequencyEnergy += dataArray[i] / 255
        }
        const avgSpeechEnergy = speechFrequencyEnergy / (speechBandEnd - speechBandStart)

        // Update silence timer for display
        if (currentlySpeaking) {
          this.silenceTimer = now
        }
        const displaySilenceDuration = now - this.silenceTimer

        // Emit analytics
        if (now - this.lastVolumeCheck > UPDATE_INTERVAL) {
          const analytics: AudioAnalytics = {
            volume,
            frequency: avgSpeechEnergy,
            isSpeaking: currentlySpeaking,
            silenceDuration: displaySilenceDuration,
            voiceActivityDetected: this.isUserSpeaking,
            speechProbability,
            turnComplete: false // This will be handled by onTurnComplete callback
          }
          this.callbacks.onAudioAnalytics(analytics)
          this.lastVolumeCheck = now
        }
      } catch (error) {
        console.error('Audio analysis error:', error)
        // Stop analysis on error
        isAnalyzing = false
        return
      }

      // Continue analysis
      animationFrameId = requestAnimationFrame(analyze)
    }

    // Store the animation frame ID for cleanup
    animationFrameId = requestAnimationFrame(analyze)
    
    // Store cleanup function for later use
    this.stopAudioAnalysis = () => {
      isAnalyzing = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      // Reset VAD state
      this.isUserSpeaking = false
      this.speechStartTime = 0
      this.speechEndTime = 0
      this.speechBuffer = []
    }
  }

  /**
   * Get available media devices
   */
  async getAvailableDevices(): Promise<{
    videoDevices: MediaDeviceInfo[]
    audioDevices: MediaDeviceInfo[]
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      return {
        videoDevices: devices.filter(device => device.kind === 'videoinput'),
        audioDevices: devices.filter(device => device.kind === 'audioinput')
      }
    } catch (error) {
      console.error('❌ Failed to enumerate devices:', error)
      throw error
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId: string): Promise<void> {
    try {
      if (!this.connectionState.localStream) {
        throw new Error('No local stream available')
      }

      // Stop current video track
      const videoTrack = this.connectionState.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.stop()
      }

      // Get new video stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      })

      // Replace video track
      const newVideoTrack = newStream.getVideoTracks()[0]
      this.connectionState.localStream.removeTrack(videoTrack)
      this.connectionState.localStream.addTrack(newVideoTrack)

      // Update peer connection if active
              // For video interview, we don't need peer connection track replacement
        console.log('✅ Video track replaced in local stream')

      console.log('✅ Camera switched successfully')
      
    } catch (error) {
      console.error('❌ Failed to switch camera:', error)
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId: string): Promise<void> {
    try {
      if (!this.connectionState.localStream) {
        throw new Error('No local stream available')
      }

      // Stop current audio track
      const audioTrack = this.connectionState.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.stop()
      }

      // Get new audio stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: { 
          deviceId: { exact: deviceId },
          ...this.config.mediaConstraints.audio as MediaTrackConstraints
        }
      })

      // Replace audio track
      const newAudioTrack = newStream.getAudioTracks()[0]
      this.connectionState.localStream.removeTrack(audioTrack)
      this.connectionState.localStream.addTrack(newAudioTrack)

              // For video interview, we don't need peer connection track replacement
        console.log('✅ Audio track replaced in local stream')

      // Restart recording with new audio track
      this.stopRecording()
      this.setupRecording(this.connectionState.localStream)

      // Restart audio analysis
      if (this.audioContext) {
        await this.setupAudioAnalysis(this.connectionState.localStream)
      }

      console.log('✅ Microphone switched successfully')
      
    } catch (error) {
      console.error('❌ Failed to switch microphone:', error)
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Mute/unmute audio
   */
  toggleAudio(mute: boolean): void {
    if (!this.connectionState.localStream) return

    const audioTracks = this.connectionState.localStream.getAudioTracks()
    audioTracks.forEach(track => {
      track.enabled = !mute
    })

    console.log(`🎤 Audio ${mute ? 'muted' : 'unmuted'}`)
  }

  /**
   * Enable/disable video
   */
  toggleVideo(disable: boolean): void {
    if (!this.connectionState.localStream) return

    const videoTracks = this.connectionState.localStream.getVideoTracks()
    videoTracks.forEach(track => {
      track.enabled = !disable
    })

    console.log(`📹 Video ${disable ? 'disabled' : 'enabled'}`)
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.connectionState.peerConnection || this.connectionState.status !== 'connected') {
      return null
    }

    try {
      // Note: SimplePeer doesn't expose getStats directly
      // In a production app, you might want to use native RTCPeerConnection
      // or extend SimplePeer to expose stats
      return null
    } catch (error) {
      console.error('❌ Failed to get connection stats:', error)
      return null
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up WebRTC resources')

    // Stop audio analysis first
    if (this.stopAudioAnalysis) {
      this.stopAudioAnalysis()
      this.stopAudioAnalysis = undefined
    }

    // Stop recording
    this.stopRecording()

    // Stop local stream
    if (this.connectionState.localStream) {
      this.connectionState.localStream.getTracks().forEach(track => {
        track.stop()
      })
    }

    // Close audio context properly
    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          this.audioContext.close()
          console.log('🔇 Audio context closed')
        }
      } catch (error) {
        console.warn('⚠️ Error closing audio context:', error)
      }
    }

    // Clear recorded chunks to free memory
    this.connectionState.recordedChunks.forEach(chunk => {
      try {
        // Revoke any object URLs that might have been created
        if (chunk instanceof Blob && chunk.size > 0) {
          const url = URL.createObjectURL(chunk)
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        // Ignore - chunk might not be valid
      }
    })

    // Reset state
    this.connectionState = {
      status: 'disconnected',
      recordedChunks: []
    }

    // Clear references
    this.audioContext = undefined
    this.analyser = undefined

    this.callbacks.onConnectionStateChange('disconnected')
    console.log('✅ WebRTC cleanup completed')
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check WebRTC support
 */
export function checkWebRTCSupport(): {
  isSupported: boolean
  features: {
    getUserMedia: boolean
    RTCPeerConnection: boolean
    MediaRecorder: boolean
    AudioContext: boolean
  }
} {
  const features = {
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    RTCPeerConnection: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
    MediaRecorder: !!window.MediaRecorder,
    AudioContext: !!(window.AudioContext || (window as any).webkitAudioContext)
  }

  const isSupported = Object.values(features).every(Boolean)

  return { isSupported, features }
}

/**
 * Test media permissions
 */
export async function testMediaPermissions(): Promise<{
  video: boolean
  audio: boolean
  error?: string
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    
    const videoTracks = stream.getVideoTracks()
    const audioTracks = stream.getAudioTracks()

    // Clean up
    stream.getTracks().forEach(track => track.stop())

    return {
      video: videoTracks.length > 0,
      audio: audioTracks.length > 0
    }
  } catch (error) {
    return {
      video: false,
      audio: false,
      error: error instanceof Error ? error.message : 'Permission test failed'
    }
  }
}

/**
 * Convert Blob to Buffer for server processing
 */
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
