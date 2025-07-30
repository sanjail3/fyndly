import { useEffect, useMemo, useState } from "react";
import { Sparkle } from "lucide-react";
import { loadFull } from "tsparticles";

import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";

const options: ISourceOptions = {
  key: "star",
  name: "Star",
  particles: {
    number: {
      value: 20,
      density: {
        enable: false,
      },
    },
    color: {
      value: ["#CBFF33", "#9ACD32", "#CAFE33", "#B8E600", "#A4D100", "#FFFFFF"],
    },
    shape: {
      type: "star",
      options: {
        star: {
          sides: 4,
        },
      },
    },
    opacity: {
      value: 0.8,
    },
    size: {
      value: { min: 1, max: 4 },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      enable: true,
      direction: "clockwise",
      animation: {
        enable: true,
        speed: 12,
        sync: false,
      },
    },
    links: {
      enable: false,
    },
    reduceDuplicates: true,
    move: {
      enable: true,
      center: {
        x: 60,
        y: 30,
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
      onClick: {
        enable: true,
        mode: "push",
      },
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
      push: {
        quantity: 4,
      },
    },
  },
  smooth: true,
  fpsLimit: 120,
  background: {
    color: "transparent",
    size: "cover",
  },
  fullScreen: {
    enable: false,
  },
  detectRetina: true,
  absorbers: [
    {
      enable: true,
      opacity: 0,
      size: {
        value: 1,
        density: 1,
        limit: {
          radius: 4,
          mass: 4,
        },
      },
      position: {
        x: 60,
        y: 30,
      },
    },
  ],
  emitters: [
    {
      autoPlay: true,
      fill: true,
      life: {
        wait: true,
      },
      rate: {
        quantity: 4,
        delay: 0.5,
      },
      position: {
        x: 60,
        y: 30,
      },
    },
  ],
};

export default function AiButton() {
  const [particleState, setParticlesReady] = useState<"loaded" | "ready">();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setParticlesReady("loaded");
    });
  }, []);

  const modifiedOptions = useMemo(() => {
    options.autoPlay = isActive;
    return options;
  }, [isActive]);

  const handleInteractionStart = () => {
    setIsActive(true);
  };

  const handleInteractionEnd = () => {
    setTimeout(() => setIsActive(false), 300);
  };

  return (
    <button
      className="group relative rounded-2xl bg-gradient-to-br from-[#CBFF33]/30 via-[#CAFE33]/40 to-[#B8E600]/30 p-1 shadow-lg shadow-[#CBFF33]/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#CBFF33]/30 active:scale-105"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      style={{ 
        minWidth: '48px', 
        minHeight: '48px',
        background: 'linear-gradient(135deg, #CBFF33 0%, #CAFE33 50%, #B8E600 100%)',
        boxShadow: '0 4px 20px rgba(203, 255, 51, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#CBFF33] via-[#CAFE33] to-[#B8E600] p-3 text-black">
        {/* Main sparkle icon */}
        <Sparkle className="size-6 animate-pulse fill-black drop-shadow-sm" />
        
        {/* Floating sparkles */}
        <Sparkle
          style={{
            animationDelay: "0.5s",
            animationDuration: "2s",
          }}
          className="absolute bottom-1.5 left-1.5 z-20 size-2 rotate-12 animate-bounce fill-black opacity-80"
        />
        <Sparkle
          style={{
            animationDelay: "1s",
            animationDuration: "1.8s",
          }}
          className="absolute left-2.5 top-1.5 size-1.5 -rotate-12 animate-ping fill-black opacity-70"
        />
        <Sparkle
          style={{
            animationDelay: "0.3s",
            animationDuration: "2.2s",
          }}
          className="absolute right-1.5 top-2 size-1.5 rotate-45 animate-pulse fill-black opacity-75"
        />
        <Sparkle
          style={{
            animationDelay: "1.5s",
            animationDuration: "1.5s",
          }}
          className="absolute bottom-2 right-2 size-1 -rotate-45 animate-bounce fill-black opacity-60"
        />

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
      </div>

      {/* Enhanced particle system */}
      {!!particleState && (
        <Particles
          id="ai-button-particles-mobile"
          className={`pointer-events-none absolute -bottom-3 -left-3 -right-3 -top-3 z-0 opacity-0 transition-opacity duration-300 ${
            particleState === "ready" && isActive ? "opacity-100" : ""
          }`}
          particlesLoaded={async () => {
            setParticlesReady("ready");
          }}
          options={modifiedOptions}
        />
      )}
      
      {/* Background pulse effect */}
      <div className="absolute inset-0 rounded-2xl bg-[#CBFF33] opacity-0 animate-ping group-hover:opacity-20 transition-opacity duration-300" />
    </button>
  );
}
