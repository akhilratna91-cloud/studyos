"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ShieldAlert, ShieldCheck } from "lucide-react";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.76-.07-1.49-.2-2.18H12v4.13h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.88-1.73 2.99-4.28 2.99-7.47Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.22-2.5c-.89.6-2.03.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.07v2.58A9.98 9.98 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.89A5.98 5.98 0 0 1 6.08 12c0-.66.11-1.31.31-1.89V7.53H3.07A9.98 9.98 0 0 0 2 12c0 1.61.39 3.13 1.07 4.47l3.32-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.86-2.86C16.95 2.98 14.69 2 12 2A9.98 9.98 0 0 0 3.07 7.53l3.32 2.58c.79-2.37 3-4.13 5.61-4.13Z"
      />
    </svg>
  );
}

type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
};

type GoogleButtonConfig = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: string;
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
};

type GoogleIdClient = {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    context?: "signin" | "signup" | "use";
  }): void;
  renderButton(element: HTMLElement, options: GoogleButtonConfig): void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdClient;
      };
    };
  }
}

interface GoogleSignInProps {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
}

export function GoogleSignIn({
  clientId,
  disabled = false,
  onCredential,
}: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [renderError, setRenderError] = useState("");

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setRenderError("Google response did not include a credential.");
        return;
      }

      try {
        setRenderError("");
        await onCredential(response.credential);
      } catch (error) {
        setRenderError(
          error instanceof Error
            ? error.message
            : "Google sign-in failed after verification.",
        );
      }
    },
    [onCredential],
  );

  useEffect(() => {
    if (!clientId) {
      setRenderError(
        "Google sign-in is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID to enable it.",
      );
      return;
    }

    if (!scriptReady || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      setRenderError("");
      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        ux_mode: "popup",
        context: "signin",
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: Math.max(buttonRef.current.offsetWidth, 280),
      });
    } catch (error) {
      setRenderError(
        error instanceof Error
          ? error.message
          : "Google sign-in button could not be rendered.",
      );
    }
  }, [clientId, handleCredential, scriptReady]);

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() =>
          setRenderError("Google sign-in script failed to load in this browser.")
        }
      />

      <div
        className={`rounded-[28px] border px-4 py-4 ${
          disabled
            ? "border-white/10 bg-white/5 opacity-60"
            : "border-white/15 bg-white/8"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl bg-white/10 p-2 text-white">
            <GoogleGlyph />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              Continue with Google
            </div>
            <p className="text-xs leading-5 text-gray-400">
              No email/password typing. Your Google identity is verified first,
              then StudyOS creates or unlocks your account.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div
            ref={buttonRef}
            className={`min-h-[44px] ${disabled ? "pointer-events-none" : ""}`}
          />
        </div>

        {clientId && !renderError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-200">
            <ShieldCheck size={14} />
            Official Google Identity button is ready.
          </div>
        )}

        {renderError && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-200">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{renderError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
