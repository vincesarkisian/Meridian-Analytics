// Base CSS for the Radix components, then the WorkOS widgets, then our brand layer.
import "@radix-ui/themes/styles.css";
import "@workos-inc/widgets/styles.css";
import "./brand.css";

import type { Metadata } from "next";
import NextLink from "next/link";
import { Theme } from "@radix-ui/themes";
import { Footer } from "./components/footer";
import { SignInButton } from "./components/sign-in-button";
import { MeridianLockup } from "./components/logo";
import {
  AuthKitProvider,
  Impersonation,
} from "@workos-inc/authkit-nextjs/components";

export const metadata: Metadata = {
  title: "Meridian Analytics",
  description:
    "Governed analytics. Answers you can hand to an examiner. Multi-tenant demo on WorkOS AuthKit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Theme
          appearance="dark"
          accentColor="jade"
          grayColor="sage"
          panelBackground="solid"
          radius="medium"
          style={{ background: "var(--ink-900)", minHeight: "100vh" }}
        >
          <AuthKitProvider>
            <Impersonation />

            <header className="app-nav">
              <div className="app-nav-inner">
                <NextLink href="/" aria-label="Meridian Analytics home">
                  <MeridianLockup />
                </NextLink>

                <nav className="nav-links" style={{ marginLeft: 12 }}>
                  <NextLink className="nav-link" href="/">
                    Overview
                  </NextLink>
                  <NextLink className="nav-link" href="/members">
                    Members
                  </NextLink>
                  <NextLink className="nav-link" href="/account">
                    Account
                  </NextLink>
                </nav>

                <div style={{ marginLeft: "auto" }}>
                  <SignInButton />
                </div>
              </div>
            </header>

            <main className="container">{children}</main>

            <Footer />
          </AuthKitProvider>
        </Theme>
      </body>
    </html>
  );
}
