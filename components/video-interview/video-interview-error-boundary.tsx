'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface VideoInterviewErrorBoundaryProps {
  children: React.ReactNode
  onReset?: () => void
  onGoBack?: () => void
}

export class VideoInterviewErrorBoundary extends React.Component<
  VideoInterviewErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: VideoInterviewErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VideoInterview Error Boundary caught an error:', error, errorInfo)
    
    // Log to external service if needed
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onReset?.()
  }

  handleGoBack = () => {
    this.props.onGoBack?.()
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      
      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Video Interview Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Something went wrong with the video interview. This might be due to:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Camera or microphone permission issues</li>
                    <li>Browser compatibility problems</li>
                    <li>Network connectivity issues</li>
                    <li>Hardware device conflicts</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {error && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Technical Details:</h4>
                  <p className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Try these solutions:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                    <span>Refresh the page and allow camera/microphone permissions when prompted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                    <span>Check that your camera and microphone are connected and working</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                    <span>Try using a different browser (Chrome, Firefox, or Safari recommended)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                    <span>Close other applications that might be using your camera/microphone</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={this.handleReset} 
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                {this.props.onGoBack && (
                  <Button 
                    onClick={this.handleGoBack} 
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact support with the technical details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default VideoInterviewErrorBoundary
