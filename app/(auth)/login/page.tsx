import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthSplitShell } from "@/components/shared/auth-split-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <AuthSplitShell
      imageSrc="/land.jpg"
      imageAlt="Baobab Hotel at dusk, infinity pool and warm exterior lighting"
      headline="Rwandan Hospitality Refined."
      subtext="Experience the quiet confidence of Baobab Hotel, where every sunset marks the beginning of an unforgettable story."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthSplitShell>
  );
}