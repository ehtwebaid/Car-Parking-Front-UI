// src/app/tokens/jwt-token.token.ts
import { InjectionToken } from '@angular/core';

export const JWT_TOKEN = new InjectionToken<string>('auth_token');
export const COOKIE_TOKEN = new InjectionToken<string>('cookie_token');
