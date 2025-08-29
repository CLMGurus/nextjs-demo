"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { login } from "@/app/login/actions";
import { Loader2Icon } from "lucide-react";

export function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button formAction={login} className="w-full" disabled={pending}>
      {pending && <Loader2Icon className="animate-spin" />}
      Login
    </Button>
  );
}
