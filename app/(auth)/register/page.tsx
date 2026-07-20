import type { Metadata } from "next";
import { AuthSplitShell } from "@/components/shared/auth-split-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <AuthSplitShell
      imageSrc="/land.jpg"
      imageAlt="Baobab Hotel at dusk, infinity pool and warm exterior lighting"
      headline="Your Story Starts Here."
      subtext="Create an account to book rooms, track your reservations, and return to a hotel that already knows your name."
    >
      <RegisterForm />
    </AuthSplitShell>
  );
}