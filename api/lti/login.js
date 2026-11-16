/**
 * LTI 1.3 – passo 1: o Moodle pede para iniciar sessão (OIDC login initiation).
 * Responde com um redirecionamento para o Moodle confirmar quem é o utilizador.
 */
import crypto from 'node:crypto';
import { errorPage, issuerAllowed, makeState, moodleAuthUrl } from './_common.js';

export default function handler(req, res) {
  const p = { ...(req.query || {}), ...(typeof req.body === 'object' ? req.body || {} : {}) };
  const { iss, login_hint, target_link_uri, lti_message_hint, client_id, lti_deployment_id } = p;

  if (!iss || !login_hint) return errorPage(res, 'Faltam dados do Moodle (iss / login_hint).');
  if (!issuerAllowed(iss)) return errorPage(res, 'Este Moodle não está autorizado.');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `https://${host}/api/lti/launch`;
  const nonce = crypto.randomBytes(16).toString('hex');
  const state = makeState({ nonce, iss, client_id });

  const params = new URLSearchParams({
    scope: 'openid',
    response_type: 'id_token',
    response_mode: 'form_post',
    prompt: 'none',
    client_id: client_id || '',
    redirect_uri: redirectUri,
    login_hint,
    state,
    nonce,
  });
  if (lti_message_hint) params.set('lti_message_hint', lti_message_hint);
  if (lti_deployment_id) params.set('lti_deployment_id', lti_deployment_id);
  void target_link_uri;

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `${moodleAuthUrl(iss)}?${params}`);
}
