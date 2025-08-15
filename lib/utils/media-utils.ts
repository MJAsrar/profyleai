/**
 * Simple media utilities for browser compatibility checks
 */

export interface WebRTCSupportCheck {
  isSupported: boolean
  missingFeatures: string[]
}

export interface MediaPermissions {
  video: boolean
  audio: boolean
}

/**
 * Check if WebRTC is supported in the current browser
 */
export function checkWebRTCSupport(): WebRTCSupportCheck {
  const missingFeatures: string[] = []

  if (!navigator.mediaDevices) {
    missingFeatures.push('MediaDevices API')
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    missingFeatures.push('getUserMedia')
  }

  if (!window.RTCPeerConnection && !window.webkitRTCPeerConnection) {
    missingFeatures.push('RTCPeerConnection')
  }

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures
  }
}

/**
 * Test media permissions
 */
export async function testMediaPermissions(): Promise<MediaPermissions> {
  const permissions: MediaPermissions = {
    video: false,
    audio: false
  }

  try {
    // Test video permission
    const videoStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: false 
    })
    permissions.video = true
    videoStream.getTracks().forEach(track => track.stop())
  } catch (error) {
    console.warn('Video permission denied or unavailable:', error)
  }

  try {
    // Test audio permission
    const audioStream = await navigator.mediaDevices.getUserMedia({ 
      video: false, 
      audio: true 
    })
    permissions.audio = true
    audioStream.getTracks().forEach(track => track.stop())
  } catch (error) {
    console.warn('Audio permission denied or unavailable:', error)
  }

  return permissions
}

// Add type declarations for webkit prefixed APIs
declare global {
  interface Window {
    webkitRTCPeerConnection: typeof RTCPeerConnection
    webkitAudioContext: typeof AudioContext
  }
}
