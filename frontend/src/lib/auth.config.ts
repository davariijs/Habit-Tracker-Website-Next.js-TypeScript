import type { NextAuthOptions } from "next-auth";
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import connectMongo from '../utils/db';


const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: 'consent',
          response_type: 'code'
        }
      }
        }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        await connectMongo();
        const { email, password } = credentials ?? {};
        if (!email || !password) {
          throw new Error('Invalid email or password.');
        }

        // Find user in MongoDB
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found.');
        }

        // Validate password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid credentials.');
        }

        // Return user data
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log('JWT Callback:', { token, user, account, profile });
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (account) {
        console.log("Account:", account);
      }
      console.log("Token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token });
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
        };
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectMongo();
  
        // Check if user already exists
        let existingUser = await User.findOne({ email: user.email });
  
        // If not, create a new user
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            password: null, // Google users don't have a password
          });
        }
  
        return true;
      }
      if (account?.provider === 'github') {
        await connectMongo();
  
        // Check if user already exists
        let existingUser = await User.findOne({ email: user.email });
  
        // If not, create a new user
        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            password: null
          });
        }
  
        return true;
      }
      return true;
    }
  },
  pages: {
    signIn: '/' //sigin page
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
};

export default authConfig;
