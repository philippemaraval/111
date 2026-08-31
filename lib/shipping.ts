export const FREE_SHIPPING_THRESHOLD_EUROS = 60;

export type ShippingMethod = "mondial-relay" | "home";

export function calculateShippingPrice(subtotal: number) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD_EUROS) return 0;
  return 4.99;
}

export function getShippingLabel(method: ShippingMethod) {
  return method === "mondial-relay"
    ? "Point relais Mondial Relay"
    : "Livraison à domicile";
}
