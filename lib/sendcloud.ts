import { Buffer } from "node:buffer";

export type SendcloudServicePoint = {
  id: string;
  code: string;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  carrier: string;
};

type RawServicePoint = {
  id: string | number;
  name: string;
  carrier: {
    code: string;
  };
  carrier_service_point_id?: string;
  address: {
    street: string;
    house_number?: string;
    postal_code: string;
    city: string;
    country_code: string;
  };
  position?: {
    latitude?: string | number;
    longitude?: string | number;
  };
  distance?: number;
  is_expired?: boolean;
};

type SendcloudOrderLine = {
  name: string;
  quantity: number;
  amountTotal: number;
};

type SendcloudPaidOrder = {
  sessionId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  countryCode: string;
  amountTotal: number;
  shippingAmount: number;
  currency: string;
  weightGrams: number;
  shippingLabel: string;
  servicePointId?: string;
  lines: SendcloudOrderLine[];
};

function getSendcloudAuthorization() {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error("sendcloud_not_configured");
  }

  return `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;
}

async function sendcloudFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: getSendcloudAuthorization(),
        ...init?.headers
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`sendcloud_api_error:${response.status}:${detail}`);
    }

    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("sendcloud_")) {
      throw error;
    }

    throw new Error("sendcloud_network_error", { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toFiniteNumber(value: string | number | undefined) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeServicePoint(point: RawServicePoint): SendcloudServicePoint {
  return {
    id: String(point.id),
    code: point.carrier_service_point_id ?? "",
    name: point.name,
    street: point.address.street,
    houseNumber: point.address.house_number ?? "",
    postalCode: point.address.postal_code,
    city: point.address.city,
    latitude: toFiniteNumber(point.position?.latitude),
    longitude: toFiniteNumber(point.position?.longitude),
    distance: toFiniteNumber(point.distance),
    carrier: point.carrier.code
  };
}

export function hasSendcloudEnv() {
  return Boolean(process.env.SENDCLOUD_PUBLIC_KEY && process.env.SENDCLOUD_SECRET_KEY);
}

export async function searchMondialRelayServicePoints(postalCode: string) {
  const params = new URLSearchParams({
    country_code: "FR",
    address_postal_code: postalCode,
    radius: "10000",
    carrier_code: "mondial_relay",
    limit: "12"
  });
  const payload = await sendcloudFetch<{ data: { results: RawServicePoint[] } }>(
    `https://panel.sendcloud.sc/api/v3/service-points?${params}`
  );

  return payload.data.results
    .filter((point) => !point.is_expired && point.address.country_code === "FR")
    .map(normalizeServicePoint);
}

export async function getMondialRelayServicePoint(id: string) {
  const encodedId = encodeURIComponent(id);
  const [pointPayload, availabilityPayload] = await Promise.all([
    sendcloudFetch<{ data: RawServicePoint }>(
      `https://panel.sendcloud.sc/api/v3/service-points/${encodedId}`
    ),
    sendcloudFetch<{ data: { is_available: boolean } }>(
      `https://panel.sendcloud.sc/api/v3/service-points/${encodedId}/check-availability`,
      { method: "POST" }
    )
  ]);
  const point = pointPayload.data;

  if (
    point.is_expired ||
    !availabilityPayload.data.is_available ||
    point.address.country_code !== "FR" ||
    point.carrier.code.toLowerCase() !== "mondial_relay"
  ) {
    throw new Error("sendcloud_invalid_service_point");
  }

  return normalizeServicePoint(point);
}

function splitFrenchStreetAddress(line1: string) {
  const match = line1.trim().match(/^(\d+(?:\s*(?:bis|ter|quater))?)\s+(.+)$/i);

  if (!match) {
    return { address_line_1: line1.trim() };
  }

  return {
    address_line_1: match[2].trim(),
    house_number: match[1].trim()
  };
}

async function getSendcloudIntegrationId() {
  const payload = await sendcloudFetch<{ data: { integration_id: number } }>(
    "https://panel.sendcloud.sc/api/v3/user/auth/metadata"
  );

  return payload.data.integration_id;
}

export async function importPaidOrderToSendcloud(order: SendcloudPaidOrder) {
  const integrationId = await getSendcloudIntegrationId();
  const currency = order.currency.toUpperCase();
  const street = splitFrenchStreetAddress(order.addressLine1);
  const payload = [{
    // Sendcloud limite l'identifiant externe à 64 caractères, contrairement
    // aux identifiants de session Checkout Stripe. La fin reste unique et
    // déterministe afin que les renvois du webhook soient idempotents.
    order_id: order.sessionId.slice(-64),
    order_number: order.orderNumber,
    order_details: {
      integration: { id: integrationId },
      status: { code: "paid", message: "Payée" },
      order_created_at: order.createdAt,
      order_items: order.lines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        unit_price: {
          value: Number((line.amountTotal / 100 / line.quantity).toFixed(2)),
          currency
        },
        total_price: {
          value: Number((line.amountTotal / 100).toFixed(2)),
          currency
        }
      }))
    },
    payment_details: {
      is_cash_on_delivery: false,
      total_price: {
        value: Number((order.amountTotal / 100).toFixed(2)),
        currency
      },
      freight_costs: {
        value: (order.shippingAmount / 100).toFixed(2),
        currency
      },
      status: { code: "paid", message: "Paiement confirmé par Stripe" }
    },
    customer_details: {
      name: order.customerName,
      email: order.customerEmail,
      phone_number: order.customerPhone
    },
    shipping_address: {
      name: order.customerName,
      ...street,
      address_line_2: order.addressLine2 || undefined,
      postal_code: order.postalCode,
      city: order.city,
      country_code: order.countryCode,
      phone_number: order.customerPhone,
      email: order.customerEmail
    },
    shipping_details: {
      is_local_pickup: false,
      delivery_indicator: order.shippingLabel,
      measurement: {
        weight: {
          value: Number((order.weightGrams / 1000).toFixed(3)),
          unit: "kg"
        }
      }
    },
    service_point_details: order.servicePointId
      ? { id: order.servicePointId }
      : undefined
  }];

  const response = await sendcloudFetch<{
    data: Array<{ id: string | number; order_id: string; order_number: string }>;
  }>("https://panel.sendcloud.sc/api/v3/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.data[0] ?? null;
}

export async function deleteSendcloudOrder(orderId: string) {
  try {
    await sendcloudFetch<void>(
      `https://panel.sendcloud.sc/api/v3/orders/${encodeURIComponent(orderId)}`,
      { method: "DELETE" }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("sendcloud_api_error:404:")) return;
    throw error;
  }
}

export async function updateSendcloudOrderStatus(orderId: string, code: string, message: string) {
  await sendcloudFetch<unknown>(
    `https://panel.sendcloud.sc/api/v3/orders/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_details: { status: { code, message }, order_updated_at: new Date().toISOString() } })
    }
  );
}
