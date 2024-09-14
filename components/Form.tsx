"use client";
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const poppins = Poppins({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});
export default function Form() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState<string>("");
  const [supply, setSupply] = useState<string>("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [revokeMintAuthority, setRevokeMintAuthority] = useState(false);
  const [revokeUpdateAuthority, setRevokeUpdateAuthority] = useState(false);
  const [revokeFreezeAuthority, setRevokeFreezeAuthority] = useState(false);
  const [loading, setLoading] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const createToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      console.error("No wallet connected!");
      toast.error("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const mintKeyPair = Keypair.generate();

      const metaData = {
        mint: mintKeyPair.publicKey,
        name: name,
        symbol: symbol,
        uri: metadataUrl,
        description: "",
        additionalMetadata: [],
      };

      // console.log("metadata:", metaData);

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      // console.log("mintlen:", mintLen);

      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metaData).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      console.log("lamp:", lamports);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeyPair.publicKey,
          space: mintLen,
          lamports: lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),

        createInitializeMetadataPointerInstruction(
          mintKeyPair.publicKey,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),

        createInitializeMintInstruction(
          mintKeyPair.publicKey,
          parseFloat(decimals),
          wallet.publicKey,
          revokeFreezeAuthority ? null : wallet.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),

        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeyPair.publicKey,
          metadata: mintKeyPair.publicKey,
          name: metaData.name,
          symbol: metaData.symbol,
          uri: metaData.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeyPair);

      // console.log(transaction);
      try {
        const signature = await wallet.sendTransaction(transaction, connection);
        console.log("Transaction successful with signature:", signature);
        toast.success("Mint created");
      } catch (error) {
        console.log(error);
        toast.error("Mint creation failed");
      }

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeyPair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      console.log(associatedToken.toBase58());

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction2, connection);

      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeyPair.publicKey,
          associatedToken,
          wallet.publicKey,
          parseFloat(supply) * 10 ** parseFloat(decimals),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      try {
        await wallet.sendTransaction(transaction3, connection);
        toast.success("Supply minted to ATA");
      } catch (err) {
        toast.error("Failed to mint supply");
      }

      if (revokeMintAuthority === true) {
        const transaction4 = new Transaction().add(
          createSetAuthorityInstruction(
            mintKeyPair.publicKey,
            wallet.publicKey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_2022_PROGRAM_ID
          )
        );
        try {
          await wallet.sendTransaction(transaction4, connection);
          toast.success("Mint authority Revoked");
        } catch (err) {
          toast.error("Could't revoke mint Authority");
        }
        console.log("Mint authority revoked!");
      }

      if (revokeUpdateAuthority === true) {
        const transaction5 = new Transaction().add(
          createSetAuthorityInstruction(
            mintKeyPair.publicKey,
            wallet.publicKey,
            AuthorityType.AccountOwner,
            null,
            [],
            TOKEN_2022_PROGRAM_ID
          )
        );

        try {
          await wallet.sendTransaction(transaction5, connection);
          toast.success("Update authority Revoked");
          // console.log("Update authority revoked!");
        } catch (err) {
          toast.error("Could't revoke update Authority");
        }
      }
      setLoading(false);
      toast.success(`You just created your own Token`);
    } catch (err) {
      console.error("Error in creating token: ", err);
      setLoading(false);
      toast.error("Unexpected error occured");
    }
  };

  useEffect(() => {
    if (revokeMintAuthority === true) {
      toast.error("You can't update the Mint authority after creating");
    }
  }, [revokeMintAuthority]);

  useEffect(() => {
    if (revokeFreezeAuthority === true) {
      toast.error("You can't update the Freeze authority after creating");
    }
  }, [revokeFreezeAuthority]);

  useEffect(() => {
    if (revokeUpdateAuthority === true) {
      toast.error("You can't update the Update authority after creating");
    }
  }, [revokeUpdateAuthority]);

  if (!wallet.connected) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-xl text-gray-700">
          Please connect your Wallet to move on !
        </p>
      </div>
    );
  }

  return (
    <form
      className=" w-full h-fit flex justify-center items-center pb-10"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        createToken(e);
      }}
    >
      <div className="w-full flex flex-wrap items-center justify-center md:gap-5 gap-1">
        <div className="md:w-2/6 w-5/6">
          <label className="text-gray-500">
            <span className="text-red-600">*</span>Name
          </label>
          <input
            type="text"
            className="w-full border outline-none rounded-lg h-10 px-3 py-5"
            placeholder="Enter a name for your token"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="md:w-2/6 w-5/6">
          <label className="text-gray-500">
            <span className="text-red-600">*</span>Symbol
          </label>
          <input
            type="text"
            className="w-full border outline-none rounded-lg h-10 px-3 py-5"
            placeholder="Enter symbol for your token"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>
        <div className="md:w-2/6 w-5/6">
          <label className="text-gray-500">
            <span className="text-red-600">*</span>Decimals
          </label>
          <input
            type="text"
            className="w-full border outline-none rounded-lg h-10 px-3 py-5"
            placeholder="Enter decimals for your token (0-9)"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
          />
        </div>
        <div className="md:w-2/6 w-5/6">
          <label className="text-gray-500">
            <span className="text-red-600">*</span>Supply
          </label>
          <input
            type="text"
            className="w-full border outline-none rounded-lg h-10 px-3 py-5"
            placeholder="Enter supply"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
          />
        </div>
        <div className="md:w-2/6 w-5/6">
          <label className="text-gray-500">
            <span className="text-red-600">*</span>Metadata
          </label>
          <input
            type="text"
            className="w-full border outline-none rounded-lg h-10 px-3 py-5"
            placeholder="Enter Metadata url"
            value={metadataUrl}
            onChange={(e) => setMetadataUrl(e.target.value)}
          />
        </div>
        <div className="w-full flex md:flex-row flex-col items-center justify-center py-5">
          <label className="inline-flex md:w-1/6 w-5/6 justify-between items-center cursor-pointer mx-5 md:my-0 my-1">
            <span className="ms-3 text-sm font-medium text-gray-900  mr-1">
              Revoke Mint authority{" "}
            </span>
            <input
              type="checkbox"
              checked={revokeMintAuthority}
              onChange={(e) => setRevokeMintAuthority(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <label className="inline-flex md:w-1/6 w-5/6 justify-between items-center cursor-pointer mx-5 md:my-0 my-1">
            <span className="ms-3 text-sm font-medium text-gray-900 mr-1 ">
              Revoke Freeze authority{" "}
            </span>
            <input
              type="checkbox"
              checked={revokeFreezeAuthority}
              onChange={(e) => setRevokeFreezeAuthority(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <label className="inline-flex md:w-1/6 w-5/6 justify-between items-center cursor-pointer mx-5 md:my-0 my-1">
            <span className="ms-3 text-sm font-medium text-gray-900 mr-1 ">
              Revoke Update authority{" "}
            </span>
            <input
              type="checkbox"
              checked={revokeUpdateAuthority}
              onChange={(e) => setRevokeUpdateAuthority(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <button
          className={` ${poppins.className} px-4 py-3 bg-[#252525] hover:bg-[#000] transition duration-200 ease-in-out text-white rounded-xl font-semibold border border-black `}
          type="submit"
        >
          {loading ? "Loading.." : "Create Token"}
        </button>
      </div>
    </form>
  );
}
