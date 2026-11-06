"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut, authClient } from "@/lib/auth-client"

export default function ProfilePage() {
  const { data: session, isPending } = useSession()

  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>Not signed in</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button type="button" onClick={() => (window.location.href = "/signin")}>
              Go to Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = session.user

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(null)
    setError(null)
    setLoading(true)

    const { error } = await authClient.updateUser({
      name: name.trim() || undefined,
      image: image.trim() || undefined,
    })

    if (error) {
      setError(error.message ?? "Could not update profile")
    } else {
      setStatus("Profile updated successfully")
      setName("")
      setImage("")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center pb-2">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">My Profile</CardTitle>
            <CardDescription>
              {user.name}
              {user.email ? <br /> : null}
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder={user.name || "Full name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FieldDescription>Leave empty to keep unchanged</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="image">Profile image URL</FieldLabel>
                  <Input
                    id="image"
                    type="url"
                    placeholder={user.image || "https://example.com/avatar.jpg"}
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                  <FieldDescription>Leave empty to keep unchanged</FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update profile"}
                  </Button>
                  {status ? (
                    <FieldDescription className="text-center text-green-600">
                      {status}
                    </FieldDescription>
                  ) : null}
                  {error ? (
                    <FieldDescription className="text-center text-red-500">
                      {error}
                    </FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>
            </form>

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
