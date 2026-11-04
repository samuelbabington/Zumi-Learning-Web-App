import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme/theme-script";

export const metadata: Metadata = {
  title: "Zumi — Learn. Compete. Grow Together.",
  description: "AI-powered gamified learning ecosystem for students. Upload notes, generate flashcards, play games, challenge friends, and track your progress.",
  keywords: ["learning", "study", "flashcards", "quiz", "games", "AI", "education"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
