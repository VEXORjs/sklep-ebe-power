import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    // Rozszerzenie interfejsu User (używanego przy logowaniu i w JWT)
    interface User extends DefaultUser {
        id?: string;
        token?: string;
    }

    // Rozszerzenie obiektu Session (dostępnego w useSession/getSession)
    interface Session {
        user: {
            id?: string;
        } & DefaultSession["user"];
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    // Rozszerzenie tokena JWT przekazywanego w callbackach
    interface JWT {
        id?: string;
        springToken?: string;
    }
}