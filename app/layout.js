import { Inter } from 'next/font/google';
import './globals.css';
import ThemeRegistry from './ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "AI Recipe Generator",
  description: "Generate recipes using AI based on your ingredients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
