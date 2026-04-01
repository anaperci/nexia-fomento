-- Schema nexia para NexIA Fomento
CREATE SCHEMA IF NOT EXISTS nexia;

-- Fontes de coleta
CREATE TABLE nexia.fontes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('scraping', 'rss', 'api')),
  ativa BOOLEAN DEFAULT true,
  ultima_coleta TIMESTAMPTZ,
  total_coletados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Editais
CREATE TABLE nexia.editais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fonte_id UUID REFERENCES nexia.fontes(id),
  titulo TEXT NOT NULL,
  url_original TEXT,
  descricao TEXT,
  orgao TEXT,
  modalidade TEXT CHECK (modalidade IN ('subvencao', 'credito', 'premio', 'bolsa', 'outro')),
  publico_alvo TEXT[],
  areas_tematicas TEXT[],
  valor_minimo NUMERIC,
  valor_maximo NUMERIC,
  prazo_submissao DATE,
  regiao TEXT[],
  porte_empresa TEXT[],
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencendo', 'encerrado', 'suspenso')),
  score_aderencia INTEGER,
  resumo_ia TEXT,
  proximos_passos TEXT[],
  dados_brutos JSONB,
  coletado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Perfil da empresa (para calcular aderencia)
CREATE TABLE nexia.perfil_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  setor TEXT[],
  porte TEXT CHECK (porte IN ('mei', 'micro', 'pequena', 'media', 'grande')),
  regiao TEXT,
  receita_anual NUMERIC,
  areas_interesse TEXT[],
  palavras_chave TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alertas
CREATE TABLE nexia.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  canal TEXT CHECK (canal IN ('email', 'whatsapp')),
  score_minimo INTEGER DEFAULT 60,
  areas TEXT[],
  modalidades TEXT[],
  valor_minimo NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir fontes padrao
INSERT INTO nexia.fontes (nome, url, tipo) VALUES
  ('FINEP', 'http://www.finep.gov.br/chamadas-publicas/chamadaspublicas?situacao=aberta', 'scraping'),
  ('CNPq', 'https://www.gov.br/cnpq/pt-br/acesso-a-informacao/acoes-e-programas/editais', 'scraping'),
  ('BNDES', 'https://www.bndes.gov.br/editais', 'scraping'),
  ('DOU', 'https://www.in.gov.br/consulta', 'api'),
  ('FAPESP', 'https://fapesp.br/oportunidades', 'scraping'),
  ('SEBRAE', 'https://sebrae.com.br/sites/PortalSebrae/editais', 'scraping');

-- Expor schema nexia via PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, nexia';
NOTIFY pgrst, 'reload config';

-- Grants para PostgREST
GRANT USAGE ON SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA nexia TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nexia TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA nexia GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- RLS
ALTER TABLE nexia.fontes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.perfil_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexia.alertas ENABLE ROW LEVEL SECURITY;

-- Policies permissivas (ajustar conforme auth)
CREATE POLICY "allow_all_fontes" ON nexia.fontes FOR ALL USING (true);
CREATE POLICY "allow_all_editais" ON nexia.editais FOR ALL USING (true);
CREATE POLICY "allow_all_perfil" ON nexia.perfil_empresa FOR ALL USING (true);
CREATE POLICY "allow_all_alertas" ON nexia.alertas FOR ALL USING (true);
