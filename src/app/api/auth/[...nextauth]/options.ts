import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
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
    }),
    // 只有在配置了GitHub OAuth时才添加GitHub Provider
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : [])
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHub OAuth 登录处理
      if (account?.provider === "github" && user.email) {
        try {
          // 检查用户是否已存在
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // 如果用户不存在，创建新用户
          if (!dbUser) {
            // 检查是否是第一个用户（自动设为管理员）
            const userCount = await prisma.user.count();
            const isFirstUser = userCount === 0;

            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "GitHub用户",
                password: "", // GitHub用户不需要密码
                role: isFirstUser ? "admin" : "user",
                hasLifetimeAccess: isFirstUser
              }
            });
          }

          // 更新用户信息到user对象
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).hasLifetimeAccess = dbUser.hasLifetimeAccess;

          return true;
        } catch (error) {
          console.error("GitHub OAuth 登录错误:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      // 添加用户 ID、角色和终身访问权限到 session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.hasLifetimeAccess = token.hasLifetimeAccess;
      }
      return session;
    },
    async jwt({ token, user, account }) {
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