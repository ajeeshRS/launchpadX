import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});
export default function Navbar() {
  const wallet = useWallet();
  return (
    <nav
      className={`${poppins.className} md:w-4/6 w-full h-20 md:mx-10 mx-4 rounded-full shadow-md flex items-center justify-between md:px-10 px-8 my-5`}
    >
      <p className="text-[#020202] font-bold md:text-3xl text-xl bg-gradient-to-l from-[#02C3F5] via-[#6F4DDB] to-[#EF5AB3] inline-block text-transparent bg-clip-text">
        LaunchpadX
      </p>
      <WalletMultiButton
        style={{
          background: "white",
          border: "2px solid #cecece",
          borderRadius: "15px",
          color: "#020202",
          fontSize: "13px",
        }}
      >{`${
        wallet.publicKey ? "Connected" : "Connect wallet"
      }`}</WalletMultiButton>
    </nav>
  );
}
