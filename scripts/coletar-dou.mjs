/**
 * Coletor multi-fonte via Playwright (GitHub Actions)
 * Fontes: CNPq (memoria2), EMBRAPII
 * A FINEP ja e coletada via scraper proprio no Next.js
 */
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'nexia' } });

// === CNPq ===
async function coletarCNPq(page) {
  console.log('\n=== CNPq ===');
  const editais = [];

  try {
    await page.goto('http://memoria2.cnpq.br/web/guest/chamadas-publicas', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // Click on "Abertas" tab if exists
    const abertasTab = await page.$('a:has-text("Abertas"), a:has-text("abertas")');
    if (abertasTab) {
      await abertasTab.click();
      await page.waitForTimeout(3000);
    }

    // Try getting results from the portlet
    const items = await page.evaluate(() => {
      const results = [];
      // Try multiple selectors
      const links = document.querySelectorAll(
        '.results-row a, .taglib-search-iterator a, table a[href*="chamada"], table a[href*="edital"], .asset-abstract a'
      );
      for (const a of links) {
        const text = a.textContent?.trim();
        const href = a.getAttribute('href');
        if (text && text.length > 20 && href) {
          results.push({ titulo: text.substring(0, 200), url: href });
        }
      }
      return results;
    });

    console.log(`  ${items.length} chamadas encontradas na pagina`);

    // If portlet didn't load, try getting links from the full page
    if (items.length === 0) {
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .filter(a => {
            const h = (a.getAttribute('href') || '').toLowerCase();
            const t = (a.textContent || '').toLowerCase();
            return (h.includes('chamada') || t.includes('chamada')) && t.length > 20;
          })
          .map(a => ({
            titulo: a.textContent?.trim().substring(0, 200) || '',
            url: a.getAttribute('href') || '',
          }));
      });
      console.log(`  ${allLinks.length} links alternativos encontrados`);
      editais.push(...allLinks);
    } else {
      editais.push(...items);
    }
  } catch (e) {
    console.error('  Erro CNPq:', e.message);
  }

  // Filter: only keep chamadas with empresa/inovacao context, skip bolsas
  return editais.filter(e => {
    const t = e.titulo.toLowerCase();
    if (/bolsa|mestrado|doutorado|pesquisador|professor/i.test(t)) return false;
    return true;
  });
}

// === EMBRAPII ===
async function coletarEMBRAPII(page) {
  console.log('\n=== EMBRAPII ===');
  const editais = [];

  try {
    await page.goto('https://embrapii.org.br/transparencia/', {
      waitUntil: 'networkidle', timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // Get chamada links with title text (not "Ver documentos")
    const items = await page.evaluate(() => {
      const seen = new Set();
      return Array.from(document.querySelectorAll('a[href*="chamada"]'))
        .filter(a => {
          const text = a.textContent?.trim() || '';
          const href = a.getAttribute('href') || '';
          // Only named links (not "Ver documentos"), 2025/2026
          return text.length > 20 && text !== 'Ver documentos'
            && /(2025|2026)/.test(href + text)
            && !/resultado|encerrad/i.test(text);
        })
        .map(a => {
          const href = a.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `https://embrapii.org.br${href}`;
          return { titulo: a.textContent?.trim().substring(0, 200) || '', url };
        })
        .filter(e => {
          if (seen.has(e.url)) return false;
          seen.add(e.url);
          return true;
        });
    });

    console.log(`  ${items.length} chamadas recentes encontradas`);
    editais.push(...items);
  } catch (e) {
    console.error('  Erro EMBRAPII:', e.message);
  }

  return editais;
}

// === Main ===
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  let novos = 0;
  let erros = 0;

  // Collect from all sources
  const [cnpqEditais, embrapiiEditais] = await Promise.all([
    coletarCNPq(page),
    coletarEMBRAPII(await context.newPage()),
  ]);

  const allEditais = [
    ...cnpqEditais.map(e => ({ ...e, orgao: 'CNPq', fonte: 'CNPq' })),
    ...embrapiiEditais.map(e => ({ ...e, orgao: 'EMBRAPII', fonte: 'EMBRAPII' })),
  ];

  console.log(`\nTotal coletado: ${allEditais.length} (CNPq: ${cnpqEditais.length}, EMBRAPII: ${embrapiiEditais.length})`);

  await browser.close();

  // Save to Supabase
  for (const edital of allEditais) {
    if (!edital.url || !edital.titulo) continue;

    const { data: existente } = await supabase
      .from('editais')
      .select('id')
      .eq('url_original', edital.url)
      .single();

    if (!existente) {
      // Get fonte_id
      const { data: fonte } = await supabase
        .from('fontes')
        .select('id')
        .eq('nome', edital.fonte)
        .single();

      const { error } = await supabase.from('editais').insert({
        fonte_id: fonte?.id,
        titulo: edital.titulo,
        url_original: edital.url,
        orgao: edital.orgao,
        status: 'ativo',
      });

      if (!error) {
        novos++;
        console.log(`+ [${edital.orgao}] ${edital.titulo}`);
      } else {
        erros++;
        console.error(`  Erro: ${error.message}`);
      }
    }
  }

  // Update fontes timestamps
  for (const nome of ['CNPq', 'EMBRAPII']) {
    const count = allEditais.filter(e => e.fonte === nome).length;
    if (count > 0) {
      await supabase
        .from('fontes')
        .update({ ultima_coleta: new Date().toISOString(), total_coletados: count })
        .eq('nome', nome);
    }
  }

  console.log(`\nResultado: ${allEditais.length} coletados, ${novos} novos, ${erros} erros`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
