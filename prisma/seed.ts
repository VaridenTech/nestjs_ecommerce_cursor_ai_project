import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  type Prisma,
} from '../src/generated/prisma/client.js';

const SEED = 20260913;
const REF_DATE = new Date('2026-09-13T00:00:00.000Z');

const CATEGORIES: Array<[slug: string, name: string]> = [
  ['beauty', 'Beauty'],
  ['fragrances', 'Fragrances'],
  ['furniture', 'Furniture'],
  ['groceries', 'Groceries'],
  ['home-decoration', 'Home Decoration'],
  ['kitchen-accessories', 'Kitchen Accessories'],
  ['laptops', 'Laptops'],
  ['mens-shirts', "Men's Shirts"],
  ['mens-shoes', "Men's Shoes"],
  ['mens-watches', "Men's Watches"],
  ['mobile-accessories', 'Mobile Accessories'],
  ['motorcycle', 'Motorcycle'],
  ['skin-care', 'Skin Care'],
  ['smartphones', 'Smartphones'],
  ['sports-accessories', 'Sports Accessories'],
  ['sunglasses', 'Sunglasses'],
  ['tablets', 'Tablets'],
  ['tops', 'Tops'],
  ['vehicle', 'Vehicle'],
  ['womens-bags', "Women's Bags"],
  ['womens-dresses', "Women's Dresses"],
  ['womens-jewellery', "Women's Jewellery"],
  ['womens-shoes', "Women's Shoes"],
  ['womens-watches', "Women's Watches"],
];

const COUNT_OVERRIDES: Record<string, number> = { beauty: 5, groceries: 27 };
const DEFAULT_COUNT = 8;

const WARRANTIES = [
  'No warranty',
  '1 week warranty',
  '1 month warranty',
  '3 months warranty',
  '6 months warranty',
  '1 year warranty',
  '2 year warranty',
  '3 year warranty',
  '5 year warranty',
  'Lifetime warranty',
];

const SHIPPING = [
  'Ships in 1-2 business days',
  'Ships in 3-5 business days',
  'Ships overnight',
  'Ships in 1 week',
  'Ships in 2 weeks',
  'Ships in 1 month',
];

// faker picks uniformly, so 'In Stock' is repeated to make it the common case.
const AVAILABILITY = [
  'In Stock',
  'In Stock',
  'In Stock',
  'In Stock',
  'Low Stock',
  'Out of Stock',
];

const RETURN_POLICIES = [
  'No return policy',
  '7 days return policy',
  '30 days return policy',
  '60 days return policy',
  '90 days return policy',
];

const IMAGE_SUFFIXES = ['a', 'b', 'c', 'd'];

type SeedProduct = Omit<Prisma.ProductCreateManyInput, 'categoryId'> & {
  categorySlug: string;
};

const FIRST_PRODUCT: SeedProduct = {
  id: 1,
  categorySlug: 'beauty',
  title: 'Velvet Matte Lipstick',
  description:
    'Long-wearing matte lipstick with a lightweight, non-drying formula in a true-red shade.',
  price: 9.99,
  discountPercentage: 10.48,
  rating: 4.6,
  stock: 42,
  tags: ['beauty', 'lipstick'],
  brand: 'Lumina',
  sku: 'BEA-LUM-001',
  weight: 2,
  width: 3.2,
  height: 9.5,
  depth: 3.2,
  warrantyInformation: 'No warranty',
  shippingInformation: 'Ships in 1-2 business days',
  availabilityStatus: 'In Stock',
  returnPolicy: '30 days return policy',
  minimumOrderQuantity: 1,
  barcode: '8901234567891',
  qrCode: 'https://picsum.photos/seed/product-1-qr/200/200',
  images: [
    'https://picsum.photos/seed/product-1-a/600/600',
    'https://picsum.photos/seed/product-1-b/600/600',
  ],
  thumbnail: 'https://picsum.photos/seed/product-1-thumb/300/300',
  createdAt: new Date('2026-01-15T08:00:00.000Z'),
  updatedAt: new Date('2026-08-20T11:30:00.000Z'),
};

const FIRST_REVIEWS: Prisma.ReviewCreateManyInput[] = [
  {
    productId: 1,
    rating: 5,
    comment: 'Stays on all day, love the finish.',
    date: new Date('2026-06-02T10:15:00.000Z'),
    reviewerName: 'Aom Suksawat',
    reviewerEmail: 'aom.suksawat@example.com',
  },
  {
    productId: 1,
    rating: 4,
    comment: 'Great color but a bit drying on my lips.',
    date: new Date('2026-06-10T14:30:00.000Z'),
    reviewerName: 'Beth Carter',
    reviewerEmail: 'beth.carter@example.com',
  },
  {
    productId: 1,
    rating: 5,
    comment: 'Repurchased three times already.',
    date: new Date('2026-06-18T09:05:00.000Z'),
    reviewerName: 'Nok Chaiyaporn',
    reviewerEmail: 'nok.chaiyaporn@example.com',
  },
];

function databaseUrl(): string {
  const url = process.env['DATABASE_URL'];
  if (url === undefined || url.length === 0) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

function titleCase(words: string): string {
  return words
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function groceryName(): string {
  const source = faker.helpers.arrayElement(['ingredient', 'fruit', 'vegetable']);
  if (source === 'fruit') {
    return faker.food.fruit();
  }
  if (source === 'vegetable') {
    return faker.food.vegetable();
  }
  return faker.food.ingredient();
}

function uniqueTitle(slug: string, used: Set<string>): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const title = titleCase(
      slug === 'groceries' ? groceryName() : faker.commerce.productName(),
    );
    if (!used.has(title)) {
      used.add(title);
      return title;
    }
  }
  throw new Error(`Could not generate a unique title for category: ${slug}`);
}

function imageUrls(id: number): string[] {
  const count = faker.number.int({ min: 1, max: IMAGE_SUFFIXES.length });
  return IMAGE_SUFFIXES.slice(0, count).map(
    (suffix) => `https://picsum.photos/seed/product-${id}-${suffix}/600/600`,
  );
}

function twoDecimals(min: number, max: number): number {
  return faker.number.float({ min, max, fractionDigits: 2 });
}

function buildCatalog(): {
  products: SeedProduct[];
  reviews: Prisma.ReviewCreateManyInput[];
} {
  faker.seed(SEED);
  const products: SeedProduct[] = [];
  const reviews: Prisma.ReviewCreateManyInput[] = [];
  let nextId = 1;

  for (const [slug] of CATEGORIES) {
    const usedTitles = new Set<string>();
    const count = COUNT_OVERRIDES[slug] ?? DEFAULT_COUNT;

    for (let index = 0; index < count; index += 1) {
      const id = nextId;
      nextId += 1;

      if (id === 1) {
        usedTitles.add(FIRST_PRODUCT.title);
        products.push(FIRST_PRODUCT);
        reviews.push(...FIRST_REVIEWS);
        continue;
      }

      const createdAt = faker.date.past({ years: 2, refDate: REF_DATE });
      products.push({
        id,
        categorySlug: slug,
        title: uniqueTitle(slug, usedTitles),
        description: faker.commerce.productDescription(),
        price: twoDecimals(4, 1999),
        discountPercentage:
          faker.helpers.maybe(() => twoDecimals(1, 25), { probability: 2 / 3 }) ??
          null,
        rating: twoDecimals(2.5, 5),
        stock: faker.number.int({ min: 0, max: 100 }),
        tags: [slug, faker.word.noun()],
        brand: faker.company.name(),
        sku: faker.string.alpha({ length: 8, casing: 'upper' }),
        weight: twoDecimals(0.1, 30),
        width: twoDecimals(1, 80),
        height: twoDecimals(1, 80),
        depth: twoDecimals(1, 80),
        warrantyInformation: faker.helpers.arrayElement(WARRANTIES),
        shippingInformation: faker.helpers.arrayElement(SHIPPING),
        availabilityStatus: faker.helpers.arrayElement(AVAILABILITY),
        returnPolicy: faker.helpers.arrayElement(RETURN_POLICIES),
        minimumOrderQuantity: faker.number.int({ min: 1, max: 5 }),
        barcode: faker.string.numeric({ length: 13 }),
        qrCode: `https://picsum.photos/seed/product-${id}-qr/200/200`,
        images: imageUrls(id),
        thumbnail: `https://picsum.photos/seed/product-${id}-thumb/300/300`,
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: REF_DATE }),
      });

      for (let reviewIndex = 0; reviewIndex < 3; reviewIndex += 1) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        reviews.push({
          productId: id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
          date: faker.date.recent({ days: 180, refDate: REF_DATE }),
          reviewerName: `${firstName} ${lastName}`,
          reviewerEmail: faker.internet.email({ firstName, lastName }),
        });
      }
    }
  }

  return { products, reviews };
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl() }),
  });
  const { products, reviews } = buildCatalog();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany();
      await tx.product.deleteMany();
      await tx.category.deleteMany();

      await tx.category.createMany({
        data: CATEGORIES.map(([slug, name]) => ({ slug, name })),
      });
      const categories = await tx.category.findMany();
      const categoryIdBySlug = new Map(
        categories.map((category) => [category.slug, category.id]),
      );

      await tx.product.createMany({
        data: products.map(({ categorySlug, ...product }) => {
          const categoryId = categoryIdBySlug.get(categorySlug);
          if (categoryId === undefined) {
            throw new Error(`Unknown category slug: ${categorySlug}`);
          }
          return { ...product, categoryId };
        }),
      });
      await tx.review.createMany({ data: reviews });
    });
  } finally {
    await prisma.$disconnect();
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${products.length} products, ${reviews.length} reviews`,
  );
}

await main();
