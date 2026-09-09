export const FREE_SHIPPING_THRESHOLD_EUROS = 60;

export type ShippingMethod = "mondial-relay" | "home";

export function calculateShipmentWeightGrams(shirtCount: number) {
  if (!Number.isFinite(shirtCount) || shirtCount <= 0) return 0;

  // 35 g d'emballage + 215 g par t-shirt, d'après les colis réellement pesés.
  return 35 + Math.ceil(shirtCount) * 215;
}

export function calculateShippingPrice(subtotal: number, method: ShippingMethod) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD_EUROS) {
    return method === "mondial-relay" ? 0 : 4.99;
  }

  return method === "mondial-relay" ? 4.99 : 7.99;
}

export function getShippingLabel(method: ShippingMethod) {
  return method === "mondial-relay"
    ? "Point relais Mondial Relay"
    : "Livraison à domicile";
}
