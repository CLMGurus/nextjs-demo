"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login-form";

export function LoginFormWrapper(
  props: React.ComponentProps<typeof LoginForm>
) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? undefined;

  return <LoginForm {...props} error={error} />;
}
