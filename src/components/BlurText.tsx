// Adapted from React Bits: https://github.com/DavidHDev/react-bits
import { motion, type Transition } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

type AnimationStep = Record<string, string | number>;

type BlurTextProps = {
  as?: "h1" | "h2";
  id?: string;
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimationStep;
  animationTo?: AnimationStep[];
  easing?: (value: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

function buildKeyframes(from: AnimationStep, steps: AnimationStep[]) {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((step) => Object.keys(step)),
  ]);
  const keyframes: Record<string, Array<string | number>> = {};

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });

  return keyframes;
}

export default function BlurText({
  as = "h1",
  id,
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lines = text.split("\n").map((line) =>
    animateBy === "words" ? line.split(" ") : line.split(""),
  );
  const segmentCount = lines.reduce(
    (count, lineSegments) => count + lineSegments.length,
    0,
  );
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const defaultFrom = useMemo(
    () => ({
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "top" ? -50 : 50,
    }),
    [direction],
  );
  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );
  const from = animationFrom ?? defaultFrom;
  const to = animationTo ?? defaultTo;
  const stepCount = to.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from(
    { length: stepCount },
    (_, index) => index / (stepCount - 1),
  );

  const Heading = as;
  let segmentIndex = 0;

  return (
    <Heading id={id} ref={ref} className={className}>
      {lines.map((lineSegments, lineIndex) => (
        <span className="blur-text-line" key={`line-${lineIndex}`}>
          {lineSegments.map((segment, index) => {
            const currentIndex = segmentIndex++;
            const transition: Transition = {
              duration: totalDuration,
              times,
              delay: (currentIndex * delay) / 1000,
              ease: easing,
            };

            return (
              <motion.span
                key={`${segment}-${currentIndex}`}
                initial={reduceMotion ? false : from}
                animate={
                  reduceMotion
                    ? to[to.length - 1]
                    : inView
                      ? buildKeyframes(from, to)
                      : from
                }
                transition={reduceMotion ? { duration: 0 } : transition}
                onAnimationComplete={
                  currentIndex === segmentCount - 1
                    ? onAnimationComplete
                    : undefined
                }
              >
                {segment}
                {animateBy === "words" && index < lineSegments.length - 1
                  ? "\u00a0"
                  : null}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Heading>
  );
}
