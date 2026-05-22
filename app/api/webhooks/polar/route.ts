import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CreditPack = "pro" | "ultra";

type PaymentRecord = {
  amount: number | null;
  checkoutId: string;
  credits: number;
  currency: string | null;
  polarOrderId: string | null;
  productId: string | null;
  userId: string;
};

const CREDIT_PACKS: Record<CreditPack, { credits: number; envNames: string[] }> =
  {
    pro: {
      credits: 100,
      envNames: ["POLAR_PRO_PRODUCT_ID", "POLAR_CREDITS_PRO_PRODUCT_ID"],
    },
    ultra: {
      credits: 1100,
      envNames: ["POLAR_ULTRA_PRODUCT_ID", "POLAR_CREDITS_ULTRA_PRODUCT_ID"],
    },
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getOptionalEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  return null;
}

function getSupabaseServiceRoleKey() {
  return getOptionalEnv([
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVIE_ROLE_KEY",
  ]);
}

function createServiceSupabaseClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

function getHeader(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

function parseWebhookSignatures(signatureHeader: string) {
  return signatureHeader
    .split(" ")
    .map((part) => part.trim())
    .flatMap((part) => {
      if (part.startsWith("v1,") || part.startsWith("v1=")) {
        return [part.slice(3)];
      }

      return [];
    });
}

function verifyPolarWebhook(request: Request, body: string) {
  const webhookId = getHeader(request.headers, "webhook-id");
  const webhookTimestamp = getHeader(request.headers, "webhook-timestamp");
  const webhookSignature = getHeader(request.headers, "webhook-signature");
  const webhookSecret = getEnv("POLAR_WEBHOOK_SECRET");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(signedContent)
    .digest();

  return parseWebhookSignatures(webhookSignature).some((signature) => {
    try {
      const actualSignature = Buffer.from(signature, "base64");

      return (
        actualSignature.length === expectedSignature.length &&
        timingSafeEqual(actualSignature, expectedSignature)
      );
    } catch {
      return false;
    }
  });
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getMetadata(data: Record<string, unknown>) {
  return isRecord(data.metadata) ? data.metadata : {};
}

function getCustomerExternalId(data: Record<string, unknown>) {
  const customer = isRecord(data.customer) ? data.customer : null;

  return (
    getString(data.external_customer_id) ??
    getString(data.customer_external_id) ??
    getString(customer?.external_id)
  );
}

function getProductId(data: Record<string, unknown>) {
  const product = isRecord(data.product) ? data.product : null;
  const directProductId = getString(data.product_id) ?? getString(product?.id);

  if (directProductId) {
    return directProductId;
  }

  const firstItem = Array.isArray(data.items) ? data.items.find(isRecord) : null;
  const itemProduct = firstItem && isRecord(firstItem.product)
    ? firstItem.product
    : null;

  return getString(firstItem?.product_id) ?? getString(itemProduct?.id);
}

function getCreditPackFromProduct(productId: string | null) {
  if (!productId) {
    return null;
  }

  return (Object.entries(CREDIT_PACKS) as [CreditPack, (typeof CREDIT_PACKS)[CreditPack]][])
    .find(([, config]) => getOptionalEnv(config.envNames) === productId)?.[0] ?? null;
}

function getCredits(data: Record<string, unknown>) {
  const metadata = getMetadata(data);
  const metadataCredits = getNumber(metadata.credits);

  if (
    metadataCredits === CREDIT_PACKS.pro.credits ||
    metadataCredits === CREDIT_PACKS.ultra.credits
  ) {
    return metadataCredits;
  }

  const metadataPack = getString(metadata.credit_pack);

  if (metadataPack === "pro" || metadataPack === "ultra") {
    return CREDIT_PACKS[metadataPack].credits;
  }

  const productPack = getCreditPackFromProduct(getProductId(data));

  return productPack ? CREDIT_PACKS[productPack].credits : null;
}

function getCheckoutId(data: Record<string, unknown>) {
  const checkout = isRecord(data.checkout) ? data.checkout : null;
  const checkoutId = getString(data.checkout_id) ?? getString(checkout?.id);
  const orderId = getString(data.id);

  return checkoutId ?? (orderId ? `order:${orderId}` : null);
}

function getPaymentRecord(data: Record<string, unknown>): PaymentRecord | null {
  const metadata = getMetadata(data);
  const userId =
    getString(metadata.supabase_user_id) ?? getCustomerExternalId(data);
  const checkoutId = getCheckoutId(data);
  const credits = getCredits(data);

  if (!userId || !checkoutId || !credits) {
    return null;
  }

  return {
    amount:
      getNumber(data.total_amount) ??
      getNumber(data.amount) ??
      getNumber(data.net_amount),
    checkoutId,
    credits,
    currency: getString(data.currency),
    polarOrderId: getString(data.id),
    productId: getProductId(data),
    userId,
  };
}

export async function POST(request: Request) {
  const body = await request.text();

  if (!verifyPolarWebhook(request, body)) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 403 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body) as unknown;
  } catch {
    return Response.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (payload.type !== "order.paid") {
    return Response.json({ ignored: true });
  }

  if (!isRecord(payload.data)) {
    return Response.json({ error: "Invalid order payload." }, { status: 400 });
  }

  const payment = getPaymentRecord(payload.data);

  if (!payment) {
    return Response.json(
      { error: "Order is missing required payment metadata." },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("process_polar_order_paid", {
    p_amount: payment.amount,
    p_checkout_id: payment.checkoutId,
    p_credits: payment.credits,
    p_currency: payment.currency,
    p_polar_order_id: payment.polarOrderId,
    p_product_id: payment.productId,
    p_raw_event: payload,
    p_status: "paid",
    p_user_id: payment.userId,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ credited: data === true });
}
