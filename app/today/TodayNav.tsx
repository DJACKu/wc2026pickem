"use client";

import { useEffect, useState } from "react";

export function TodayNav({ sortedDates, initialTarget }: { sortedDates: string[], initialTarget: string }) {
  const [activeDate, setActiveDate] = useState(initialTarget);

  useEffect(() => {
    const scrollToEl = (el: HTMLElement) => {
      const y = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    // 1) Initial check if there's a hash in URL
    if (window.location.hash) {
      const hashDate = window.location.hash.replace("#day-", "");
      if (sortedDates.includes(hashDate)) {
        setActiveDate(hashDate);
        // Small timeout to ensure layout is done before scrolling
        const el = document.getElementById(`day-${hashDate}`);
        if (el) setTimeout(() => scrollToEl(el), 100);
      }
    } else {
      // 2) If no hash, auto-scroll to initialTarget
      const el = document.getElementById(`day-${initialTarget}`);
      if (el) {
        setTimeout(() => scrollToEl(el), 100);
      }
    }

    // 3) Intersection observer to update activeDate on scroll
    const observer = new IntersectionObserver((entries) => {
      // Find the entry that is intersecting most (or first intersecting)
      let maxRatio = 0;
      let visibleId = null;
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          visibleId = entry.target.id;
        }
      }
      if (visibleId) {
        const d = visibleId.replace("day-", "");
        setActiveDate(d);
      }
    }, {
      rootMargin: "-150px 0px -60% 0px", // triggers when element reaches ~150px from top
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    // We delay observation slightly to prevent initial scroll from confusing the observer
    const timeoutId = setTimeout(() => {
      for (const d of sortedDates) {
        const el = document.getElementById(`day-${d}`);
        if (el) observer.observe(el);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [sortedDates, initialTarget]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, date: string) => {
    e.preventDefault();
    setActiveDate(date);
    const el = document.getElementById(`day-${date}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.pushState(null, "", `#day-${date}`);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-8 snap-x custom-scrollbar sticky top-[60px] z-20 bg-[var(--ink-1)] pt-4 border-b border-[var(--line)]">
      {sortedDates.map(date => {
        const isActive = date === activeDate;
        const dateObj = new Date(`${date}T12:00:00Z`);
        const label = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        
        return (
          <a
            key={date}
            href={`#day-${date}`}
            onClick={(e) => handleClick(e, date)}
            className="snap-start shrink-0 px-4 py-2 rounded-full font-mono text-[13px] tracking-wide uppercase transition-colors"
            style={{
              background: isActive ? "var(--paper-1)" : "var(--ink-2)",
              color: isActive ? "var(--ink-1)" : "var(--paper-3)",
              border: isActive ? "1px solid var(--paper-1)" : "1px solid var(--line)",
            }}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
