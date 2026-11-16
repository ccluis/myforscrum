/**
 * Funções comuns da ligação LTI 1.3 (Moodle → MyforScrum).
 * Corre no servidor (Vercel Functions), não no browser.
 */
import crypto from 'node:crypto';

export const SUPABASE_URL = 'https://malixbxxfqzzszvjyrla.supabase.co';
// Chave pública (anon) do Supabase — a mesma que a aplicação usa no browser.
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbGl4Ynh4ZnF6enN6dmp5cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTIwNjIsImV4cCI6MjA5NDY2ODA2Mn0.zF2DcL_WfSz76s9HG_9G-mzHWNW-zCnekdUc1oRR0Es';

// Segredo para assinar o "state". Pode ser definido no Vercel (LTI_SECRET);
// sem ele usa-se um valor fixo (aceitável para um protótipo).
const SECRET = process.env.LTI_SECRET || 'myforscrum-prototipo-lti';

/** Moodles autorizados (opcional): LTI_ALLOWED_ISSUERS="https://moodle.uc.pt,https://..." */
export function issuerAllowed(iss) {
  const list = (process.env.LTI_ALLOWED_ISSUERS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.length === 0 || list.includes(iss);
}

export const b64url = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

/** Cria um "state" assinado que guarda o nonce e o Moodle de origem (sem cookies). */
export function makeState(payload) {
  const body = b64url(JSON.stringify({ ...payload, t: Date.now() }));
  return `${body}.${hmac(body)}`;
}

/** Lê e valida o "state" (assinatura e validade de 10 minutos). */
export function readState(state) {
  const [body, sig] = String(state || '').split('.');
  if (!body || !sig) throw new Error('Pedido LTI sem state');
  const expected = hmac(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    throw new Error('State LTI inválido');
  const data = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (Date.now() - data.t > 10 * 60 * 1000) throw new Error('Pedido LTI expirado');
  return data;
}

/** Endereços padrão de um Moodle a partir do seu endereço (iss). */
export const moodleAuthUrl = (iss) => `${iss.replace(/\/$/, '')}/mod/lti/auth.php`;
export const moodleJwksUrl = (iss) => `${iss.replace(/\/$/, '')}/mod/lti/certs.php`;

/** Valida o id_token (JWT RS256) enviado pelo Moodle e devolve os dados (claims). */
export async function verifyIdToken(idToken, { jwksUrl, nonce, fetchImpl = fetch }) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new Error('id_token mal formado');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (header.alg !== 'RS256') throw new Error('Algoritmo não suportado: ' + header.alg);

  const jwks = await fetchImpl(jwksUrl).then((r) => {
    if (!r.ok) throw new Error('Não foi possível obter as chaves do Moodle');
    return r.json();
  });
  const jwk = (jwks.keys || []).find((k) => !header.kid || k.kid === header.kid);
  if (!jwk) throw new Error('Chave do Moodle não encontrada');
  const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const ok = crypto.verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'));
  if (!ok) throw new Error('Assinatura do Moodle inválida');

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now - 60) throw new Error('id_token expirado');
  if (nonce && claims.nonce !== nonce) throw new Error('nonce inválido');
  return claims;
}

const LTI = 'https://purl.imsglobal.org/spec/lti/claim/';

/** Converte os dados do Moodle no utilizador da aplicação. */
export function userFromClaims(claims) {
  const roles = claims[LTI + 'roles'] || [];
  const isTeacher = roles.some((r) => /#(Instructor|Administrator|ContentDeveloper|Mentor)$|membership#Instructor|system\/person#Administrator/.test(r));
  const context = claims[LTI + 'context'] || {};
  const name = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(' ') || 'Utilizador Moodle';
  const short = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
  return {
    role: isTeacher ? 'formador' : 'formando',
    name,
    email: claims.email || '',
    studentId: `moodle_${short(`${claims.iss}|${claims.sub}`)}`,
    courseId: context.id ? `moodle_${short(`${claims.iss}|${context.id}`)}` : '',
    courseName: context.title || context.label || 'Curso Moodle',
  };
}

/** Pedido REST ao Supabase (inserir sem duplicar). */
async function upsert(table, row, fetchImpl) {
  const res = await fetchImpl(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal,resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase (${table}): ${res.status} ${await res.text()}`);
}

/** Cria o curso e o formando na base de dados, se ainda não existirem. */
export async function syncToDatabase(user, fetchImpl = fetch) {
  if (!user.courseId) return;
  await upsert('courses', { id: user.courseId, name: user.courseName, description: 'Curso ligado ao Moodle (LTI)' }, fetchImpl);
  if (user.role === 'formando') {
    await upsert('students', { id: user.studentId, name: user.name, email: user.email, course_id: user.courseId }, fetchImpl);
  }
}

/** Página de erro simples, em português. */
export function errorPage(res, message) {
  res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html><html lang="pt"><meta charset="utf-8"><title>MyforScrum – erro LTI</title>
<body style="font-family:system-ui;max-width:560px;margin:40px auto;padding:0 16px">
<h1 style="font-size:1.25rem">Não foi possível entrar a partir do Moodle</h1>
<p>${String(message).replace(/[<>&]/g, '')}</p>
<p>Peça ao administrador do Moodle para confirmar a configuração da ferramenta externa.</p></body></html>`);
}
