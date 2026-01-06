import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { Nav } from "@/components/layout/nav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Nav />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
