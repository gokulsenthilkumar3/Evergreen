import { NobleCryptoPlugin, ScureBase32Plugin, TOTP } from 'otplib';

// The low-level TOTP class has no default plugins in otplib 13.
export const authenticator = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});
