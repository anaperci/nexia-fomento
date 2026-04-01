import type { Edital, PerfilEmpresa } from '@/types'

export function calcularScore(edital: Edital, perfil: PerfilEmpresa): number {
  let score = 0
  let totalPeso = 0

  // Região (peso 20)
  if (edital.regiao && perfil.regiao) {
    totalPeso += 20
    if (edital.regiao.includes('nacional') || edital.regiao.includes(perfil.regiao.toLowerCase())) {
      score += 20
    }
  }

  // Porte (peso 25)
  if (edital.porte_empresa && perfil.porte) {
    totalPeso += 25
    if (edital.porte_empresa.includes(perfil.porte)) {
      score += 25
    }
  }

  // Áreas temáticas (peso 30)
  if (edital.areas_tematicas && perfil.areas_interesse) {
    totalPeso += 30
    const match = edital.areas_tematicas.filter(a =>
      perfil.areas_interesse!.some(p =>
        a.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(a.toLowerCase())
      )
    )
    if (match.length > 0) {
      score += Math.min(30, (match.length / edital.areas_tematicas.length) * 30)
    }
  }

  // Palavras-chave (peso 25)
  if (perfil.palavras_chave && edital.descricao) {
    totalPeso += 25
    const desc = edital.descricao.toLowerCase()
    const matches = perfil.palavras_chave.filter(kw => desc.includes(kw.toLowerCase()))
    if (matches.length > 0) {
      score += Math.min(25, (matches.length / perfil.palavras_chave.length) * 25)
    }
  }

  if (totalPeso === 0) return 50
  return Math.round((score / totalPeso) * 100)
}
