import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const handlers = NextAuth(authConfig);
export { signOut, signIn } from 'next-auth/react';