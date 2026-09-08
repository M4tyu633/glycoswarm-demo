import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlycoSwarm — preserved demonstration",
  description: "Explore GlycoSwarm's four specialist contracts, sample laboratory panels, and evidence convergence. Deterministic demo; no live clinical inference.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
