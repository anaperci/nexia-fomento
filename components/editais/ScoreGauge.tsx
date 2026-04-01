interface Props {
  score: number
  size?: 'sm' | 'md'
}

export function ScoreGauge({ score, size = 'md' }: Props) {
  const color = score >= 75 ? '#3b6d11' : score >= 50 ? '#854f0b' : '#9ca3af'
  const bg    = score >= 75 ? '#eaf3de' : score >= 50 ? '#faeeda' : '#f3f4f6'
  const dim = size === 'sm' ? 'w-10 h-10 text-[12px]' : 'w-12 h-12 text-[13px]'

  return (
    <div
      className={`${dim} rounded-xl flex flex-col items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: bg, color }}
    >
      <span className="font-bold leading-none">{score}</span>
      <span className="text-[9px] opacity-70 leading-none mt-0.5">score</span>
    </div>
  )
}
