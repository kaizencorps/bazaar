import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Bazaar } from "../target/types/bazaar";
const { SystemProgram } = anchor.web3;


describe("bazaar", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Bazaar as Program<Bazaar>;

  const domainName = "test";

  // our domain account
  const [domainPda, domainPdaBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(domainName)),
        Buffer.from(anchor.utils.bytes.utf8.encode("bazaar")),
      ],
      program.programId
  );

  it("initializes a domain", async () => {
    // Add your test here.
    const tx = await program.methods.createDomain(domainName).accounts({
        domain: domainPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
    }).rpc();
    console.log("Your transaction signature", tx);
  });

    it("loads a domain", async () => {
        // Add your test here.
        const tx = await program.methods.loadDomain().accounts({
            domain: domainPda,
            authority: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();
        console.log("Your load domain transaction signature", tx);
    });


});
