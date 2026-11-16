/**
 * LTI 1.3 – passo 2: o Moodle envia o id_token assinado.
 * Valida-o, cria o curso e o formando na base de dados (se necessário)
 * e abre a aplicação já com a sessão iniciada.
 */
import { b64url, errorPage, issuerAllowed, moodleJwksUrl, readState, syncToDatabase, userFromClaims, verifyIdToken } from './_common.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return errorPage(res, 'Abra esta atividade a partir do Moodle.');
    const { id_token, state } = req.body || {};
    const st = readState(state);
    if (!issuerAllowed(st.iss)) throw new Error('Este Moodle não está autorizado.');

    const claims = await verifyIdToken(id_token, { jwksUrl: moodleJwksUrl(st.iss), nonce: st.nonce });
    if (claims.iss !== st.iss) throw new Error('Origem do pedido não corresponde.');
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (st.client_id && !aud.includes(st.client_id)) throw new Error('client_id não corresponde.');

    const user = userFromClaims(claims);
    await syncToDatabase(user);

    const session = b64url(JSON.stringify({ ...user, exp: Date.now() + 5 * 60 * 1000 }));
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(303, `/?lti=${session}`);
  } catch (e) {
    console.error('[LTI] erro no launch:', e);
    errorPage(res, e.message || 'Erro desconhecido');
  }
}
