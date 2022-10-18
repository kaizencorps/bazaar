use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");


const BAZAAR: &str = "bazaar";


#[program]
pub mod bazaar {
    use super::*;

    pub fn create_domain(ctx: Context<CreateDomain>, name: String) -> Result<()> {
        // todo: store the name in the Domain ..?
        ctx.accounts.domain.authority = *ctx.accounts.authority.key;
        ctx.accounts.domain.bump = *ctx.bumps.get("domain").unwrap();
        let domain_name = name.as_bytes();
        let mut name = [0u8; 32];
        name[..domain_name.len()].copy_from_slice(domain_name);
        ctx.accounts.domain.name = name;
        msg!("created domain account: {}", ctx.accounts.domain.key());
        Ok(())
    }

    pub fn load_domain(ctx: Context<LoadDomain>) -> Result<()> {
        msg!("loaded domain account: {}", ctx.accounts.domain.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateDomain<'info> {
    // space: 8 discriminator + size(Domain) = 40
    #[account(
        init,
        payer = authority,
        seeds = [name.as_bytes().as_ref(), BAZAAR.as_bytes().as_ref()],
        bump,
        space = 8 + Domain::MAX_SIZE,
    )]
    domain: Account<'info, Domain>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program <'info, System>,
}


#[derive(Accounts)]
pub struct LoadDomain<'info> {
    // space: 8 discriminator + size(Domain) = 40
    #[account()]
    domain: Account<'info, Domain>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program <'info, System>,
}

// domains are needed for admin functions
#[account]
pub struct Domain {
    // max size = 32
    name: [u8; 32],
    authority: Pubkey,
    bump: u8
}

impl Domain {
    // allow up to 3 wallets for now - 2 num_keys + 4 vector + (space(T) * amount)
    pub const MAX_SIZE: usize = 32 + 32 + 1;
}


