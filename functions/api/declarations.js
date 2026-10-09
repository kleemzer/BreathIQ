// Cloudflare Pages Function — agrégat anonymisé des déclarations (lecture publique).
// Aucune déclaration individuelle n'est exposée : comptes par semaine × région × pathologie,
// cellules < K_ANONYMITY supprimées. Cache 5 minutes.
import { aggregateDeclarations } from '../_lib/decl-schema.js';

export async function onRequestGet({ env }) {
  if (!env.DECL) {
    return new Response(JSON.stringify({ available: false, reason: 'storage_not_configured', cells: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  const decls = [];
  let cursor;
  do {
    const page = await env.DECL.list({ prefix: 'decl:', cursor, limit: 1000 });
    const values = await Promise.all(page.keys.map(k => env.DECL.get(k.name)));
    for (const v of values) { if (v) { try { decls.push(JSON.parse(v)); } catch { /* ignoré */ } } }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  const agg = aggregateDeclarations(decls);
  return new Response(JSON.stringify({ available: true, generatedAt: new Date().toISOString(), ...agg }), {
    status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  });
}
