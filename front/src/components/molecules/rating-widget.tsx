"use client";

import {
  BookOpen,
  Brain,
  Gamepad2,
  Palette,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { RatingElements } from "@/lib/strapi-helpers";

export type { RatingElements };

const elements = [
  {
    key: "gameplay" as const,
    label: "جذابیت گیم‌پلی و مکانیک‌ها",
    desc: "میزان سرگرم‌کننده بودن فرآیند کلی، تعامل و نوآوری کارت‌ها",
    icon: Gamepad2,
  },
  {
    key: "artAndComponents" as const,
    label: "طراحی هنری و کیفیت قطعات",
    desc: "جلوه‌های بصری، آرت کارت‌ها و کیفیت توکن‌ها و صفحه بازی",
    icon: Palette,
  },
  {
    key: "rulesEase" as const,
    label: "وضوح قوانین و سهولت یادگیری",
    desc: "میزان شفافیت دفترچه راهنما و سادگی آموزش آن به افراد جدید",
    icon: BookOpen,
  },
  {
    key: "strategyDepth" as const,
    label: "عمق استراتژیک و تاکتیک‌ها",
    desc: "تاثیر مهارت، چینش نقشه و برنامه‌ریزی بر غلبه روی شانس",
    icon: Brain,
  },
  {
    key: "replayability" as const,
    label: "ارزش تکرار مجدد و سناریوها",
    desc: "جذابیت و کشش بازی پس از ده‌ها بار اجرای مکرر",
    icon: RotateCcw,
  },
];

function getCriterionColor(score: number) {
  if (score >= 8.5) return "from-emerald-500 to-teal-400 shadow-emerald-500/10";
  if (score >= 7.0) return "from-amber-500 to-amber-400 shadow-amber-500/10";
  if (score >= 5.0) return "from-orange-500 to-orange-400 shadow-orange-500/10";
  return "from-rose-500 to-red-400 shadow-rose-500/10";
}

function getCriterionTextColor(score: number) {
  if (score >= 8.5) return "text-emerald-400";
  if (score >= 7.0) return "text-amber-400";
  if (score >= 5.0) return "text-orange-400";
  return "text-rose-400";
}

function getCriterionLabel(score: number) {
  if (score >= 9) return "افسانه‌ای";
  if (score >= 8.5) return "بی‌نظیر";
  if (score >= 7) return "بسیار خوب";
  if (score >= 5.5) return "متوسط";
  return "ضعیف";
}

export function RatingWidget({
  ratings,
  onRatingChange,
  interactive = false,
  className,
}: {
  ratings: RatingElements;
  onRatingChange?: (ratings: RatingElements) => void;
  interactive?: boolean;
  className?: string;
}) {
  const currentAverage =
    Object.values(ratings).reduce((a, b) => a + b, 0) / 5;

  const handleValueChange = (key: keyof RatingElements, val: number) => {
    if (interactive && onRatingChange) {
      onRatingChange({ ...ratings, [key]: val });
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6 shadow-xl backdrop-blur-md sm:p-8",
        className,
      )}
      dir="rtl"
    >
      <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative z-10 mb-8 flex flex-col justify-between gap-6 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center">
        <div className="space-y-1.5 text-right">
          <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-100">
            <Sparkles className="h-5 w-5 shrink-0 animate-pulse text-amber-500" />
            <span>ارزیابی تخصصی فاکتورهای گیم‌پلی</span>
          </h4>
          <p className="text-xs font-medium leading-relaxed text-slate-400">
            {interactive
              ? "با جابجایی دستگیره‌ها، به این بازی از نظر فاکتورهای ۵گانه امتیاز دهید."
              : "میانگین ارزیابی کاربران و منتقدین بر اساس ابعاد فنی."}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-slate-900/90 p-3 px-5 shadow-md">
          <div className="text-right">
            <span className="block text-[10px] font-extrabold tracking-wider text-slate-400">
              امتیاز کل بوردبرد
            </span>
            <div
              className="mt-0.5 font-mono text-2xl font-black tracking-tight text-amber-400"
              dir="ltr"
            >
              {currentAverage.toFixed(1)}{" "}
              <span className="text-xs font-bold text-slate-500">/ ۱۰</span>
            </div>
          </div>
          <div className="rounded-xl bg-amber-500 p-2.5 font-black text-slate-950 shadow-lg shadow-amber-500/10">
            <Star className="h-6 w-6 fill-slate-950 text-slate-950" />
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {elements.map((el) => {
          const val = ratings[el.key] || 5;
          const Icon = el.icon;
          return (
            <div
              key={el.key}
              className="group space-y-2 border-b border-slate-900/60 pb-2 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-all duration-300 group-hover:border-amber-500/10 group-hover:text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-200 transition-colors group-hover:text-amber-400 sm:text-sm">
                      {el.label}
                    </span>
                    <p className="mt-0.5 hidden max-w-md text-[10px] leading-snug text-slate-500 sm:block">
                      {el.desc}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={cn(
                      "hidden text-[10px] font-bold sm:inline",
                      getCriterionTextColor(val),
                    )}
                  >
                    {getCriterionLabel(val)}
                  </span>
                  <span
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-slate-100 shadow-sm"
                    dir="ltr"
                  >
                    <span className={cn("font-black", getCriterionTextColor(val))}>
                      {interactive ? val.toFixed(0) : val.toFixed(1)}
                    </span>
                    <span className="ml-1 text-[10px] font-medium text-slate-500">
                      / ۱۰
                    </span>
                  </span>
                </div>
              </div>

              {interactive ? (
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={val}
                  onChange={(e) =>
                    handleValueChange(el.key, parseInt(e.target.value, 10))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-900 accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                />
              ) : (
                <div className="flex h-2 w-full overflow-hidden rounded-full border border-slate-900 bg-slate-900/60">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-l shadow-sm transition-all duration-500",
                      getCriterionColor(val),
                    )}
                    style={{ width: `${val * 10}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
