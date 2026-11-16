/**
 * LTI 1.3 – chaves públicas da ferramenta (Keyset URL).
 * A ferramenta só recebe pedidos do Moodle (não assina mensagens),
 * por isso o conjunto de chaves está vazio.
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(JSON.stringify({ keys: [] }));
}
