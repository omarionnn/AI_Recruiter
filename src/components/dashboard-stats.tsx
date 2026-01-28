"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BarChart3 } from "lucide-react"
import { Call } from "@/types"

export function DashboardStats() {
    const [stats, setStats] = useState({ candidates: 0, completed: 0 })

    useEffect(() => {
        const loadStats = () => {
            try {
                const storedCalls = localStorage.getItem('calls')
                if (storedCalls) {
                    const calls: Call[] = JSON.parse(storedCalls)

                    // Calculate candidates (unique phone numbers)
                    const uniquePhones = new Set(calls.map(c => c.phoneNumber))

                    // Calculate completed calls
                    const completedUpdates = calls.filter(c => c.status === 'completed').length

                    setStats({
                        candidates: uniquePhones.size,
                        completed: completedUpdates
                    })
                } else {
                    setStats({ candidates: 0, completed: 0 })
                }
            } catch (e) {
                console.error("Failed to load stats", e)
            }
        }

        loadStats()

        // Listen for storage events (cross-tab)
        window.addEventListener('storage', loadStats)
        // Listen for custom events (same-tab updates)
        window.addEventListener('calls-updated', loadStats)

        return () => {
            window.removeEventListener('storage', loadStats)
            window.removeEventListener('calls-updated', loadStats)
        }
    }, [])

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-1 shadow-sm border-none bg-card ring-1 ring-border/50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Candidates</span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{stats.candidates}</div>
                </CardContent>
            </Card>
            <Card className="col-span-1 shadow-sm border-none bg-card ring-1 ring-border/50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{stats.completed}</div>
                </CardContent>
            </Card>
        </div>
    )
}
