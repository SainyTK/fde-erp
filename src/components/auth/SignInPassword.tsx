"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { controlClass } from "@/src/components/ui";

export function SignInPassword() {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={id}>
        Password
      </label>
      <div className="relative">
        <input
          autoComplete="current-password"
          className={`${controlClass} pr-14`}
          id={id}
          name="password"
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-controls={id}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-muted hover:text-brand absolute inset-y-0 right-0 grid min-w-11 place-items-center rounded-lg"
          onClick={() => setVisible(!visible)}
          type="button"
        >
          <Icon aria-hidden="true" className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
