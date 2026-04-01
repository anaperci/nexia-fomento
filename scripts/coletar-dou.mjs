import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'nexia' } });

const SEARCH_TERMS = [
  'edital fomento inovacao',
  'chamada publica inovacao tecnologia',
  'subvencao economica inovacao',
  'edital FINEP',
  'edital BNDES inovacao',
  'edital CNPq inovacao',
  'chamada publica pesquisa desenvolvimento',
];

async function searchDOU(page, term) {
  console.log(`Buscando: "${term}"`);

  await page.goto('https://www.in.gov.br/consulta/-/buscar/dou', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  await page.fill('#search-bar', term);
  await page.evaluate(() => {
    const radio = document.querySelector('input[name="data-exata"][value="mes"]');
    if (radio) radio.checked = true;
  });

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
    page.evaluate(() => doSearch('advancedSearch')),
  ]);
  await page.waitForTimeout(2000);

  const paramsText = await page.evaluate(() => {
    const el = document.getElementById(
      '_br_com_seatecnologia_in_buscadou_BuscaDouPortlet_params'
    );
    return el?.textContent || '{}';
  });

  const data = JSON.parse(paramsText.trim());
  return data.jsonArray || [];
}

function isRelevant(hit) {
  const title = (hit.title || '').toLowerCase();
  const content = (hit.content || '').toLowerCase();
  const combined = title + ' ' + content;

  // Must mention edital/chamada AND innovation/tech related terms
  const hasEdital = /edital|chamada p[uú]blica|sele[cç][aã]o|concurso/.test(combined);
  const hasInnovation = /inova[cç][aã]o|tecnolog|pesquisa|desenvolvimento|fomento|subven[cç][aã]o|ci[eê]ncia|startup|ict|finep|cnpq|bndes|fapesp|embrapii/.test(combined);

  // Filter out irrelevant types
  const irrelevant = /extrato de contrato|ata de registro|resultado de julgamento|aviso de revoga|suspens[aã]o|errata|retifica[cç][aã]o/.test(title);

  return hasEdital && hasInnovation && !irrelevant;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const allHits = new Map(); // dedupe by urlTitle
  let novos = 0;
  let erros = 0;

  for (const term of SEARCH_TERMS) {
    try {
      const hits = await searchDOU(page, term);
      console.log(`  ${hits.length} resultados`);

      for (const hit of hits) {
        if (!allHits.has(hit.urlTitle) && isRelevant(hit)) {
          allHits.set(hit.urlTitle, hit);
        }
      }
    } catch (e) {
      console.error(`  Erro: ${e.message}`);
    }
  }

  await browser.close();

  console.log(`\nTotal relevantes (dedup): ${allHits.size}`);

  // Get DOU fonte
  const { data: fonte } = await supabase
    .from('fontes')
    .select('id')
    .eq('nome', 'DOU')
    .single();

  for (const [urlTitle, hit] of allHits) {
    const url = `https://www.in.gov.br/web/dou/-/${urlTitle}`;

    // Check if already exists
    const { data: existente } = await supabase
      .from('editais')
      .select('id')
      .eq('url_original', url)
      .single();

    if (!existente) {
      // Clean content from HTML tags
      const descricao = (hit.content || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000);

      const orgao = hit.hierarchyList?.[0] || 'DOU';

      const { error } = await supabase.from('editais').insert({
        fonte_id: fonte?.id,
        titulo: hit.title,
        url_original: url,
        orgao,
        descricao,
        status: 'ativo',
        dados_brutos: hit,
      });

      if (!error) {
        novos++;
        console.log(`+ ${hit.title}`);
      } else {
        erros++;
        console.error(`  Erro inserindo: ${error.message}`);
      }
    }
  }

  // Update fonte
  await supabase
    .from('fontes')
    .update({
      ultima_coleta: new Date().toISOString(),
      total_coletados: allHits.size,
    })
    .eq('nome', 'DOU');

  console.log(`\nResultado: ${allHits.size} relevantes, ${novos} novos, ${erros} erros`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
