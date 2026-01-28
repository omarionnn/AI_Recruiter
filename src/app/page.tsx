import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallLogsTable } from "@/components/call-logs-table"
import { DashboardStats } from "@/components/dashboard-stats"
import Link from "next/link"
import { Phone, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="font-sans">
      <main className="container mx-auto p-6 md:p-8 max-w-7xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-2 text-lg">Manage your AI phone screens and view call analytics.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Left Column: Actions & Stats */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative ring-1 ring-black/5">
              <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] rotate-12">
                <Phone className="w-48 h-48 text-primary" />
              </div>
              <CardHeader className="relative">
                <CardTitle className="text-xl">Start New Screen</CardTitle>
                <CardDescription className="text-base text-muted-foreground/80">
                  Initiate a new AI interview call with a candidate.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Link href="/start-call" className="block mt-2">
                  <Button size="lg" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all h-12 text-base font-semibold group bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Call
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <DashboardStats />
          </div>

          {/* Right Column: Logs */}
          <div className="md:col-span-8">
            <CallLogsTable />
          </div>
        </div>
      </main>
    </div>
  )
}
