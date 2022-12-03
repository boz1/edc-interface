import { getVCStatusByDID, getIssuerStatusByDID } from "../taquito/contract.js";
import { verifyCredential } from "@spruceid/didkit-wasm-node";

const getVerifierRoute = (client) => {
  /**
   * @swagger
   * /verify:
   *   post:
   *     summary: Verify a presented VC/VP.
   *     description: Given a VC/VP, checks/verifies the issuer logs, signatures and issuer identity on it. If all checks pass, gives access to the system.
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
      const VC = req.body;
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
          // Verify the signature on the credential
          const verifyOptionsString = "{}";
          const verifyResult = JSON.parse(
            await verifyCredential(JSON.stringify(VC), verifyOptionsString)
          );
          // If verification is successful
          if (verifyResult.errors.length === 0) {
            status = "accept";
          } else {
            const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
              ", "
            )}`;
            console.error(errorMessage);
          }
        }
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
