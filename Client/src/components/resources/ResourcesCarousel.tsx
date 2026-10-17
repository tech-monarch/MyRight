"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResourceCard } from "@/components/resources/ResourceCard";
import type { LegalResource } from "@/lib/legal-resources";

/**
 * A plain scroll-snap carousel: native touch swiping on phones, real
 * previous/next buttons on larger screens, and no dependency. The scroller
 * is keyboard-focusable, so the arrow keys scroll it natively too.
 */
export function ResourcesCarousel({ items, label }: { items: LegalResource[]; label: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  function page(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduceMotion ? "auto" : "smooth" });
  }

  const arrow =
    "absolute top-[40%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-navy shadow-raised transition hover:border-blue hover:text-blue disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="relative">
      <button type="button" aria-label="Previous resources" onClick={() => page(-1)} disabled={!canPrev} className={`${arrow} -left-5`}>
        <ChevronLeft size={20} />
      </button>
      <button type="button" aria-label="Next resources" onClick={() => page(1)} disabled={!canNext} className={`${arrow} -right-5`}>
        <ChevronRight size={20} />
      </button>

      <div
        ref={scroller}
        onScroll={update}
        tabIndex={0}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-5 pt-1 focus-visible:outline-offset-[-2px] sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {items.map((r, i) => (
          <div
            key={r.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="w-[78%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          >
            <ResourceCard resource={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
