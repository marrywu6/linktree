import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";

// 扩展 Session 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasLifetimeAccess: boolean;
    } & DefaultSession["user"]
  }
  
  interface User {
    role: string;
    hasLifetimeAccess: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    hasLifetimeAccess: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "QmJBzzN86SFfUw4MNRg6e3AngucQZhjMP/sOfvqeP6M=",
  providers: [
    CredentialsProvider({
      name: "Email Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        // 如果用户不存在或密码不匹配
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          throw new Error("Email or password is incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasLifetimeAccess: user.hasLifetimeAccess
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // 添加用户 ID、角色和终身访问权限到 session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.hasLifetimeAccess = token.hasLifetimeAccess;
      }
      return session;
    },
    async jwt({ token, user }) {
      // 首次登录时，将用户信息添加到 JWT
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.hasLifetimeAccess = (user as any).hasLifetimeAccess;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  }
};