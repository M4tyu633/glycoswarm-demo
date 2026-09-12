import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

const sans = IBM_Plex_Sans({subsets:['latin'],weight:['400','500','600'],variable:'--font-plex-ui',display:'swap'});
const mono = IBM_Plex_Mono({subsets:['latin'],weight:['400'],variable:'--font-plex-data',display:'swap'});

export const metadata: Metadata = {
  title: "GlycoSwarm — preserved demonstration",
  description: "Explore GlycoSwarm's four specialist contracts, sample laboratory panels, and evidence convergence. Deterministic demo; no live clinical inference.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
