'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/actions/updateProfile"
import { toast } from "sonner"
import { AvatarUpload } from "./AvatarUpload"
import { Loader2 } from "lucide-react"

interface ProfileSettingsProps {
    profile: any
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    // Initial state from profile
    const [formData, setFormData] = useState({
        bio: profile.bio || '',
        website: profile.website || '',
        socials: {
            instagram: profile.socials?.instagram || '',
            twitter: profile.socials?.twitter || '',
            artstation: profile.socials?.artstation || '',
            linkedin: profile.socials?.linkedin || '',
            youtube: profile.socials?.youtube || ''
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('bio', formData.bio)
            formDataToSend.append('website', formData.website)
            formDataToSend.append('socials', JSON.stringify(formData.socials))

            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile)
            }

            const result = await updateProfile(formDataToSend)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Profile updated successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 font-bold transition-transform hover:scale-105">
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Avatar</Label>
                        <AvatarUpload
                            currentAvatarUrl={profile.avatar_url}
                            username={profile.username}
                            onFileSelect={setAvatarFile}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us about yourself"
                            className="bg-zinc-900 border-zinc-800 focus:ring-white/20 min-h-[100px]"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            placeholder="https://your-portfolio.com"
                            className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Social Links</Label>
                        <div className="grid gap-3">
                            <Input
                                placeholder="Instagram username"
                                className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                                value={formData.socials.instagram}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socials: { ...prev.socials, instagram: e.target.value }
                                }))}
                            />
                            <Input
                                placeholder="X (Twitter) username"
                                className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                                value={formData.socials.twitter}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socials: { ...prev.socials, twitter: e.target.value }
                                }))}
                            />
                            <Input
                                placeholder="ArtStation username"
                                className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                                value={formData.socials.artstation}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socials: { ...prev.socials, artstation: e.target.value }
                                }))}
                            />
                            <Input
                                placeholder="LinkedIn username or URL"
                                className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                                value={formData.socials.linkedin}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socials: { ...prev.socials, linkedin: e.target.value }
                                }))}
                            />
                            <Input
                                placeholder="YouTube handle or URL"
                                className="bg-zinc-900 border-zinc-800 focus:ring-white/20"
                                value={formData.socials.youtube}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    socials: { ...prev.socials, youtube: e.target.value }
                                }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-zinc-950 pt-4 pb-2 border-t border-zinc-800 -mx-6 px-6 mt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
