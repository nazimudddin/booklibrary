"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";

import {
Field,
FieldDescription,
FieldGroup,
FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import {
Eye,
EyeOff,
UserRound,
Mail,
ImagePlus,
LockKeyhole,
} from "lucide-react";

export default function SignupForm() {
const router = useRouter();

const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();


setIsLoading(true);
setErrorMessage("");

try {
  const formData = new FormData(e.currentTarget);

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const image = formData.get("image") as string;
  const password = formData.get("password") as string;

  const { data, error } = await signUp.email({
    name,
    email,
    password,
    image: image.trim() || undefined,
  });

  if (error) {
    setErrorMessage(error.message || "Something went wrong!");
    return;
  }

  if (data) {
    console.log("user signed up", data);
    router.push("/");
    router.refresh();
  }
} catch (error) {
  console.error("Signup error:", error);
  setErrorMessage("Something went wrong. Please try again.");
} finally {
  setIsLoading(false);
}


};

return ( <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8"> <Card className="border shadow-sm"> <CardHeader className="text-center"> <CardTitle className="text-2xl font-bold">
Create an account </CardTitle>


      <CardDescription>
        Join BookLibrary and discover your next favorite book.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit}>
        <FieldGroup>

          {/* Name */}
          <Field>
            <FieldLabel htmlFor="name">
              Full Name
            </FieldLabel>

            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                required
              />
            </div>
          </Field>

          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">
              Email Address
            </FieldLabel>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className="pl-10"
                required
              />
            </div>
          </Field>

          {/* Image URL */}
          <Field>
            <FieldLabel htmlFor="image">
              Profile Image URL
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (Optional)
              </span>
            </FieldLabel>

            <div className="relative">
              <ImagePlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/image.png"
                className="pl-10"
              />
            </div>

            <FieldDescription>
              Add a profile image URL if you want.
            </FieldDescription>
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">
              Password
            </FieldLabel>

            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pr-11 pl-10"
                required
                minLength={8}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <FieldDescription>
              Password must be at least 8 characters.
            </FieldDescription>
          </Field>

          {/* Error Message */}
          {errorMessage && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <Field>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </FieldDescription>
          </Field>

        </FieldGroup>
      </form>
    </CardContent>
  </Card>

  <FieldDescription className="px-6 text-center">
    By creating an account, you agree to our{" "}
    <Link href="/terms" className="underline underline-offset-4">
      Terms of Service
    </Link>{" "}
    and{" "}
    <Link href="/privacy" className="underline underline-offset-4">
      Privacy Policy
    </Link>.
  </FieldDescription>
</div>


);
}
