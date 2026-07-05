import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/workouts",
    label: "Workouts",
  },
  {
    href: "/templates",
    label: "Templates",
  },
  {
    href: "/nutrition",
    label: "Nutrition",
  },
  {
    href: "/weight",
    label: "Weight",
  },
  {
    href: "/recovery",
    label: "Recovery",
  },
];

export const metadata: Metadata = {
  title: "Well",
  description: "Evidence-based hypertrophy training dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-white">
        <div className="flex min-h-screen flex-col md:flex-row">
          <header className="border-b border-zinc-800 bg-zinc-950 px-5 py-4 md:hidden">
            <Link href="/dashboard" className="text-xl font-bold">
              Well
            </Link>

            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-6 md:block">
            <Link href="/dashboard" className="text-xl font-bold">
              Well
            </Link>

            <nav className="mt-8 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}