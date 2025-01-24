import { StatsCounter } from "./stat"

export const Stats = ({
  title,
  subtitle,
  stats,
  reverse = false,
}: {
  title: string
  subtitle: string
  reverse?: boolean
  stats: { title: string; number: number; subtitle?: string }[]
}) => {
  return (
    <div className="w-full py-12 md:py-40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <h2
            className={`text-center text-xl md:text-6xl font-bold ${
              reverse ? "text-white" : "text-primary"
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-center text-base md:text-lg font-normal ${
              reverse ? "text-white" : "text-muted-foreground"
            } max-w-2xl mt-2 mx-auto`}
          >
            {subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
            {stats.map((stat, index) => (
              <StatsCounter
                key={stat.title}
                title={stat.title}
                number={stat.number}
                subtitle={stat.subtitle}
                reverse={reverse}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
