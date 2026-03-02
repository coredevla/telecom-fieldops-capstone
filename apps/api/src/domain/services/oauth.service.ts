import { env } from '../../config/env';
import { ApiError } from '../errors/apiError';

interface Auth0TokenResponse {
  access_token?: string;
}

interface Auth0UserInfo {
  email?: string;
  email_verified?: boolean;
}

const normalizeDomain = (domain: string): string => {
  const trimmed = domain.trim();
  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const assertAuth0Configured = (): void => {
  if (!env.oauth.auth0.domain || !env.oauth.auth0.clientId || !env.oauth.auth0.clientSecret) {
    throw new ApiError(
      503,
      'Service Unavailable',
      'Auth0 login is not configured on the server.',
      'urn:telecom:error:oauth-not-configured',
    );
  }
};
const buildAuth0Urls = (): { tokenUrl: string; userInfoUrl: string } => {
  const domain = normalizeDomain(env.oauth.auth0.domain);
  if (!domain) {
    throw new ApiError(
      503,
      'Service Unavailable',
      'Auth0 domain is invalid.',
      'urn:telecom:error:oauth-not-configured',
    );
  }

  return {
    tokenUrl: `${domain}/oauth/token`,
    userInfoUrl: `${domain}/userinfo`,
  };
};

const authenticateAuth0Password = async (email: string, password: string): Promise<string> => {
  const { tokenUrl } = buildAuth0Urls();
  const useRealmGrant = env.oauth.auth0.connection.trim().length > 0;

  const body: Record<string, string> = {
    client_id: env.oauth.auth0.clientId,
    client_secret: env.oauth.auth0.clientSecret,
    scope: env.oauth.auth0.scope,
  };

  if (env.oauth.auth0.audience) {
    body.audience = env.oauth.auth0.audience;
  }

  if (useRealmGrant) {
    body.grant_type = 'http://auth0.com/oauth/grant-type/password-realm';
    body.realm = env.oauth.auth0.connection;
    body.username = email;
    body.password = password;
  } else {
    body.grant_type = 'password';
    body.username = email;
    body.password = password;
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(
      401,
      'Unauthorized',
      'Invalid email or password.',
      'urn:telecom:error:invalid-credentials',
    );
  }

  const payload = (await response.json()) as Auth0TokenResponse;
  if (!payload.access_token) {
    throw new ApiError(
      401,
      'Unauthorized',
      'Invalid email or password.',
      'urn:telecom:error:invalid-credentials',
    );
  }

  return fetchAuth0Email(payload.access_token);
};

const fetchAuth0Email = async (accessToken: string): Promise<string> => {
  const { userInfoUrl } = buildAuth0Urls();
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      401,
      'Unauthorized',
      'Failed to read Auth0 profile.',
      'urn:telecom:error:oauth-userinfo-failed',
    );
  }

  const profile = (await response.json()) as Auth0UserInfo;
  if (!profile.email || profile.email_verified === false) {
    throw new ApiError(
      401,
      'Unauthorized',
      'Auth0 account email is missing or not verified.',
      'urn:telecom:error:oauth-email-unverified',
    );
  }

  return profile.email.toLowerCase();
};

export const oauthService = {
  async authenticateWithPassword(email: string, password: string): Promise<string> {
    assertAuth0Configured();
    if (!env.oauth.auth0.passwordGrantEnabled) {
      throw new ApiError(
        503,
        'Service Unavailable',
        'Auth0 password login is not enabled.',
        'urn:telecom:error:oauth-not-configured',
      );
    }

    return authenticateAuth0Password(email, password);
  },
};
