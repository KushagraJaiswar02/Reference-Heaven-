'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, Bookmark } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { GlobalSearchInput } from "./GlobalSearchInput"
import { UserNav } from "./UserNav"
import { UploadModal } from "@/components/gallery/UploadModal"
import { Toaster } from "@/components/ui/sonner"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { Layers } from "lucide-react"

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
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 border-b border-white/5 shadow-sm">
                <div className="flex h-20 items-center px-4 md:px-8 max-w-[1920px] mx-auto gap-6">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Mobile Menu Trigger */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-zinc-500 hover:text-foreground transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                RH
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground hidden xl:block">
                                Reference Heaven
                            </span>
                        </Link>
                    </div>

                    {/* Center: Search (Hero) */}
                    <div className="flex-1 max-w-2xl mx-auto w-full">
                        <GlobalSearchInput />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
                            <Link
                                href="/"
                                className="px-5 py-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-all"
                            >
                                Home
                            </Link>
                            <Link
                                href="/collections"
                                className="px-5 py-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-all"
                            >
                                Collections
                            </Link>
                            <Link
                                href="/artists"
                                className="px-5 py-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-all"
                            >
                                Artists
                            </Link>
                        </nav>

                        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2 hidden lg:block"></div>

                        {user ? (
                            <div className="flex items-center gap-3 pl-2">
                                <UploadModal />
                                <Link
                                    href="/saved"
                                    className="p-2.5 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-all hidden sm:block"
                                    title="Saved"
                                >
                                    <Bookmark className="w-6 h-6" />
                                </Link>
                                <UserNav user={user} profile={profile} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="hidden sm:block">
                                    <Button variant="ghost" className="rounded-full px-6 text-base font-medium">Log in</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="rounded-full px-6 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all">
                                        Sign up
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
                        <GlobalSearchInput />
                    </div>
                    <Link
                        href="/"
                        className="text-zinc-400 hover:text-white border-b border-white/5 pb-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Gallery
                    </Link>
                    <Link
                        href="/collections"
                        className="text-zinc-400 hover:text-white border-b border-white/5 pb-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Collections
                    </Link>
                    <Link
                        href="/artists"
                        className="text-zinc-400 hover:text-white border-b border-white/5 pb-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Artists
                    </Link>
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
