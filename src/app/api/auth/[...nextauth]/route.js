import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// 🔥 REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS
const ADMIN_EMAIL = 'momentumgroups2506@gmail.com'; 

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              password: 'google_oauth_placeholder',
              image: user.image,
              role: user.email === ADMIN_EMAIL ? 'admin' : 'student' // 🔥 Auto-promote on creation
            });
          } else {
            // 🔥 Auto-promote existing user if email matches
            if (user.email === ADMIN_EMAIL && dbUser.role !== 'admin') {
              await User.updateOne({ email: user.email }, { $set: { role: 'admin' } });
              dbUser.role = 'admin';
            }
          }
          
          user.id = dbUser._id.toString();
          user.name = dbUser.name;
          user.role = dbUser.role; // 🔥 Pass role to NextAuth
          return true;
        } catch (error) {
          console.error('Google Sign In DB Error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role; // 🔥 Save role to JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role; // 🔥 Make role available in frontend session
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };