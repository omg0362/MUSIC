"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = G * sin(G * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  vec2 centeredUv = vUv - 0.5;
  centeredUv.x *= uResolution.x / max(uResolution.y, 1.0);

  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(centeredUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
    0.4 * sin(5.0 * (tex.x + tex.y +
      cos(3.0 * tex.x + 5.0 * tex.y) +
      0.02 * tOffset) +
      sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec3 silk = uColor * pattern - vec3(rnd / 15.0 * uNoiseIntensity);
  vec3 base = vec3(0.011, 0.011, 0.011);
  float vignette = smoothstep(0.88, 0.12, length(centeredUv));
  vec3 color = mix(base, silk, 0.82 * vignette);

  gl_FragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");

  return [
    Number.parseInt(clean.slice(0, 2), 16) / 255,
    Number.parseInt(clean.slice(2, 4), 16) / 255,
    Number.parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

  if (!vertex || !fragment) {
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function SilkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });

    if (!canvas || !gl) {
      return;
    }

    const drawingCanvas = canvas;
    const context = gl;
    const program = createProgram(context);

    if (!program) {
      return;
    }

    const buffer = context.createBuffer();
    const positionLocation = context.getAttribLocation(program, "aPosition");
    const uTime = context.getUniformLocation(program, "uTime");
    const uResolution = context.getUniformLocation(program, "uResolution");
    const uColor = context.getUniformLocation(program, "uColor");
    const uSpeed = context.getUniformLocation(program, "uSpeed");
    const uScale = context.getUniformLocation(program, "uScale");
    const uRotation = context.getUniformLocation(program, "uRotation");
    const uNoiseIntensity = context.getUniformLocation(
      program,
      "uNoiseIntensity",
    );
    const color = hexToRgb("#FECD00");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;
    let start = performance.now();

    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      context.STATIC_DRAW,
    );

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(
        1,
        Math.floor(drawingCanvas.clientWidth * ratio),
      );
      const height = Math.max(
        1,
        Math.floor(drawingCanvas.clientHeight * ratio),
      );

      if (drawingCanvas.width !== width || drawingCanvas.height !== height) {
        drawingCanvas.width = width;
        drawingCanvas.height = height;
      }

      context.viewport(0, 0, width, height);
    }

    function render(now: number) {
      resize();
      context.useProgram(program);
      context.enableVertexAttribArray(positionLocation);
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.vertexAttribPointer(
        positionLocation,
        2,
        context.FLOAT,
        false,
        0,
        0,
      );

      context.uniform1f(uTime, (now - start) * 0.001);
      context.uniform2f(uResolution, drawingCanvas.width, drawingCanvas.height);
      context.uniform3f(uColor, color[0], color[1], color[2]);
      context.uniform1f(uSpeed, 3.2);
      context.uniform1f(uScale, 1.25);
      context.uniform1f(uRotation, -0.34);
      context.uniform1f(uNoiseIntensity, 1.15);
      context.drawArrays(context.TRIANGLES, 0, 6);

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    if (reducedMotion) {
      start = 0;
      render(1200);
    } else {
      animationFrame = window.requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative min-h-[78vh] overflow-hidden bg-[#030303] text-white"
    >
      <SilkCanvas />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,3,3,0.24),rgba(3,3,3,0.72)),radial-gradient(circle_at_50%_50%,transparent_0%,rgba(3,3,3,0.76)_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FECD00]/42 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-white/54">
          CTA
        </p>
        <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          영상에 맞는 음악,
          <br />
          <span className="bg-gradient-to-r from-[#FECD00] via-white to-[#FECD00] bg-clip-text text-transparent">
            지금 바로 만들어보세요
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
          필요한 만큼 크레딧을 충전하고, 프롬프트 한 줄로 장면에 어울리는
          사운드트랙을 생성하세요.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/auth"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#030303] shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#030303]"
          >
            Start creating
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/[0.06] px-6 text-sm font-semibold text-white transition hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/24"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
