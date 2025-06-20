import { redirect } from "next/navigation"

export default function HomePage() {
  // In a real app, check authentication status
  // For demo, redirect to login
  redirect("/login")
}
