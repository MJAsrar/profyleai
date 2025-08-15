'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Camera, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { checkWebRTCSupport, testMediaPermissions } from '@/lib/utils/media-utils'

interface VideoInterviewSetupProps {
  onSetupComplete: (config: MediaDeviceConfig) => void
  isLoading?: boolean
}

interface MediaDeviceConfig {
  videoDeviceId: string
  audioDeviceId: string
  videoEnabled: boolean
  audioEnabled: boolean
}

interface DeviceInfo {
  deviceId: string
  label: string
  kind: string
}

interface SystemCheck {
  webrtc: boolean
  camera: boolean
  microphone: boolean
  internetSpeed: 'good' | 'fair' | 'poor'
}

export function VideoInterviewSetup({ onSetupComplete, isLoading = false }: VideoInterviewSetupProps) {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [systemCheck, setSystemCheck] = useState<SystemCheck | null>(null)
  const [isTestingDevices, setIsTestingDevices] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [setupStep, setSetupStep] = useState<'checking' | 'devices' | 'preview' | 'ready'>('checking')
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [isAudioTesting, setIsAudioTesting] = useState(false)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // System compatibility check
  useEffect(() => {
    checkSystemCompatibility()
  }, [])

  // Device enumeration
  useEffect(() => {
    if (systemCheck?.webrtc && systemCheck?.camera && systemCheck?.microphone) {
      enumerateDevices()
    }
  }, [systemCheck])

  // Preview stream management
  useEffect(() => {
    if (selectedVideoDevice && selectedAudioDevice && setupStep === 'preview') {
      startPreview()
    }

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
      }
      stopAudioAnalysis()
    }
  }, [selectedVideoDevice, selectedAudioDevice, setupStep])

  const checkSystemCompatibility = async () => {
    try {
      // Check WebRTC support
      const webrtcSupport = checkWebRTCSupport()
      
      // Test media permissions
      const mediaPermissions = await testMediaPermissions()
      
      // Simple internet speed test (placeholder)
      const internetSpeed = 'good' // In production, implement actual speed test
      
      const checks: SystemCheck = {
        webrtc: webrtcSupport.isSupported,
        camera: mediaPermissions.video,
        microphone: mediaPermissions.audio,
        internetSpeed
      }
      
      setSystemCheck(checks)
      
      if (checks.webrtc && checks.camera && checks.microphone) {
        setSetupStep('devices')
      }
    } catch (error) {
      console.error('System check failed:', error)
      setSystemCheck({
        webrtc: false,
        camera: false,
        microphone: false,
        internetSpeed: 'poor'
      })
    }
  }

  const enumerateDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      
      const videoDevices = deviceList
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))
      
      const audioDevices = deviceList
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))
      
      setDevices([...videoDevices, ...audioDevices])
      
      // Select default devices
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoDevices[0].deviceId)
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioDevices[0].deviceId)
      }
      
      if (videoDevices.length > 0 && audioDevices.length > 0) {
        setSetupStep('preview')
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }

  const startPreview = async () => {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
        stopAudioAnalysis()
      }

      const constraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setPreviewStream(stream)
      
      // Attach to video element
      const videoElement = document.getElementById('preview-video') as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = stream
      }
      
      // Start audio analysis for level indicator
      if (audioEnabled) {
        await startAudioAnalysis(stream)
      }
    } catch (error) {
      console.error('Failed to start preview:', error)
    }
  }

  const startAudioAnalysis = async (stream: MediaStream) => {
    try {
      // Clean up previous analysis
      stopAudioAnalysis()
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      
      // Connect audio stream
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      // Start analysis loop
      setIsAudioTesting(true)
      analyzeAudio()
      
    } catch (error) {
      console.error('Failed to start audio analysis:', error)
    }
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let lastUpdate = 0
    const UPDATE_INTERVAL = 100 // Update every 100ms instead of every frame
    
    const analyze = (timestamp: number) => {
      if (!analyserRef.current || !isAudioTesting) return
      
      // Throttle updates to prevent CPU overload
      if (timestamp - lastUpdate < UPDATE_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(analyze)
        return
      }
      lastUpdate = timestamp
      
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Calculate volume (RMS) with reduced complexity
      let sum = 0
      // Sample only every 4th element to reduce CPU usage
      for (let i = 0; i < bufferLength; i += 4) {
        const normalized = dataArray[i] / 255
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / (bufferLength / 4))
      
      // Convert to percentage with better scaling
      const level = Math.min(100, Math.max(0, rms * 200))
      setAudioLevel(level)
      
      animationFrameRef.current = requestAnimationFrame(analyze)
    }
    
    animationFrameRef.current = requestAnimationFrame(analyze)
  }

  const stopAudioAnalysis = () => {
    setIsAudioTesting(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    analyserRef.current = null
    setAudioLevel(0)
  }

  const testDevices = async () => {
    setIsTestingDevices(true)
    
    try {
      // Test audio by recording a short sample
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSetupStep('ready')
    } catch (error) {
      console.error('Device test failed:', error)
    } finally {
      setIsTestingDevices(false)
    }
  }

  const handleComplete = () => {
    const config: MediaDeviceConfig = {
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      videoEnabled,
      audioEnabled
    }
    
    onSetupComplete(config)
  }

  const getVideoDevices = () => devices.filter(d => d.kind === 'videoinput')
  const getAudioDevices = () => devices.filter(d => d.kind === 'audioinput')

  if (setupStep === 'checking') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking System Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              We're checking your system to ensure the best interview experience...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!systemCheck?.webrtc || !systemCheck?.camera || !systemCheck?.microphone) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            System Requirements Not Met
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your system doesn't meet the requirements for video interviews. Please check the following:
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {systemCheck?.webrtc ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>WebRTC Support</span>
            </div>
            <div className="flex items-center gap-2">
              {systemCheck?.camera ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Camera Access</span>
            </div>
            <div className="flex items-center gap-2">
              {systemCheck?.microphone ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Microphone Access</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={checkSystemCompatibility} variant="outline">
              Recheck System
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Video Interview Setup
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant={setupStep === 'devices' ? 'default' : 'secondary'}>
            1. Device Selection
          </Badge>
          <Badge variant={setupStep === 'preview' ? 'default' : 'secondary'}>
            2. Preview & Test
          </Badge>
          <Badge variant={setupStep === 'ready' ? 'default' : 'secondary'}>
            3. Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Device Selection */}
        {(setupStep === 'devices' || setupStep === 'preview' || setupStep === 'ready') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Camera</label>
                <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {getVideoDevices().map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    {videoEnabled ? (
                      <>
                        <Camera className="h-4 w-4 mr-1" />
                        Video On
                      </>
                    ) : (
                      <>
                        <VideoOff className="h-4 w-4 mr-1" />
                        Video Off
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAudioDevices().map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? (
                      <>
                        <Mic className="h-4 w-4 mr-1" />
                        Audio On
                      </>
                    ) : (
                      <>
                        <MicOff className="h-4 w-4 mr-1" />
                        Audio Off
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    id="preview-video"
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ display: videoEnabled ? 'block' : 'none' }}
                  />
                  {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Audio Level Indicator */}
              {audioEnabled && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Audio Level</label>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-75 ${
                        audioLevel > 70 ? 'bg-red-500' : 
                        audioLevel > 40 ? 'bg-yellow-500' : 
                        audioLevel > 10 ? 'bg-green-500' : 
                        'bg-gray-400'
                      }`}
                      style={{ width: `${Math.max(2, audioLevel)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      {isAudioTesting ? 'Speak to test your microphone' : 'Audio testing stopped'}
                    </p>
                    <span className="text-xs font-mono text-muted-foreground">
                      {Math.round(audioLevel)}%
                    </span>
                  </div>
                  {audioLevel < 5 && isAudioTesting && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ No audio detected. Check microphone permissions and volume.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Test Devices */}
        {setupStep === 'preview' && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please check your camera and microphone preview above. When ready, test your devices.
            </p>
            <Button 
              onClick={testDevices} 
              disabled={isTestingDevices}
              className="px-8"
            >
              {isTestingDevices ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Devices...
                </>
              ) : (
                'Test Devices'
              )}
            </Button>
          </div>
        )}
        
        {/* Ready */}
        {setupStep === 'ready' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Setup Complete!</span>
            </div>
            <p className="text-muted-foreground">
              Your devices are working properly. You're ready to start your video interview.
            </p>
            <Button 
              onClick={handleComplete}
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                'Start Interview'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
