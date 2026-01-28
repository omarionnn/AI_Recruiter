"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, PhoneOff, Clock, User, FileText, Sparkles, RefreshCw } from "lucide-react"
import { Call } from "@/types"
import { vapiService } from "@/lib/vapi"

export default function CallPage() {
  const router = useRouter()
  const params = useParams()
  const callId = params.id as string

  const [call, setCall] = useState<Call | null>(null)
  const [duration, setDuration] = useState(0)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    // Load call data from localStorage
    const existingCalls = JSON.parse(localStorage.getItem('calls') || '[]')
    const foundCall = existingCalls.find((c: Call) => c.id === callId || c.vapiCallId === callId)

    if (foundCall) {
      setCall(foundCall)

      // If call is completed but missing transcript, try to fetch from API
      if (foundCall.status === 'completed' && !foundCall.transcript) {
        fetchCallDetails(foundCall.id)
      }
    } else {
      router.push('/')
    }
  }, [callId, router])

  const fetchCallDetails = async (id: string) => {
    setIsLoadingDetails(true)
    try {
      const details = await vapiService.getCallDetails(id)
      if (details) {
        setCall(prev => prev ? {
          ...prev,
          transcript: details.transcript,
          summary: details.summary, // Use Vapi summary if available, or we generate one
          duration: details.duration || prev.duration,
          cost: details.cost
        } : null)

        // Update localStorage
        updateLocalStorage(id, {
          transcript: details.transcript,
          summary: details.summary,
          duration: details.duration,
          cost: details.cost
        })
      }
    } catch (error) {
      console.error("Failed to fetch call details", error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const updateLocalStorage = (id: string, updates: Partial<Call>) => {
    const existingCalls = JSON.parse(localStorage.getItem('calls') || '[]')
    const updatedCalls = existingCalls.map((c: Call) =>
      c.id === id ? { ...c, ...updates } : c
    )
    localStorage.setItem('calls', JSON.stringify(updatedCalls))
  }

  const handleGenerateSummary = async () => {
    if (!call?.transcript) return

    setIsGeneratingSummary(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: call.transcript }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')

      const data = await response.json()

      setCall(prev => prev ? { ...prev, summary: data.summary } : null)
      updateLocalStorage(call.id, { summary: data.summary })

    } catch (error) {
      console.error("Error generating summary:", error)
      alert("Failed to generate summary. Please try again.")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  useEffect(() => {
    if (!call || call.status === 'completed' || call.status === 'failed') return

    const interval = setInterval(() => {
      const startTime = new Date(call.startedAt).getTime()
      const now = new Date().getTime()
      setDuration(Math.floor((now - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [call])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    if (call) {
      // Update call status in localStorage
      updateLocalStorage(call.id, {
        status: 'completed',
        endedAt: new Date().toISOString(),
        duration
      })

      // Immediately try to fetch details (transcript might take a moment though)
      setCall(prev => prev ? { ...prev, status: 'completed', endedAt: new Date().toISOString() } : null)
      setTimeout(() => fetchCallDetails(call.id), 2000) // Wait a bit for Vapi to process
    }
  }

  if (!call) {
    return (
      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading call information...</div>
        </div>
      </main>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated': return 'text-blue-600 bg-blue-50'
      case 'ringing': return 'text-yellow-600 bg-yellow-50'
      case 'in-progress': return 'text-green-600 bg-green-50'
      case 'completed': return 'text-gray-600 bg-gray-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Console
          </Button>
          <h1 className="text-3xl font-bold">Call in Progress</h1>
        </div>

        <div className="space-y-6">
          {/* Call Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Active Call
              </CardTitle>
              <CardDescription>
                Call with {call.recipientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{call.recipientName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <span className="font-mono">{call.phoneNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(call.status)}`}>
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatDuration(duration)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call Transcript & Summary */}
          {(call.status === 'completed') && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transcript
                  </CardTitle>
                  <CardDescription>
                    Full conversation log
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : call.transcript ? (
                    <div className="bg-gray-50 p-4 rounded-md h-[400px] overflow-y-auto whitespace-pre-wrap text-sm font-mono">
                      {call.transcript}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                      <p>No transcript available yet</p>
                      <Button variant="outline" size="sm" onClick={() => fetchCallDetails(call.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Check for updates
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Summary
                  </CardTitle>
                  <CardDescription>
                    Key points and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {call.summary ? (
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-md text-sm leading-relaxed border border-purple-100 text-purple-900">
                        {call.summary}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="w-full"
                      >
                        {isGeneratingSummary ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Regenerate Summary
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <p className="text-muted-foreground text-center max-w-xs">
                        Generate a concise summary of this conversation using AI
                      </p>
                      <Button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary || !call.transcript}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isGeneratingSummary ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {call.status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Call Notes</CardTitle>
                <CardDescription>
                  Call transcript and summary will be available after the call ends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                  <p className="text-muted-foreground text-sm">
                    The call transcript will be saved and viewable here once the call is completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}