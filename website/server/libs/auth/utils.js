import nconf from 'nconf';
import shortid from 'short-uuid';
import url from 'url';

import { NotAuthorized } from '../errors';

export const RESTRICTED_EMAIL_DOMAINS = Object.freeze(['habitica.com', 'habitrpg.com']);
const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS_COMMUNITY_MANAGER_EMAIL');
const translator = shortid('0123456789abcdefghijklmnopqrstuvwxyz');

export function generateUsername () {
  const newName = `hb-${translator.new()}`;
  return newName.substring(0, 20);
}

export function loginRes (user, req, res) {
  if (user.auth.blocked) {
    throw new NotAuthorized(res.t(
      'accountSuspended',
      {
        communityManagerEmail: COMMUNITY_MANAGER_EMAIL,
        userId: user._id,
        username: user.auth.local.username,
      },
    ));
  }
  const urlPath = url.parse(req.url).pathname;
  if (req.headers['x-client'] === 'habitica-android' && urlPath.includes('apple')) {
    // This is a workaround for android not being able to handle sign in with apple better.
    return res.redirect(`/?id=${user._id}&key=${user.apiToken}&newUser=${user.newUser || false}`);
  }

  const responseData = {
    id: user._id,
    apiToken: user.apiToken,
    newUser: user.newUser || false,
    username: user.auth.local.username,
  };
  return res.respond(200, responseData);
}

export function isRestrictedEmailDomain (email) {
  if (!email) return false;
  const domain = email.toLowerCase().split('@')[1];
  return RESTRICTED_EMAIL_DOMAINS.includes(domain);
}
