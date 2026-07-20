"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { resolveLoginRedirect } from "@/lib/auth-routes";
import type { UserRole } from "@/server/auth/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const darkFieldClass =
  "bg-abyss-elevated border-abyss-line text-abyss-foreground placeholder:text-abyss-foreground-muted focus-visible:ring-emerald";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput, rememberMe: boolean) {
    setServerError(null);
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe,
    });

    if (error) {
      setServerError(error.message ?? "Invalid email or password.");
      return;
    }

    const role = (data.user.role ?? "guest") as UserRole;
    const destination = resolveLoginRedirect(role, searchParams.get("redirect"));
    router.push(destination);
    router.refresh();
  }

  const [rememberMe, setRememberMe] = React.useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-3xl font-medium">Welcome back</h2>
        <p className="text-abyss-foreground-muted mt-2 text-sm">Please enter your details.</p>
      </div>

      <form
        onSubmit={handleSubmit((values) => onSubmit(values, rememberMe))}
        noValidate
        className="flex flex-col gap-5"
      >
        {serverError && (
          <p role="alert" className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-abyss-foreground-muted text-xs tracking-widest uppercase">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={darkFieldClass}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-300">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-abyss-foreground-muted text-xs tracking-widest uppercase">
              Password
            </Label>
            {/* Forgot-password flow isn't built yet — this links to a route
                we'll add in a follow-up auth-recovery step. */}
            <Link href="/forgot-password" className="text-emerald text-xs hover:underline">
              Forgot Password
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={darkFieldClass}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-300">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            className="border-abyss-line"
          />
          <Label htmlFor="rememberMe" className="text-abyss-foreground-muted text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "bg-emerald hover:bg-emerald-hover text-emerald-foreground h-11 w-full tracking-[0.08em] uppercase",
          )}
        >
          {isSubmitting ? "Signing in…" : "Login"}
        </Button>
      </form>

      <p className="text-abyss-foreground-muted text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald font-medium hover:underline">
          Request Access
        </Link>
      </p>
    </div>
  );
}