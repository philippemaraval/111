export const FREE_SHIPPING_THRESHOLD_EUROS = 60;

export type ShippingMethod = "mondial-relay" | "home";

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
