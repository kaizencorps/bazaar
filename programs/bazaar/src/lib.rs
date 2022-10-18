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

    pub fn load_domain(ctx: Context<LoadDomain>, admin: bool) -> Result<()> {
        msg!("loaded domain account: {}", ctx.accounts.domain.key());
        if admin {
            // then the authority needs to be the domain's authority
            require!(ctx.accounts.authority.key() == ctx.accounts.domain.authority.key(), ErrorCode::NotDomainAdmin);
        } else {
            // then the authority needs to be the wallet we're adding
            require!(ctx.accounts.authority.key() == *ctx.accounts.wallet.key, ErrorCode::NotSigner);
        }

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
    /// CHECK: This is not dangerous because we don't read or write from this account
    wallet: AccountInfo<'info>,
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


#[error_code]
pub enum ErrorCode {
    #[msg("Signer is not a domain admin")]
    NotDomainAdmin,
    #[msg("Can only add wallet of signer")]
    NotSigner,

}

