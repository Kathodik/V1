// Shopify Storefront SDK helper - loads SDK lazily and creates checkout URL
const SHOPIFY_SDK_URL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
const SHOPIFY_DOMAIN = 'za37mz-s1.myshopify.com';
const SHOPIFY_STOREFRONT_TOKEN = '96988d994e204b5cbfe0e01435a33da9';
const SHOPIFY_PRODUCT_ID = 'gid://shopify/Product/16165875450191';

let sdkPromise = null;
let cachedClient = null;

const loadSdk = () => {
  if (window.ShopifyBuy) return Promise.resolve(window.ShopifyBuy);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = SHOPIFY_SDK_URL;
    script.onload = () => resolve(window.ShopifyBuy);
    script.onerror = () => reject(new Error('Shopify SDK konnte nicht geladen werden'));
    document.head.appendChild(script);
  });
  return sdkPromise;
};

const getClient = async () => {
  if (cachedClient) return cachedClient;
  const ShopifyBuy = await loadSdk();
  cachedClient = ShopifyBuy.buildClient({
    domain: SHOPIFY_DOMAIN,
    storefrontAccessToken: SHOPIFY_STOREFRONT_TOKEN,
  });
  return cachedClient;
};

/**
 * Create a Shopify checkout for the €49 Einsende-Pauschale and return the redirect URL.
 * Optional `customAttributes` are attached to the checkout so we can correlate it with
 * our internal order_id once Shopify sends the order webhook.
 */
export async function createCheckoutUrl({ customAttributes = [], email } = {}) {
  const client = await getClient();
  const product = await client.product.fetch(SHOPIFY_PRODUCT_ID);
  const variantId = product?.variants?.[0]?.id;
  if (!variantId) throw new Error('Produkt-Variante bei Shopify nicht gefunden');

  let checkout = await client.checkout.create({
    customAttributes,
    ...(email ? { email } : {}),
  });
  checkout = await client.checkout.addLineItems(checkout.id, [
    { variantId, quantity: 1 },
  ]);
  return checkout.webUrl;
}
