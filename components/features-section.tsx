"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Circle } from "lucide-react";

const features = [
  {
    body: "상업 영상, 쇼츠, 광고 편집에 어울리는 음악을 직접 생성해 저작권 리스크를 줄이세요.",
    image: "/image/creative-retro-music-concept-with-space-bottom.jpg",
    title: "저작권에 더 이상 얽매이지 마세요",
  },
  {
    body: "찾고, 미리 듣고, 다시 다운로드하는 반복 작업 대신 장면에 맞는 사운드를 바로 만드세요.",
    image: "/image/10560543.jpg",
    title: "mp3 다운로드는 그만하세요",
  },
  {
    body: "장르, 무드, 악기, 속도, 영상 분위기를 입력하면 내 취향에 맞춘 음악이 완성됩니다.",
    image: "/image/creative-retro-music-concept-with-space-bottom.jpg",
    title: "내 취향에 맞는 음악을 생성하세요",
  },
  {
    body: "1분부터 3분까지, 한 번에 여러 결과물까지. 편집 길이에 맞는 선택지를 빠르게 확보하세요.",
    image: "/image/10560543.jpg",
    title: "영상 길이에 맞춰 확장하세요",
  },
  {
    body: "생성한 음악은 워크스페이스에 저장되고, 재생과 이름 변경, 다운로드까지 한 곳에서 관리됩니다.",
    image: "/image/creative-retro-music-concept-with-space-bottom.jpg",
    title: "작업물을 한 곳에서 관리하세요",
  },
  {
    body: "필요한 만큼 크레딧을 충전하고, 생성 실패 시 차감된 크레딧은 자동으로 반환됩니다.",
    image: "/image/10560543.jpg",
    title: "크레딧으로 명확하게 사용하세요",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#030303] px-4 py-24 text-white sm:px-6 lg:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(254,205,0,0.1),transparent_30%),radial-gradient(circle_at_8%_40%,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_88%_68%,rgba(254,205,0,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

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
              fill="#FECD00"
              stroke="#FECD00"
              aria-hidden="true"
            />
            <span className="text-sm tracking-wide text-white/60">
              Features
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            당신에게 필요한
            <br />
            <span className="bg-gradient-to-r from-white via-[#FECD00] to-white bg-clip-text text-transparent">
              모든 음악 기능
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.25, 0.4, 0.25, 1] }}
            className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/44 sm:text-base"
          >
            더 이상 음악을 찾아 헤매지 않아도 됩니다. 영상 제작에 필요한
            사운드 제작, 저장, 다운로드, 크레딧 관리까지 한 흐름으로
            이어집니다.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: 0.08 * index,
                duration: 0.72,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10">
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-72 saturate-[0.85] transition duration-500 group-hover:scale-[1.035] group-hover:opacity-88"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(254,205,0,0.22),transparent_34%),linear-gradient(to_top,rgba(3,3,3,0.88),rgba(3,3,3,0.12))]" />
              </div>
              <div className="p-5">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-[#FECD00]/80">
                  0{index + 1}
                </p>
                <h3 className="text-base font-semibold leading-6 text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/48">
                  {feature.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
