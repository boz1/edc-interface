import { getVCStatusByDID, getIssuerStatusByDID } from "../taquito/contract.js";
import {
  verifyCredential,
  verifyPresentation,
} from "@spruceid/didkit-wasm-node";

const verifyPresentationHelper = async (VC, VP) => {
  // Check if the subject is the holder of the VP
  if (VP?.holder === VC?.credentialSubject?.id) {
    // Check if log exists
    const log = await getVCStatusByDID(VC?.credentialSubject?.id);
    if (
      log &&
      log?.message === "Credentials have been published to the blockchain"
    ) {
      // Verify the issuer's identity
      const issuer = VC?.issuer;
      const isIssuerTrusted = await getIssuerStatusByDID(issuer);
      if (isIssuerTrusted) {
        // Verify the signature on the VC
        const verifyOptionsString = "{}";
        const verifyResult = JSON.parse(
          await verifyCredential(JSON.stringify(VC), verifyOptionsString)
        );
        // If credential verification is successful, verify the presentation
        if (verifyResult?.errors?.length === 0) {
          const res = JSON.parse(
            await verifyPresentation(JSON.stringify(VP), verifyOptionsString)
          );
          // If verification is successful
          if (res.errors.length === 0) {
            return "accept";
          } else {
            const errorMessage = `Unable to verify presentation: ${res.errors.join(
              ", "
            )}`;
            console.error(errorMessage);
          }
        } else {
          const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
            ", "
          )}`;
          console.error(errorMessage);
        }
      } else {
        const errorMessage =
          "Unable to find the issuer in the trusted issuers registry.";
        console.error(errorMessage);
      }
    } else {
      const errorMessage = "Unable to detect a log about the credential.";
      console.error(errorMessage);
    }
  } else {
    const errorMessage = "The credential subject does not match the VP holder.";
    console.error(errorMessage);
  }

  return "reject";
};

const getVerifierRoute = (client) => {
  /**
   * @swagger
   * /verify:
   *   post:
   *     summary: Verify a presented VC/VP.
   *     description: Given a VC/VP, checks/verifies the issuer logs, signatures and issuer identity on it. If all checks pass, returns accept.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            type: object
   *     responses:
   *       200:
   *         description: The verification result.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 result:
   *                   type: string
   *                   description: Result of verification.
   *                   example: accept
   *
   */
  client.post("/verify", async (req, res) => {
    // Await verification of VC/VP
    console.log("Verification endpoint triggered");
    try {
      let status = "reject";
      const VC_TYPE = "Company Credential";
      const credential = req.body;
      // Check type of the credential (VC or VP)
      if (credential?.type?.includes("VerifiablePresentation")) {
        // Check the data type of the VerifiableCredential field
        if (Array.isArray(credential?.verifiableCredential)) {
          const VC = credential?.verifiableCredential?.filter((vc) =>
            vc.type?.includes(VC_TYPE)
          )?.[0];
          if (VC) {
            status = await verifyPresentationHelper(VC, credential);
          } else {
            const errorMessage =
              "Unable to find a CompanyCredential or EmployeeCredential VC in the VP";
            console.error(errorMessage);
          }
        } else {
          // No VCs in VP
          const errorMessage =
            "Unable to detect verifiable credentials in the VP";
          console.error(errorMessage);
        }
      } else if (credential?.type?.includes("VerifiableCredential")) {
        // Check the type of the credential
        const VC = credential;
        if (VC?.type?.includes(VC_TYPE)) {
          // Check if log exists
          const log = await getVCStatusByDID(VC?.credentialSubject?.id);
          if (
            log &&
            log?.message === "Credentials have been published to the blockchain"
          ) {
            // Verify the issuer's identity
            const issuer = VC?.issuer;
            const isIssuerTrusted = await getIssuerStatusByDID(issuer);
            if (isIssuerTrusted) {
              // Verify the signature on the VC
              const verifyOptionsString = "{}";
              const verifyResult = JSON.parse(
                await verifyCredential(JSON.stringify(VC), verifyOptionsString)
              );
              // If verification is successful
              if (verifyResult?.errors?.length === 0) {
                status = "accept";
              } else {
                const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
                  ", "
                )}`;
                console.error(errorMessage);
              }
            } else {
              const errorMessage =
                "Unable to find the issuer in the trusted issuers registry.";
              console.error(errorMessage);
            }
          } else {
            const errorMessage = "Unable to detect a log about the credential.";
            console.error(errorMessage);
          }
        } else {
          const errorMessage =
            "The type of the credential is not CompanyCredential or EmployeeCredential.";
          console.error(errorMessage);
        }
      } else {
        const errorMessage = "Unable to determine the type of the credential.";
        console.error(errorMessage);
      }
      res.status(200);
      res.send(JSON.stringify({ status }));
    } catch (error) {
      res.status(400);
      res.send(error.message);
    }
  });
};

export { getVerifierRoute };
