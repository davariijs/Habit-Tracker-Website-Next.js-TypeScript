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
      clientSecret: process.env.GITHUB_SECRET ?? '',
      httpOptions: {
        timeout: 5000,  // Reduced from 10000 to 5000
        agent: undefined,
      },
    }),
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          await connectMongo();
          const { email, password } = credentials ?? {};
          if (!email || !password) {
            throw new Error('Invalid email or password.');
          }

          const user = await User.findOne({ email }).select('+password').lean();
          if (!user) {
            throw new Error('User not found.');
          }

          if (user && typeof user === 'object' && 'password' in user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
          } else {
            throw new Error('Invalid credentials.');
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid credentials.');
          }

          return {
            id: (user as { _id: string })._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw error;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
        };
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' || account?.provider === 'github') {
          await connectMongo();
          
          // Use more efficient findOneAndUpdate to check and create in one operation
          await User.findOneAndUpdate(
            { email: user.email },
            { 
              $setOnInsert: {
                name: user.name,
                email: user.email,
                password: null
              }
            },
            { 
              upsert: true, 
              new: true,
              lean: true, // Return plain JavaScript object instead of Mongoose document
              maxTimeMS: 3000 // Set maximum operation time to 3 seconds
            }
          );
          
          return true;
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export default authConfig;