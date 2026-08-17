const DEFAULT_CURRENCY = { symbol: "₦", locale: "en-NG" };

export function formatMoney(amount, currency = DEFAULT_CURRENCY) {
  return `${currency.symbol}${Number(amount).toLocaleString(currency.locale)}`;
}

export const formatNaira = (amount) => formatMoney(amount);

export function whatsappLink(phone) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
