"use client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Form from "@/components/Form";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});
export default function Home() {
  const network = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Navbar />
          <Hero />
          <Form />
          <Toaster />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
