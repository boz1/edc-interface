# EDC Interface

## IPFS Setup

In order to pin content to the IPFS you must include your Pinata API credentials in the form of environment parameters:

1. Create a file in root directory called ".env"
2. Add your Pinata private key as a variable:

```
PINATA_KEY=
```

3. Save this file

## Run the Tezos Client

First, make sure all dependencies are installed:

```
npm install
```

Run the server locally:

```
npm run serve
```

## Swagger Documentation

The documentation can be viewed on http://localhost:3000/docs when server runs.

## Contract Information

Metadata of FA2 contracts is generated with the support of @taqueria/plugin-metadata feature to comply with TZIP-16 standard.

Following smart contracts are originated and can be used for minting:

- FA2 Asset Contract: [KT1NUjiNytkqvp52eTkT5GKiCuKMymwfgQC9](https://better-call.dev/ghostnet/KT1NUjiNytkqvp52eTkT5GKiCuKMymwfgQC9/tokens)
- FA2 Policy Contract: [KT1BFNQveBXw3ZwkWUswPpQfQkxLi6a29Kru](https://better-call.dev/ghostnet/KT1BFNQveBXw3ZwkWUswPpQfQkxLi6a29Kru/tokens)
- FA2 Contract Contract : [KT1TUXx3G5w8Ey6sTKdE4duT23n2iPffNGsz](https://better-call.dev/ghostnet/KT1TUXx3G5w8Ey6sTKdE4duT23n2iPffNGsz/tokens)

## Contract Origination

```
~/smartpy-cli/SmartPy.sh originate-contract --code /Users/johann/Documents/Code/GAIA/edc-interface/artifacts/contractContract/step_000_cont_0_contract.tz --storage /Users/johann/Documents/Code/GAIA/edc-interface/artifacts/contractContract/step_000_cont_0_storage.tz --rpc https://rpc.ghostnet.teztnets.xyz/

```
