import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});
export default function Hero() {
  return (
    <main
      className={`${poppins.className} w-full h-fit flex flex-col items-center text-black py-5`}
    >
      <h1 className="font-bold md:text-3xl text-xl text-[#313131]">
        Solana token launchPad
      </h1>
      <p className="text-slate-500 text-xs py-3">Create your own spl token with ease.</p>
    </main>
  );
}
