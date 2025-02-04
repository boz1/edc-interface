import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
import { importKey } from "@taquito/signer";
import { char2Bytes } from "@taquito/utils";
import fs from "fs";
import { Tzip12Module, tzip12 } from "@taquito/tzip12";

// Read contract config
const contractConfig = JSON.parse(fs.readFileSync("./contractConfig.json"));

// connect tezos client to testnet
const tezos = new TezosToolkit(contractConfig.rpcUrl);
tezos.addExtension(new Tzip12Module());

// In-memory signer
// Remember to switch to remote signer in production
const faucet = JSON.parse(fs.readFileSync("./faucet/01.json"));
importKey(
  tezos,
  faucet.email,
  faucet.password,
  faucet.mnemonic.join(" "),
  faucet.activation_code
);

// Returns the balance of admin account
const getBalance = async () => {
  let response;
  await tezos.tz
    .getBalance(contractConfig.adminAddress)
    .then((balance) => {
      response = balance.toNumber() / 1000000;
      return 0;
    })
    .catch((error) => console.log(JSON.stringify(error)));
  return response;
};

// Returns the size of the map containing the logs
const getMapSize = async (mapName) => {
  let result = { admin: "", mapSize: 0 };
  await tezos.contract
    .at(contractConfig.contractAddress)
    .then((c) => {
      return c.storage();
    })
    .then((myStorage) => {
      result.mapSize = myStorage[mapName].size;
      result.admin = myStorage.admin;
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
};

const mintAsset = async (metaLink = "") => {
  let result = await tezos.contract
    .at(contractConfig.assetAddress)
    .then((contract) => {
      return contract.methods
        .mint([
          {
            to_: "tz1Na21NimuuPXcQdHUk2en2XWYe9McyDDgZ",
            metadata: {
              "": char2Bytes(metaLink),
            },
          },
        ])
        .send();
    })
    .then((hash) => {
      return hash.hash;
    })
    .catch((error) => {
      return error;
    });
  console.log("Return Object: " + result);
  return result;
};

const mintPolicy = async (metaLink = "") => {
  let result = await tezos.contract
    .at(contractConfig.policyAddress)
    .then((contract) => {
      return contract.methods
        .mint([
          {
            to_: "tz1Na21NimuuPXcQdHUk2en2XWYe9McyDDgZ",
            metadata: {
              "": char2Bytes(metaLink),
            },
          },
        ])
        .send();
    })
    .then((hash) => {
      return hash.hash;
    })
    .catch((error) => {
      return error;
    });
  console.log("Return Object: " + result);
  return result;
};

const mintContract = async (metaLink = "") => {
  let result = await tezos.contract
    .at(contractConfig.contractAddress)
    .then((contract) => {
      return contract.methods
        .mint([
          {
            to_: "tz1Na21NimuuPXcQdHUk2en2XWYe9McyDDgZ",
            metadata: {
              "": char2Bytes(metaLink),
            },
          },
        ])
        .send();
    })
    .then((hash) => {
      return hash.hash;
    })
    .catch((error) => {
      return error;
    });
  console.log("Return Object: " + result);
  return result;
};

const getAsset = async (assetId) => {
  let query = await tezos.contract
    .at(contractConfig.assetAddress, tzip12)
    .then((contract) => {
      console.log(`Fetching the token metadata for the token ID ${assetId}`);
      return contract.tzip12().getTokenMetadata(assetId);
    })
    .then((tokenMetadata) => {
      console.log(tokenMetadata);
      return tokenMetadata;
    })
    .catch((error) => {
      if (error.name === "TokenIdNotFound") {
        console.log("Not found error");
      }
      throw new Error(error);
    });
  return query;
};

const getAssetByName = async (assetName) => {
  let index = 0;
  let result = [];
  let inArray = true;
  while (inArray) {
    await tezos.contract
      .at(contractConfig.assetAddress, tzip12)
      .then((contract) => {
        console.log(`Fetching the token metadata for the token ID of ${index}`);
        return contract.tzip12().getTokenMetadata(index);
      })
      .then((tokenMetadata) => {
        if (tokenMetadata.name == assetName) {
          result.push(tokenMetadata);
        }
      })
      .catch((error) => {
        if (error.name == "TokenIdNotFound") {
          inArray = false;
          console.log("End of bigmap was reached");
        }
      });
    index = index + 1;
  }
  return result;
};

const getAllTokens = async (tokenType) => {
  // iterate over bigmap until tokenidnotfound error

  let startTime = new Date().getTime();
  let index = 0;
  let result = [];
  let inArray = true;
  while (inArray) {
    await tezos.contract
      .at(contractConfig[tokenType + "Address"], tzip12)
      .then((contract) => {
        console.log(`Fetching the token metadata for the token ID of ${index}`);
        return contract.tzip12().getTokenMetadata(index);
      })
      .then((tokenMetadata) => {
        //console.log(JSON.stringify(tokenMetadata, null, 2));
        result.push(tokenMetadata);
      })
      .catch((error) => {
        if (error.name == "TokenIdNotFound") {
          inArray = false;
          console.log("End of bigmap was reached");
        }
      });
    index = index + 1;
  }
  let endtime = new Date().getTime();
  let duration = (endtime - startTime) / 1000;
  console.log(`Execution time: ${duration} seconds`);
  console.log(`${result.length} tokens were returned`);
};

const getPolicy = async (policyId) => {
  let query = await tezos.contract
    .at(contractConfig.policyAddress, tzip12)
    .then((contract) => {
      console.log(`Fetching the token metadata for the token ID ${policyId}`);
      return contract.tzip12().getTokenMetadata(policyId);
    })
    .then((tokenMetadata) => {
      console.log(tokenMetadata);
      return tokenMetadata;
    })
    .catch((error) => {
      throw new Error(error);
    });
  return query;
};

const getPolicyByName = async (policyName) => {
  let index = 0;
  let result = [];
  let inArray = true;
  while (inArray) {
    await tezos.contract
      .at(contractConfig.policyAddress, tzip12)
      .then((contract) => {
        console.log(`Fetching the token metadata for the token ID of ${index}`);
        return contract.tzip12().getTokenMetadata(index);
      })
      .then((tokenMetadata) => {
        if (tokenMetadata.name == policyName) {
          result.push(tokenMetadata);
        }
      })
      .catch((error) => {
        if (error.name == "TokenIdNotFound") {
          inArray = false;
          console.log("End of bigmap was reached");
        }
      });
    index = index + 1;
  }
  return result;
};

const getContract = async (contractId) => {
  let query = await tezos.contract
    .at(contractConfig.contractAddress, tzip12)
    .then((contract) => {
      console.log(`Fetching the token metadata for the token ID ${contractId}`);
      return contract.tzip12().getTokenMetadata(contractId);
    })
    .then((tokenMetadata) => {
      console.log(tokenMetadata);
      return tokenMetadata;
    })
    .catch((error) => {
      throw new Error(error);
    });
  return query;
};

export {
  getBalance,
  getMapSize,
  mintAsset,
  mintPolicy,
  mintContract,
  getAllTokens,
  getAsset,
  getAssetByName,
  getPolicy,
  getPolicyByName,
  getContract,
};
