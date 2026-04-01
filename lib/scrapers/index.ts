import { coletarFinep, type EditalBruto } from './finep'

export type { EditalBruto }

export async function coletarTodos(): Promise<{ fonte: string; editais: EditalBruto[] }[]> {
  const resultados = await Promise.allSettled([
    coletarFinep().then(editais => ({ fonte: 'FINEP', editais })),
  ])

  return resultados
    .filter((r): r is PromiseFulfilledResult<{ fonte: string; editais: EditalBruto[] }> => r.status === 'fulfilled')
    .map(r => r.value)
}
