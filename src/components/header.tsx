import Link from "next/link"
import { Phone } from "lucide-react"

export function Header() {
    return (
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-all duration-200">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">AI Recruiter Console</h1>
                </div>
                <nav className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Dashboard
                    </Link>

                </nav>
            </div>
        </header>
    )
}
