"use client";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import Hero from "@/components/Hero";
import Form from "@/components/Form";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import Navbar from "@/components/Navbar";


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
