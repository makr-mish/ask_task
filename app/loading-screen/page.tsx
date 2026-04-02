"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingScreenPage() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2300);

    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        <div className="card-pulse relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-10 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="absolute inset-0 rounded-[32px] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(191,219,254,0.42),rgba(224,231,255,0.52),rgba(255,255,255,0.72))] bg-[length:250%_250%] animate-[gradientFlow_8s_ease-in-out_infinite]" />

          <div className="absolute inset-0 rounded-[32px] opacity-70 animate-[auraMove_7s_ease-in-out_infinite]">
            <div className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-blue-300/20 blur-2xl" />
            <div className="absolute bottom-[8%] right-[10%] h-32 w-32 rounded-full bg-indigo-300/20 blur-2xl" />
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-3xl" />
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute left-[-35%] top-0 h-full w-[40%] -skew-x-[18deg] bg-[linear-gradient(100deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.32)_45%,rgba(255,255,255,0)_100%)] animate-[shimmer_4.2s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10">
            <Image
              src="/logo.png"
              alt="ASK TASK"
              width={320}
              height={320}
              priority
              className="h-auto w-[220px] select-none sm:w-[300px]"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes auraMove {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, 0, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          55% {
            transform: translateX(330%);
            opacity: 1;
          }
          100% {
            transform: translateX(330%);
            opacity: 0;
          }
        }

        .card-pulse {
          animation: cardPulse 2.8s ease-in-out infinite;
        }

        @keyframes cardPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 32px 78px rgba(59, 130, 246, 0.14);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
          }
        }
      `}</style>
    </main>
  );
}