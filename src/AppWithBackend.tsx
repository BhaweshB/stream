import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Video, AlertCircle, Plus, Trash2, Server, Wifi } from 'lucide-react'
import api, { Stream } from '@/services/api'

function AppWithBackend() {
  const [rtspUrl, setRtspUrl] = useState('')
  const [streamName, setStreamName] = useState('')
  const [streams, setStreams] = useState<Stream[]>([])
  const [activeStream, setActiveStream] = useState<Stream | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection()
    loadStreams()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // HLS.js setup
  useEffect(() => {
    if (!activeStream || !videoRef.current) return

    const video = videoRef.current
    const streamUrl = api.getStreamUrl(activeStream.hlsUrl)

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })
      hlsRef.current = hls

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('Stream loaded successfully')
        video.play().catch((err) => {
          console.error('Autoplay prevented:', err)
          setStatus('Click play button to start stream')
        })
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS Error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - Stream may be processing. Please wait...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - Attempting recovery')
              hls.recoverMediaError()
              break
            default:
              setError('Fatal error loading stream')
              hls.destroy()
              break
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl
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

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [activeStream])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(api.getStreamUrl('/health'))
      setIsBackendConnected(response.ok)
    } catch (err) {
      setIsBackendConnected(false)
    }
  }

  const loadStreams = async () => {
    try {
      const streamList = await api.getStreams()
      setStreams(streamList)
    } catch (err) {
      console.error('Failed to load streams:', err)
    }
  }

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(api.getWebSocketUrl())
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'streams') {
          setStreams(data.data)
        } else if (data.type === 'streamUpdate') {
          loadStreams()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setTimeout(connectWebSocket, 5000)
      }

      wsRef.current = ws
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
    }
  }

  const handleCreateStream = async () => {
    if (!rtspUrl.trim()) {
      setError('Please enter a stream URL')
      return
    }

    if (!rtspUrl.toLowerCase().startsWith('rtsp://') && 
        !rtspUrl.toLowerCase().startsWith('http://') && 
        !rtspUrl.toLowerCase().startsWith('https://')) {
      setError('URL must start with rtsp://, http://, or https://')
      return
    }

    if (!streamName.trim()) {
      setError('Please enter a stream name')
      return
    }

    setLoading(true)
    setError('')
    setStatus('Creating stream...')

    try {
      const stream = await api.createStream({
        name: streamName,
        rtspUrl: rtspUrl,
        quality: 'auto',
      })

      setStatus('Stream created! Processing...')
      setRtspUrl('')
      setStreamName('')
      loadStreams()

      // Auto-select the new stream
      setTimeout(() => {
        setActiveStream(stream)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stream')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStream = (stream: Stream) => {
    if (stream.status !== 'active') {
      setError(`Stream is ${stream.status}. Please wait for it to become active.`)
      return
    }
    setError('')
    setStatus('Loading stream...')
    setActiveStream(stream)
  }

  const handleDeleteStream = async (streamId: string) => {
    try {
      await api.deleteStream(streamId)
      if (activeStream?.id === streamId) {
        setActiveStream(null)
      }
      loadStreams()
      setStatus('Stream deleted successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stream')
    }
  }

  const handleDisconnect = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    setActiveStream(null)
    setError('')
    setStatus('')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Video className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Professional RTSP Stream Viewer</h1>
          </div>
          <p className="text-muted-foreground">
            Enterprise-grade RTSP to HLS streaming platform
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`flex items-center gap-1 ${isBackendConnected ? 'text-green-500' : 'text-red-500'}`}>
              <Server className="w-4 h-4" />
              <span>{isBackendConnected ? 'Backend Connected' : 'Backend Offline'}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <Wifi className="w-4 h-4" />
              <span>{streams.length} Active Streams</span>
            </div>
          </div>
        </div>

        {!isBackendConnected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Backend Not Connected</AlertTitle>
            <AlertDescription>
              Make sure the backend server is running at {api.getStreamUrl('')}
              <br />
              Run: <code className="bg-black/20 px-2 py-1 rounded">cd backend && npm run dev</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Create Stream Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Stream
            </CardTitle>
            <CardDescription>
              Add an RTSP, HTTP, or HTTPS camera stream (will be automatically converted to HLS)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Input
                type="text"
                placeholder="Stream Name (e.g., Front Door Camera)"
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="rtsp://username:password@ip:port/stream OR http://stream-url"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
              />
              <Button 
                onClick={handleCreateStream} 
                disabled={loading || !isBackendConnected}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Stream'}
              </Button>
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

        {/* Active Streams List */}
        {streams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Streams</CardTitle>
              <CardDescription>Click on a stream to view it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {streams.map((stream) => (
                  <div
                    key={stream.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectStream(stream)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{stream.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={`
                          ${stream.status === 'active' ? 'text-green-500' : ''}
                          ${stream.status === 'error' ? 'text-red-500' : ''}
                          ${stream.status === 'pending' ? 'text-yellow-500' : ''}
                        `}>
                          {stream.status}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStream(stream.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Player Card */}
        {activeStream && (
          <Card>
            <CardHeader>
              <CardTitle>Live Stream: {activeStream.name}</CardTitle>
              <CardDescription className="break-all">{activeStream.hlsUrl}</CardDescription>
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
                  Close Stream
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AppWithBackend
