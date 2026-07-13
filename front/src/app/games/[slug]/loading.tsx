import { Container } from "@/components/atoms/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <Container className="py-8">
        <Skeleton className="h-9 w-20 rounded-md" />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-10 w-[70%]" />
            <Skeleton className="mt-3 h-4 w-40" />
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <Skeleton className="mt-6 h-32 w-full rounded-xl" />
            <Skeleton className="mt-6 h-4 w-[90%]" />
            <Skeleton className="mt-2 h-4 w-[80%]" />
            <Skeleton className="mt-2 h-4 w-[70%]" />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton key={idx} className="h-[260px] w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

