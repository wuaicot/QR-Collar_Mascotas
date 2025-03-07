// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
	Collection,
	CreateCustomerData,
	CreateCustomerError,
	CreateCustomerResponse,
	CreateOrderData,
	CreateOrderError,
	CreateOrderResponse,
	GetCollectionByIdData,
	GetCollectionByIdError,
	GetCollectionByIdResponse,
	GetCollectionsData,
	GetCollectionsError,
	GetCollectionsResponse,
	GetOrderByIdData,
	GetOrderByIdError,
	GetOrderByIdResponse,
	GetProductByIdData,
	GetProductByIdError,
	GetProductByIdResponse,
	GetProductsData,
	GetProductsError,
	GetProductsResponse,
	Order,
	Product,
} from './client.types.ts';

export * from './client.types.ts';

export const getProducts = <ThrowOnError extends boolean = false>(
	options?: Options<GetProductsData, ThrowOnError>,
): RequestResult<GetProductsResponse, GetProductsError, ThrowOnError> => {
	let items = Object.values(products);
	if (options?.query?.collectionId) {
		const collectionId = options.query.collectionId;
		items = items.filter((product) => product.collectionIds?.includes(collectionId));
	}
	if (options?.query?.ids) {
		const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
		items = items.filter((product) => ids.includes(product.id));
	}
	if (options?.query?.sort && options?.query?.order) {
		const { sort, order } = options.query;
		if (sort === 'price') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.price - b.price : b.price - a.price;
			});
		} else if (sort === 'name') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			});
		}
	}
	return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
	}
	return asResult(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
};

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	return asResult({
		...options.body,
		id: options.body.id ?? 'customer-1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	});
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const order: Order = {
		...options.body,
		id: 'dk3fd0sak3d',
		number: 1001,
		lineItems: options.body.lineItems.map((lineItem) => ({
			...lineItem,
			id: crypto.randomUUID(),
			productVariant: getProductVariantFromLineItemInput(lineItem.productVariantId),
		})),
		billingAddress: getAddress(options.body.billingAddress),
		shippingAddress: getAddress(options.body.shippingAddress),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	};
	orders[order.id] = order;
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const order = orders[options.path.id];
	if (!order) {
		const error = asError<GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const collections: Record<string, Collection> = {
	apparel: {
		id: 'apparel',
		name: 'Perros',
		description: 'Wear your love for Astro on your sleeve.',
		slug: 'apparel',
		imageUrl: '/assets/perros.jpg',
		...collectionDefaults,
	},
	stickers: {
		id: 'stickers',
		name: 'Gatos',
		description: 'Load up those laptop lids with Astro pride.',
		slug: 'stickers',
		imageUrl: '/assets/astro-sticker-pack.png',
		...collectionDefaults,
	},
	bestSellers: {
		id: 'bestSellers',
		name: 'Los más vendidos',
		description: "You'll love these.",
		slug: 'best-sellers',
		imageUrl: '/assets/astro-houston-sticker.png',
		...collectionDefaults,
	},
};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 20,
	options: {},
};

const apparelVariants = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size, index) => ({
	id: size,
	name: size,
	stock: index * 12,
	options: {
		Size: size,
	},
}));

const productDefaults = {
	description: '',
	images: [],
	variants: [defaultVariant],
	discount: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const products: Record<string, Product> = {
	'astro-icon-zip-up-hoodie': {
		...productDefaults,
		id: 'astro-icon-zip-up-hoodie',
		name: 'Modelo P_001',
		slug: 'astro-icon-zip-up-hoodie',
		tagline:
			'No need to compress this .zip. The Zip Up Hoodie is a comfortable fit and fabric for all sizes.',
		price: 1200000,
		imageUrl: '/assets/modelP_001.jpg',
		collectionIds: ['apparel', 'bestSellers'],
		variants: apparelVariants,
	},
	'astro-logo-curve-bill-snapback-cap': {
		...productDefaults,
		id: 'astro-logo-curve-bill-snapback-cap',
		name: 'modelP_002',
		slug: 'astro-logo-curve-bill-snapback-cap',
		tagline: ' Un elegante collar confeccionado en cuero genuino de alta calidad en un tono marrón oscuro y profundo. El cuero tiene un acabado suave y ligeramente brillante, acentuado con costuras en hilo beige que realzan su diseño artesanal. La placa metálica integrada está pulida y lleva el código QR grabado con láser, ubicado centrado para una fácil visibilidad. El cierre es una hebilla tradicional de metal sólido que complementa el estilo clásico del collar.',
		price: 2500000,
		imageUrl: '/assets/modelP_002.png',
		collectionIds: ['apparel'],
	},
	'astro-sticker-sheet': {
		...productDefaults,
		id: 'astro-sticker-sheet',
		name: 'Astro Sticker Sheet',
		slug: 'astro-sticker-sheet',
		tagline: "You probably want this for the fail whale sticker, don't you?",
		price: 1000,
		imageUrl: '/assets/astro-universe-stickers.png',
		collectionIds: ['stickers'],
	},
	'sticker-pack': {
		...productDefaults,
		id: 'sticker-pack',
		name: 'Sticker Pack',
		slug: 'sticker-pack',
		tagline: 'Jam packed with the most popular stickers.',
		price: 500,
		imageUrl: '/assets/astro-sticker-pack.png',
		collectionIds: ['stickers', 'bestSellers'],
	},
	'astro-icon-unisex-shirt': {
		...productDefaults,
		id: 'astro-icon-unisex-shirt',
		name: 'modelP_003',
		slug: 'astro-icon-unisex-shirt',
		tagline: 'Un collar ajustable disponible en tonos pastel como azul cielo, lila y rosa suave. Está hecho de un material suave y confortable para la mascota. La placa metálica permite, además del código QR, grabar el nombre de la mascota en una tipografía elegante y legible. Los bordes del collar están cuidadosamente rematados para evitar rozaduras.',
		price: 1320000,
		imageUrl: '/assets/modelP_003.webp',
		collectionIds: ['apparel'],
		variants: apparelVariants,
	},
	'astro-icon-gradient-sticker': {
		...productDefaults,
		id: 'astro-icon-gradient-sticker',
		name: 'Astro Icon Gradient Sticker',
		slug: 'astro-icon-gradient-sticker',
		tagline: "There gradi-ain't a better sticker than the classic Astro logo.",
		price: 200,
		imageUrl: '/assets/astro-icon-sticker.png',
		collectionIds: ['stickers', 'bestSellers'],
	},
	'astro-logo-beanie': {
		...productDefaults,
		id: 'astro-logo-beanie',
		name: 'modelP_004',
		slug: 'astro-logo-beanie',
		tagline: "Fabricado con nylon resistente y duradero en colores neón vibrantes como rosa fucsia, verde lima y naranja fluorescente. El collar incorpora una banda reflectante plateada que recorre su longitud, proporcionando seguridad adicional durante los paseos nocturnos. La placa con el código QR está hecha de material fosforescente que brilla en la oscuridad. El cierre es una hebilla de liberación rápida en plástico resistente, fácil de usar.",
		price: 2600000,
		imageUrl: '/assets/modelP_004.png',
		collectionIds: ['apparel', 'bestSellers'],
	},
	'lighthouse-100-sticker': {
		...productDefaults,
		id: 'lighthouse-100-sticker',
		name: 'Lighthouse 100 Sticker',
		slug: 'lighthouse-100-sticker',
		tagline: 'Bad performance? Not in my (light) house.',
		price: 500,
		imageUrl: '/assets/astro-lighthouse-sticker.png',
		collectionIds: ['stickers'],
	},
	'houston-sticker': {
		...productDefaults,
		id: 'houston-sticker',
		name: 'Houston Sticker',
		slug: 'houston-sticker',
		tagline: 'You can fit a Hous-ton of these on any laptop lid.',
		price: 250,
		discount: 100,
		imageUrl: '/assets/astro-houston-sticker.png',
		collectionIds: ['stickers', 'bestSellers'],
	},
};

function asResult<T>(data: T) {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T>(error: T) {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
	return {
		line1: address?.line1 ?? '',
		line2: address?.line2 ?? '',
		city: address?.city ?? '',
		country: address?.country ?? '',
		province: address?.province ?? '',
		postal: address?.postal ?? '',
		phone: address?.phone ?? null,
		company: address?.company ?? null,
		firstName: address?.firstName ?? null,
		lastName: address?.lastName ?? null,
	};
}

function getProductVariantFromLineItemInput(
	variantId: string,
): NonNullable<Order['lineItems']>[number]['productVariant'] {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { ...variant, product };
			}
		}
	}
	throw new Error(`Product variant ${variantId} not found`);
}
