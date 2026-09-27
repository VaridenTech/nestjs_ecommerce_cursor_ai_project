# API Spec — derived from the React storefront's own contract

This project has no reference API to copy. The React e-commerce app
(`react-ecommerce-app`) was prototyped against a public mock
API we don't control and won't ship with. This document is what we get by
reading the app's own source code: its TypeScript types, its API client,
its mock fixtures. Every clause below cites the client file that requires it.

## Endpoints (from `src/features/products/api.ts` and `src/features/checkout/api.ts`)

| Method | Path | Query / Body |
| --- | --- | --- |
| GET | `/products/categories` | — |
| GET | `/products` | `skip` (int, ≥0, default 0), `limit` (int, 1–100, default 20) |
| GET | `/products/category/:slug` | same as above |
| GET | `/products/:id` | — |
| POST | `/carts/add` | `{ userId, products: [{id, quantity}], address: {address, email, phone} }` |

## Product (from `src/features/products/types.ts`)

```ts
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;            // category slug, not an object
  price: number;
  discountPercentage?: number; // omit the key when the product has no discount
  rating: number;
  stock: number;
  tags: string[];
  brand: string;                // always present — we assign one to every product
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Array<{ rating: number; comment: string; date: string; reviewerName: string; reviewerEmail: string }>;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}
```

`discountPercentage?: number` in the client's own type (no `?` on `brand`) is why the
optionality is assigned this way — see `calculateOriginalPrice` in
`src/shared/utils/price.utils.ts`, which already treats `discountPercentage` as
possibly `undefined`.

## Category (from `src/features/products/types.ts`)

```ts
interface Category { slug: string; name: string; url: string; }
```

`GET /products/categories` returns this as a bare array (24 items), not wrapped in an envelope.

## List envelope + pagination (from `src/shared/types/generic.type.ts`, `src/features/products/api.ts`)

```ts
interface ProductListResponse {
  products: Product[];
  total: number; // total rows matching the filter
  skip: number;  // echoes the request
  limit: number; // echoes the request
}
```

`limit` must be `1–100`; `skip` must be `≥ 0`. Either violated → `400`. No client call
site ever needs anything outside this range (`Home.tsx` sends 5 and 12, `Category.tsx`
sends 20, the client's own default is 20) — this validated range gives real DTO content,
not a copied external quirk.

An unknown category slug is `200` with an empty envelope
(`{ products: [], total: 0, skip, limit }`), not `404` — a syntactically valid query
that matches nothing is not an error, and `Category.tsx` renders an empty grid for it,
not an error screen.

## Errors (from `src/shared/api/client.ts`)

`ApiError` reads `error.response.data.message` — every error body we send must carry
a `message` field.

- Non-existent product id → `404`: `{ "message": "Product <id> not found", "error": "Not Found", "statusCode": 404 }`
- Non-numeric product id → `400` (Nest's `ParseIntPipe` default shape)
- Any DTO validation failure → `400` (Nest's `ValidationPipe` default shape: `message` is an array of strings)

## Order receipt (from `src/features/checkout/api.ts`, `src/features/checkout/types.ts`)

The client's `PlaceOrderResponse` is only `{ id: number }` and the checkout flow
ignores everything else in the body — but an order endpoint that returns nothing
but an id leaves no way for any client to confirm what was ordered. We design a
full receipt; the client safely ignores fields it doesn't read.

```ts
interface OrderResponse {
  id: number;
  userId: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;               // price × quantity, rounded to 2dp
    discountPercentage?: number; // omitted if the product has none
    discountedPrice: number;     // total × (1 − discountPercentage/100), rounded to 2dp
    thumbnail: string;
  }>;
  total: number;           // sum of products[].total
  discountedTotal: number; // sum of products[].discountedPrice
  totalProducts: number;   // number of line items
  totalQuantity: number;   // sum of quantities
}
```

Status `201`.
