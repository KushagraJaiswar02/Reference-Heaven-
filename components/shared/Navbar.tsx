'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, Bookmark } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { UserNav } from "./UserNav"
import { UploadModal } from "@/components/gallery/UploadModal"
import { Toaster } from "@/components/ui/sonner"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()
    const isInitialMount = useRef(true)
    const currentUserRef = useRef<any>(null)

    useEffect(() => {
        const fetchUserData = async (currUser: any) => {
            if (currUser) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currUser.id)
                    .single()
                setProfile(data)
            } else {
                setProfile(null)
            }
        }

        // Initial fetch
        const getUser = async () => {
            const { data: { user: initialUser } } = await supabase.auth.getUser()
            setUser(initialUser)
            currentUserRef.current = initialUser
            if (initialUser) await fetchUserData(initialUser)

            // Short delay to ensure we don't trigger "Welcome back" on initial load
            setTimeout(() => {
                isInitialMount.current = false
            }, 500)
        }
        getUser()

        // Auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const newUser = session?.user || null
            const previousUser = currentUserRef.current

            currentUserRef.current = newUser
            setUser(newUser)
            await fetchUserData(newUser)

            if (event === 'SIGNED_IN') {
                if (!isInitialMount.current && !previousUser) {
                    toast.success("Welcome back!", {
                        description: "You have successfully logged in."
                    })
                    router.refresh()
                }
            }

            if (event === 'SIGNED_OUT') {
                setIsMenuOpen(false)
                if (!isInitialMount.current) {
                    toast.success("You have logged off")
                    router.refresh()
                }
            }

            if (event === 'USER_UPDATED') {
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router]) // Removed user to prevent re-subscriptions

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/70 backdrop-blur-md transition-all duration-300">
                <div className="container flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto gap-4 md:gap-8">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-zinc-400 hover:text-white transition-colors">
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                                Reference Heaven
                            </span>
                        </Link>
                    </div>

                    {/* Center: Search */}
                    <div className="flex-1 flex justify-center max-w-lg mx-auto md:px-8">
                        <div className="relative w-full hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                            <Input
                                placeholder="Search references..."
                                className="bg-white/5 border-none text-white pl-11 h-10 w-full rounded-full focus-visible:ring-1 focus-visible:ring-white/20 placeholder:text-zinc-600 transition-all hover:bg-white/10"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            {['Gallery', 'Collections', 'Artists'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Gallery' ? '/' : `/${item.toLowerCase()}`}
                                    className="text-zinc-400 hover:text-white transition-colors duration-200"
                                >
                                    {item}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    href="/saved"
                                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200"
                                >
                                    <Bookmark className="w-4 h-4" />
                                    <span>Saved</span>
                                </Link>
                            )}
                        </nav>

                        <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>

                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Upload Button - Mobile: Icon only, Desktop: Full */}
                                <UploadModal />
                                <UserNav user={user} profile={profile} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="hidden md:block">
                                    <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-bold rounded-lg px-5 transition-transform hover:scale-105">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 z-40 bg-zinc-950 pt-20 px-6 transition-transform duration-300 ease-in-out md:hidden",
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col gap-6 text-lg font-medium">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <Input
                            placeholder="Search references..."
                            className="bg-white/5 border-none text-white pl-12 h-12 w-full rounded-xl focus-visible:ring-1 focus-visible:ring-white/20 placeholder:text-zinc-600"
                        />
                    </div>
                    {['Gallery', 'Collections', 'Artists'].map((item) => (
                        <Link
                            key={item}
                            href={item === 'Gallery' ? '/' : `/${item.toLowerCase()}`}
                            className="text-zinc-400 hover:text-white border-b border-white/5 pb-4"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                    {user && (
                        <Link
                            href="/saved"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white border-b border-white/5 pb-4"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Saved</span>
                        </Link>
                    )}
                    {!user && (
                        <Link href="/login" className="text-zinc-400 hover:text-white border-b border-white/5 pb-4" onClick={() => setIsMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}
