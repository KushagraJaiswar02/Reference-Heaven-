import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { UserNav } from "./UserNav"
import { UploadModal } from "@/components/gallery/UploadModal"
import { Toaster } from "@/components/ui/sonner"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <Toaster />
            <div className="container flex h-16 items-center px-4">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-tight">Reference Heaven</span>
                </Link>
                <div className="flex flex-1 items-center space-x-4 text-sm font-medium">
                    <nav className="flex items-center space-x-4 lg:space-x-6">
                        <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
                            Gallery
                        </Link>
                        <Link href="/collections" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Collections
                        </Link>
                        <Link href="/artists" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Artists
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="w-9 px-0">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                    {user ? (
                        <>
                            <UploadModal />
                            <UserNav user={user} />
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button size="sm" variant="ghost" className="hidden md:flex">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="hidden md:flex">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
