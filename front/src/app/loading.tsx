import { Container } from "@/components/atoms/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-white/10">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <Skeleton className="h-3 w-44 rounded-full" />
          <Skeleton className="mt-4 h-10 w-[70%]" />
          <Skeleton className="mt-4 h-4 w-[85%]" />
          <Skeleton className="mt-2 h-4 w-[65%]" />
          <div className="mt-7 flex gap-3">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-6 py-3">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <Container className="py-10">
        <Skeleton className="h-4 w-56" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[260px] rounded-xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}

