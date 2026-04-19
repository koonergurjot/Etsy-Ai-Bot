// Etsy Open API v3 — https://developers.etsy.com/documentation/
// Public shop data uses API key only.
// Order/receipt data requires OAuth 2.0 (see ETSY_ACCESS_TOKEN in .env.example).

const ETSY_BASE = 'https://openapi.etsy.com/v3';
const CACHE_TTL = 30_000;

export class EtsyClient {
  constructor({ apiKey, shopId }) {
    this.apiKey = apiKey;
    this.shopId = shopId;
    this._cache = null;
    this._cacheTs = 0;
  }

  _isConfigured() {
    return Boolean(
      this.apiKey && this.shopId &&
      this.apiKey !== 'your_etsy_api_key' &&
      this.shopId !== 'your_etsy_shop_id'
    );
  }

  async _request(path) {
    const res = await fetch(`${ETSY_BASE}${path}`, {
      headers: { 'x-api-key': this.apiKey, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Etsy ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async getStats() {
    if (!this._isConfigured()) throw new Error('Etsy API not configured');

    const now = Date.now();
    if (this._cache && now - this._cacheTs < CACHE_TTL) return this._cache;

    const shop = await this._request(`/application/shops/${this.shopId}`);

    const stats = {
      orders: {
        total: shop.transaction_sold_count ?? 0,
        today: 0,    // requires OAuth receipts endpoint
        pending: 0,  // requires OAuth receipts endpoint
      },
      revenue: {
        total: 0,    // requires OAuth receipts endpoint
        currency: 'USD',
      },
      products: {
        active: shop.listing_active_count ?? 0,
        views: shop.num_favorers ?? 0,
      },
      shop: {
        name: shop.shop_name,
        rating: shop.review_average,
        reviews: shop.review_count,
      },
      mock: false,
      fetchedAt: now,
    };

    this._cache = stats;
    this._cacheTs = now;
    return stats;
  }

  getMockStats() {
    return {
      orders: { total: 247, today: 3, pending: 5 },
      revenue: { total: 4823.50, currency: 'USD' },
      products: { active: 34, views: 1205 },
      shop: { name: 'Your Etsy Shop', rating: 4.9, reviews: 84 },
      mock: true,
    };
  }
}
