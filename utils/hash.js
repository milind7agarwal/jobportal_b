import crypto from "crypto";

export const sha256 = (input) => {
  return crypto.createHash("sha256").update(input).digest("hex");
};

