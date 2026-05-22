"use client";

import { motion } from "framer-motion";
import { Circle, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#FECD00";

const examples = [
  {
    description: "City street ambience for fast-cut creator videos.",
    file: "/music/1.mp3",
    title: "Hongdae Street",
  },
  {
    description: "Warm narrative music for cinematic vlog scenes.",
    file: "/music/2.mp3",
    title: "Haruki",
  },
  {
    description: "Generated soundtrack ready for edits and shorts.",
    file: "/music/3.mp3",
    title: "Creator Cut",
  },
];

function AccentShape({
  className,
  rotate,
}: {
  className?: string;
  rotate: number;
}) {
  return (
    <div className={cn("absolute", className)}>
      <div
        className="h-24 w-[420px] rounded-full border-2 border-[#FECD00]/15 bg-gradient-to-r from-[#FECD00]/18 to-transparent blur-[1px] backdrop-blur-[2px] sm:h-32 sm:w-[560px]"
        style={{ transform: `rotate(${rotate}deg)` }}
      />
    </div>
  );
}

export function ExampleSection() {
  return (
    <section
      id="example"
      className="relative overflow-hidden bg-[#030303] px-4 py-24 text-white sm:px-6 lg:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(254,205,0,0.12),transparent_32%),radial-gradient(circle_at_16%_70%,rgba(254,205,0,0.08),transparent_24%),radial-gradient(circle_at_84%_80%,rgba(255,255,255,0.06),transparent_26%)]" />
      <AccentShape className="-left-36 top-20" rotate={13} />
      <AccentShape className="-right-44 bottom-24" rotate={-14} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FECD00]/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1"
          >
            <Circle
              className="h-2 w-2"
              fill={ACCENT}
              stroke={ACCENT}
              aria-hidden="true"
            />
            <span className="text-sm tracking-wide text-white/60">
              Example
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            당신의 영상에 필요한
            <br />
            <span className="bg-gradient-to-r from-[#FECD00] via-white to-[#FECD00] bg-clip-text text-transparent">
              완벽한 음악을 만들어보세요
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.25, 0.4, 0.25, 1] }}
            className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/44 sm:text-base"
          >
            장면의 무드, 편집 호흡, 영상의 목적에 맞는 사운드를 몇 줄의
            설명만으로 완성하세요.
          </motion.p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
          {examples.map((example, index) => (
            <motion.article
              key={example.file}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: 0.12 * index,
                duration: 0.72,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="rounded-[8px] border border-white/12 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            >
              <div className="mb-4 flex h-32 items-center justify-center rounded-[8px] border border-[#FECD00]/14 bg-[radial-gradient(circle_at_50%_20%,rgba(254,205,0,0.22),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] text-[#FECD00]">
                  <Music2 className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {example.title}
              </h3>
              <p className="mt-2 min-h-10 text-xs leading-5 text-white/46">
                {example.description}
              </p>
              <audio
                controls
                preload="metadata"
                src={example.file}
                className="mt-4 w-full accent-[#FECD00]"
              >
                <a href={example.file}>Listen to {example.title}</a>
              </audio>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
