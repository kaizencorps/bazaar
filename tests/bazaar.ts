import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Bazaar } from "../target/types/bazaar";

describe("bazaar", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Bazaar as Program<Bazaar>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
