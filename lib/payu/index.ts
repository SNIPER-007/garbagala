import crypto from "crypto";

export type PayUCheckoutFields = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  hash: string;
};

type PayUResponseParams = Record<string, string>;

export type PayUVerifiedPayment = {
  txnid: string;
  mihpayid?: string;
  status: string;
  unmappedstatus?: string;
  amount: string;
  netAmountDebit?: string;
  mode?: string;
  bankRefNum?: string;
  raw: any;
};

const PRODUCT_INFO = "Garba Gala 2026 General Sale Pass";

function getPayUCredentials() {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    throw new Error("PayU merchant credentials are not configured.");
  }

  return { key, salt };
}

function sha512(input: string): string {
  return crypto.createHash("sha512").update(input).digest("hex").toLowerCase();
}

function getBaseUrlFromRequest(request: Request): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL;
  if (configuredBaseUrl) {
    const withProtocol = configuredBaseUrl.startsWith("http")
      ? configuredBaseUrl
      : `https://${configuredBaseUrl}`;
    return withProtocol.replace(/\/$/, "");
  }

  const requestUrl = new URL(request.url);
  return requestUrl.origin;
}

export function getPayUPaymentUrl(): string {
  return process.env.PAYU_ENV === "test"
    ? "https://test.payu.in/_payment"
    : "https://secure.payu.in/_payment";
}

export function getPayUVerifyUrl(): string {
  return process.env.PAYU_ENV === "test"
    ? "https://test.payu.in/merchant/postservice.php?form=2"
    : "https://info.payu.in/merchant/postservice.php?form=2";
}

export function formatPayUAmount(amount: number): string {
  return amount.toFixed(2);
}

export function buildPayUCheckoutFields(input: {
  request: Request;
  txnid: string;
  bookingId: string;
  amount: number;
  firstname: string;
  email: string;
  phone: string;
}): PayUCheckoutFields {
  const { key, salt } = getPayUCredentials();
  const amount = formatPayUAmount(input.amount);
  const baseUrl = getBaseUrlFromRequest(input.request);

  const fieldsWithoutHash = {
    key,
    txnid: input.txnid,
    amount,
    productinfo: PRODUCT_INFO,
    firstname: input.firstname.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    surl: `${baseUrl}/api/payu/callback`,
    furl: `${baseUrl}/api/payu/callback`,
    udf1: input.bookingId,
    udf2: "garba-gala-2026",
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const hash = generatePaymentRequestHash(fieldsWithoutHash, salt);

  return {
    ...fieldsWithoutHash,
    hash,
  };
}

export function generatePaymentRequestHash(
  fields: Pick<PayUCheckoutFields, "key" | "txnid" | "amount" | "productinfo" | "firstname" | "email" | "udf1" | "udf2" | "udf3" | "udf4" | "udf5">,
  salt = getPayUCredentials().salt
): string {
  return sha512(
    [
      fields.key,
      fields.txnid,
      fields.amount,
      fields.productinfo,
      fields.firstname,
      fields.email,
      fields.udf1 || "",
      fields.udf2 || "",
      fields.udf3 || "",
      fields.udf4 || "",
      fields.udf5 || "",
      "",
      "",
      "",
      "",
      "",
      salt,
    ].join("|")
  );
}

export function verifyPayUResponseHash(params: PayUResponseParams): boolean {
  const { salt } = getPayUCredentials();
  const receivedHash = params.hash;

  if (!receivedHash) {
    return false;
  }

  const hashParts = params.additional_charges
    ? [
        params.additional_charges,
        salt,
        params.status || "",
        "",
        "",
        "",
        "",
        "",
        params.udf5 || "",
        params.udf4 || "",
        params.udf3 || "",
        params.udf2 || "",
        params.udf1 || "",
        params.email || "",
        params.firstname || "",
        params.productinfo || "",
        params.amount || "",
        params.txnid || "",
        params.key || "",
      ]
    : [
        salt,
        params.status || "",
        "",
        "",
        "",
        "",
        "",
        params.udf5 || "",
        params.udf4 || "",
        params.udf3 || "",
        params.udf2 || "",
        params.udf1 || "",
        params.email || "",
        params.firstname || "",
        params.productinfo || "",
        params.amount || "",
        params.txnid || "",
        params.key || "",
      ];

  const expectedHash = sha512(hashParts.join("|"));
  const received = receivedHash.toLowerCase();

  if (expectedHash.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "utf8"),
    Buffer.from(received, "utf8")
  );
}

export function parsePayUFormPayload(rawBody: string): PayUResponseParams {
  const params = new URLSearchParams(rawBody);
  const parsed: PayUResponseParams = {};
  params.forEach((value, key) => {
    parsed[key] = value;
  });
  return parsed;
}

export async function verifyPayUPayment(txnid: string): Promise<PayUVerifiedPayment> {
  const { key, salt } = getPayUCredentials();
  const command = "verify_payment";
  const hash = sha512([key, command, txnid, salt].join("|"));
  const body = new URLSearchParams({ key, command, var1: txnid, hash });

  const response = await fetch(getPayUVerifyUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`PayU verification request failed with status ${response.status}.`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("PayU verification returned an invalid response.");
  }

  const details = parsed.transaction_details?.[txnid];
  if (!details) {
    throw new Error("PayU verification response did not include this transaction.");
  }

  return {
    txnid,
    mihpayid: details.mihpayid,
    status: details.status,
    unmappedstatus: details.unmappedstatus,
    amount: String(details.amt ?? details.amount ?? ""),
    netAmountDebit: details.net_amount_debit ? String(details.net_amount_debit) : undefined,
    mode: details.mode,
    bankRefNum: details.bank_ref_num || details.bank_ref_no,
    raw: parsed,
  };
}

export function isPayUSuccessStatus(payment: PayUVerifiedPayment): boolean {
  return payment.status?.toLowerCase() === "success";
}
