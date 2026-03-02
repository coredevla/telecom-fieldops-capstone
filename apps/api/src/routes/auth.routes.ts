import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { authService } from '../domain/services/auth.service';
import { oauthService } from '../domain/services/oauth.service';
import { logger } from '../infra/logger/logger';
import { loginRateLimit } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export function authRouter() {
  const router = Router();

  router.post('/login', loginRateLimit, validateBody(loginSchema), async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const useAuth0PasswordLogin = env.oauth.auth0.passwordGrantEnabled && env.nodeEnv !== 'test';
      const response = useAuth0PasswordLogin
        ? await authService.loginWithTrustedEmail(
            await oauthService.authenticateWithPassword(email, password),
            'Auth0',
            req.correlationId,
          )
        : await authService.login(email, password, req.correlationId);

      logger.info('User logged in', {
        correlationId: req.correlationId,
        userId: response.user.id,
        action: 'USERLOGIN',
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', validateBody(refreshSchema), async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const response = await authService.refresh(refreshToken);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', validateBody(refreshSchema), async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken, req.user?.id ?? null, req.correlationId);

      logger.info('User logged out', {
        correlationId: req.correlationId,
        userId: req.user?.id,
        action: 'USERLOGOUT',
      });

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

const router = authRouter();

export default router;
