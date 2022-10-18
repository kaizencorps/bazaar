import * as anchor from "@project-serum/anchor";
import {AnchorProvider, Program, Wallet} from "@project-serum/anchor";
import { Bazaar } from "../target/types/bazaar";
import {Keypair} from "@solana/web3.js";
import * as assert from "assert";

const { SystemProgram } = anchor.web3;


describe("bazaar", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Bazaar as Program<Bazaar>;

    // the 2nd key to put on the keychain
    const key2 = anchor.web3.Keypair.generate();

    // wallet 2 provider (simulate separate connection)
    const provider2 = new AnchorProvider(
        provider.connection,
        new Wallet(key2),
        {}
    );
    const program2 = new Program(program.idl, program.programId, provider2);

    it('sets up the test', async () => {
        // airdrop some sol to the 2nd key's wallet
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(key2.publicKey, anchor.web3.LAMPORTS_PER_SOL * 0.5),
            "confirmed"
        );
    });


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

  const wallet = new Keypair();

    it("loads a domain properly", async () => {

        // since this is an admin call, the authority must == domainpda.authority
        let tx = await program.methods.loadDomain(true).accounts({
            domain: domainPda,
            authority: provider.wallet.publicKey,
            wallet: wallet.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();
        console.log("Your load domain transaction signature", tx);

        try {
            // this won't work cause signer/authority is NOT the domain pda authority even though admin flag = true
            await program2.methods.loadDomain(true).accounts({
                domain: domainPda,
                authority: provider2.wallet.publicKey,
                wallet: wallet.publicKey,
                systemProgram: SystemProgram.programId
            }).rpc();
            assert.fail("shouldn't be able to call admin w/o domain admin set as authority");
        } catch (err) {
            console.log(`caught expected exception: ${err}`);
            // expected
        }

        // this will work since signer (authority) = wallet
        tx = await program2.methods.loadDomain(false).accounts({
            domain: domainPda,
            authority: provider2.wallet.publicKey,
            wallet: provider2.wallet.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();
        console.log("Your non-admin load domain transaction signature", tx);


        try {
            // this won't work since signer != wallet
            await program2.methods.loadDomain(false).accounts({
                domain: domainPda,
                authority: provider2.wallet.publicKey,
                wallet: wallet.publicKey,
                systemProgram: SystemProgram.programId
            }).rpc();
            assert.fail("shouldn't be able to call non-admin w/o signer being passed in wallet");
        } catch (err) {
            console.log(`caught expected exception: ${err}`);
            // expected
        }


    });


});
