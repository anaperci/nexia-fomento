interface Props {
  count?: number
  height?: string
}

export function LoadingSkeleton({ count = 3, height = 'h-[100px]' }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-white rounded-xl border border-black/[0.07] p-4 ${height} animate-pulse`} />
      ))}
    </div>
  )
}
