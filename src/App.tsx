import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Video, AlertCircle, Play } from 'lucide-react'
import { API_URL, API_KEY } from './config'

function App() {
  const [streamUrl, setStreamUrl] = useState('')
  const [activeStream, setActiveStream] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // HLS.js setup with low-latency mode
  useEffect(() => {
    if (!activeStream || !videoRef.current) return

    const video = videoRef.current
    const isHLS = activeStream.includes('.m3u8')

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (isHLS) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferLength: 15,
          maxMaxBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 1,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 5,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 5,
          liveDurationInfinity: true,
          liveBackBufferLength: 0,
        })
        hlsRef.current = hls

        hls.loadSource(activeStream)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('Stream loaded - playing with low latency')
          video.play().catch((err) => {
            console.error('Autoplay prevented:', err)
            setStatus('Click play button to start stream')
          })
        })

        hls.on(Hls.Events.ERROR, (_event, data) => {
          // Only log fatal errors to avoid console spam
          if (data.fatal) {
            console.error('❌ HLS Fatal Error:', data)
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error - Retrying...')
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error - Recovering...')
                hls.recoverMediaError()
                break
              default:
                setError('Fatal error loading stream')
                hls.destroy()
                break
            }
          } else if (data.details !== 'bufferStalledError') {
            // Log non-fatal errors except buffer stalls (those are expected in low-latency mode)
            console.warn('⚠️ HLS Warning:', data.details)
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = activeStream
        video.addEventListener('loadedmetadata', () => {
          setStatus('Stream loaded successfully')
          video.play().catch((err) => {
            console.error('Autoplay prevented:', err)
            setStatus('Click play button to start stream')
          })
        })
      } else {
        setError('HLS is not supported in this browser')
      }
    } else {
      // Regular video file
      video.src = activeStream
      video.load()
      video.play().catch((err) => {
        console.error('Autoplay prevented:', err)
        setStatus('Click play button to start stream')
      })
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [activeStream])

  // Cleanup on page unload
  useEffect(() => {
    const cleanup = async () => {
      if (activeStream && activeStream.includes('/streams/')) {
        try {
          const streamId = activeStream.split('/streams/')[1].split('/')[0]
          await fetch(`${API_URL}/api/streams/${streamId}`, {
            method: 'DELETE',
            headers: {
              'X-API-Key': API_KEY
            }
          })
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    }

    window.addEventListener('beforeunload', cleanup)
    return () => {
      window.removeEventListener('beforeunload', cleanup)
      cleanup()
    }
  }, [activeStream])

  const handleConnect = async () => {
    if (!streamUrl.trim()) {
      setError('Please enter a stream URL')
      return
    }

    const isRTSP = streamUrl.toLowerCase().startsWith('rtsp://')
    const isHTTP = streamUrl.toLowerCase().startsWith('http://') || streamUrl.toLowerCase().startsWith('https://')

    // Always use backend for conversion
    if (isRTSP || isHTTP) {
      try {
        setError('')
        setStatus('Creating real-time stream...')

        const response = await fetch(`${API_URL}/api/streams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            name: 'Live Stream',
            rtspUrl: streamUrl,
            quality: 'auto'
          })
        })

        const data = await response.json()

        if (data.success && data.stream) {
          console.log('✅ Stream created:', data.stream.id)
          setStatus('Waiting for stream to start...')

          // Poll for HLS file availability
          const hlsUrl = `${API_URL}${data.stream.hlsUrl}`
          let attempts = 0
          const maxAttempts = 20

          const checkHLS = async () => {
            try {
              const response = await fetch(hlsUrl, { method: 'HEAD' })
              if (response.ok) {
                setActiveStream(hlsUrl)
                setStatus('Stream ready - Low latency mode (~2-3s)')
                return true
              }
            } catch (err) {
              // File not ready yet
            }

            attempts++
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500))
              return checkHLS()
            } else {
              setError('Stream took too long to start. Check backend logs.')
              return false
            }
          }

          await checkHLS()
        } else {
          setError(data.error || 'Failed to create stream')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Backend error: ${errorMessage}`)
        console.error('Backend error:', err)
      }
    } else if (isHTTP) {
      // Direct HTTP/HTTPS stream
      setError('')
      setStatus('Loading stream...')
      setActiveStream(streamUrl)
    } else {
      setError('Invalid URL format. Must start with rtsp://, http://, or https://')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConnect()
    }
  }

  const handleDisconnect = async () => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Delete the stream from backend
    if (activeStream && activeStream.includes('/streams/')) {
      try {
        const streamId = activeStream.split('/streams/')[1].split('/')[0]
        await fetch(`${API_URL}/api/streams/${streamId}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': API_KEY
          }
        })
        console.log('✅ Stream stopped:', streamId)
      } catch (err) {
        console.error('Failed to stop stream:', err)
      }
    }

    setActiveStream('')
    setStreamUrl('')
    setError('')
    setStatus('')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Video className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Stream Viewer</h1>
          </div>
          <p className="text-muted-foreground">
            Enter a stream URL to view your camera feed
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connect to Stream</CardTitle>
            <CardDescription>
              Enter your camera stream URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="rtsp://camera-url or https://example.com/stream.m3u8"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleConnect} className="gap-2">
                  <Play className="w-4 h-4" />
                  Connect
                </Button>
              </div>

            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {status && !error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Status</AlertTitle>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}


          </CardContent>
        </Card>

        {/* Video Player Card */}
        {activeStream && (
          <Card>
            <CardHeader>
              <CardTitle>Live Stream</CardTitle>
              <CardDescription className="break-all">{activeStream}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  muted
                >
                  Your browser does not support the video element.
                </video>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  )
}

export default App
