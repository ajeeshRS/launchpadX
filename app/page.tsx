"use client";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import Hero from "@/components/Hero";
import Form from "@/components/Form";
import { Poppins } from "next/font/google";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import Navbar from "@/components/Navbar";

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
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
