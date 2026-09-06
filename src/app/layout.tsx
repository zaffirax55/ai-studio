import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: "Предмет — AI-студия товаров",
  description:
    "Фотографии и карточки товаров для маркетплейсов. Подготовительный этап проекта.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
