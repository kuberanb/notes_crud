import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDispatch } from "react-redux"
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/services/api"
import { setCredentials } from "./authSlice"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function AuthForm() {
  const [isRegistration, setIsRegistration] = useState(false)
  const dispatch = useDispatch()
  const [errorMessage, setErrorMessage] = useState("")

  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [register, { isLoading: isRegistering }] = useRegisterMutation()

  const isLoading = isLoggingIn || isRegistering

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) return

    setErrorMessage("")

    const form = event.currentTarget
    const formData = new FormData(form)

    const credentials = {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? "")
    }

    try {

      if (isRegistration) {

        await register(credentials).unwrap()

        setIsRegistration(false)
      }

      const result = await login(credentials).unwrap()
      setErrorMessage("")
      form.reset()
      dispatch(setCredentials(result))

    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    }

  }

  function toggleForm() {
    setIsRegistration((current) => !current)
    setErrorMessage("")
  }


  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isRegistration ? "Create an account" : "Welcome back"}
          </CardTitle>

          <CardDescription>
            {isRegistration
              ? "Create an account to manage your notes."
              : "Log in to access your notes."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete={
                  isRegistration ? "new-password" : "current-password"
                }
                minLength={isRegistration ? 9 : 1}
                maxLength={128}
                disabled={isLoading}
                required
              />

              {isRegistration && (
                <p className="text-sm text-muted-foreground">
                  Password must contain at least 9 characters.
                </p>
              )}
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Please wait..."
                : isRegistration
                  ? "Create account"
                  : "Log in"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={toggleForm}
              disabled={isLoading}
            >
              {isRegistration
                ? "Already have an account? Log in"
                : "Need an account? Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

