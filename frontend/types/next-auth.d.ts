import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add the `id` property
    } & DefaultSession['user']; // Merge with the default `name`, `email`, `image` properties
  }

  interface CredentialsInputs {
    email: string;
    password: string;
  }
}