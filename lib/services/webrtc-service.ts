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
}

export interface VideoCallCallbacks {
  onConnectionStateChange: (state: ConnectionState['status']) => void
  onLocalStream: (stream: MediaStream) => void
  onRemoteStream: (stream: MediaStream) => void
  onAudioChunk: (chunk: Blob) => void
  onError: (error: Error) => void
  onAudioAnalytics: (analytics: AudioAnalytics) => void
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
      
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia(this.config.mediaConstraints)
      
      this.connectionState.localStream = stream
      this.connectionState.status = 'connected' // Set to connected since we have media
      
      this.callbacks.onLocalStream(stream)
      this.callbacks.onConnectionStateChange('connected')
      
      // Set up audio analysis
      await this.setupAudioAnalysis(stream)
      
      // Set up recording
      this.setupRecording(stream)
      
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
      console.error('❌ Recorder not initialized')
      return
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
   * Start continuous audio analysis
   */
  private startAudioAnalysis(): void {
    if (!this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let isAnalyzing = true
    let lastUpdate = 0
    const UPDATE_INTERVAL = 200 // Reduce frequency to 200ms to prevent CPU overload
    
    const analyze = (timestamp: number) => {
      if (!this.analyser || !isAnalyzing) return

      // Throttle updates significantly
      if (timestamp - lastUpdate < UPDATE_INTERVAL) {
        requestAnimationFrame(analyze)
        return
      }
      lastUpdate = timestamp

      this.analyser.getByteFrequencyData(dataArray)
      
      // Simplified volume calculation
      let sum = 0
      // Sample every 8th element to reduce CPU usage
      for (let i = 0; i < bufferLength; i += 8) {
        const normalized = dataArray[i] / 255
        sum += normalized * normalized
      }
      const volume = Math.sqrt(sum / (bufferLength / 8))

      // Detect speaking with hysteresis to prevent flickering
      const isSpeaking = volume > this.volumeThreshold
      
      // Calculate silence duration
      const now = Date.now()
      if (isSpeaking) {
        this.silenceTimer = now
      }
      const silenceDuration = now - this.silenceTimer

      // Simplified frequency calculation
      const frequency = 0 // Disable frequency calculation to save CPU

      // Emit analytics less frequently
      if (now - this.lastVolumeCheck > UPDATE_INTERVAL) {
        const analytics: AudioAnalytics = {
          volume,
          frequency,
          isSpeaking,
          silenceDuration
        }
        this.callbacks.onAudioAnalytics(analytics)
        this.lastVolumeCheck = now
      }

      // Continue analysis
      requestAnimationFrame(analyze)
    }

    requestAnimationFrame(analyze)
    
    // Store reference to stop analysis
    this.connectionState.recordedChunks.push = () => { isAnalyzing = false }
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
    if (!this.connectionState.peer || this.connectionState.status !== 'connected') {
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

    // Stop recording
    this.stopRecording()

    // Stop local stream
    if (this.connectionState.localStream) {
      this.connectionState.localStream.getTracks().forEach(track => {
        track.stop()
      })
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }

    // Reset state
    this.connectionState = {
      status: 'disconnected',
      recordedChunks: []
    }

    this.callbacks.onConnectionStateChange('disconnected')
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
    RTCPeerConnection: !!(window.RTCPeerConnection || window.webkitRTCPeerConnection),
    MediaRecorder: !!window.MediaRecorder,
    AudioContext: !!(window.AudioContext || window.webkitAudioContext)
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
