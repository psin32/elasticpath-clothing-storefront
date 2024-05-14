"use client"
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ProductResponse, ShopperCatalogResource } from '@moltin/sdk';
import Link from 'next/link';
import { EyeSlashIcon } from '@heroicons/react/20/solid';
import StrikePrice from '../product/StrikePrice';
import Price from '../product/Price';
import Image from 'next/image';

interface RecommendationCarouselProps {
    products: ShopperCatalogResource<ProductResponse[]> | undefined
}

const RecommendationCarousel = ({ products }: RecommendationCarouselProps) => {

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            }
        ]
    };

    return (
        <div className='slick-list'>
            <Slider {...settings} className='md:w-2/3'>
                {products && products.data.map((product, index) => {
                    return (
                        product && (
                            <div className='px-2' key={index}>
                                <Link href={`/products/${product.id}`} legacyBehavior key={product.id}>
                                    <div
                                        className="group flex h-full cursor-pointer flex-col items-stretch"
                                        data-testid={product.id}
                                    >
                                        <div className="relative overflow-hidden rounded-t-lg border-l border-r border-t pb-[100%]">
                                            {product.relationships.main_image.data?.id ? (
                                                <Image
                                                    className="relative h-full w-full transition duration-300 ease-in-out group-hover:scale-105"
                                                    src={products.included?.main_images?.find(image => image.id === product.relationships.main_image.data?.id)?.link.href || ""}
                                                    alt={product.attributes.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    style={{
                                                        objectFit: "contain",
                                                        objectPosition: "center",
                                                    }}
                                                />
                                            ) : (
                                                <div className="absolute flex h-full w-full items-center justify-center bg-gray-200">
                                                    <EyeSlashIcon width={10} height={10} />
                                                </div>
                                            )}
                                            {product.attributes.components && (
                                                <div className="absolute bg-red-600 text-white top-1 rounded-md pr-1 pl-1 right-2 text-sm">
                                                    <h4>Bundle</h4>
                                                </div>
                                            )}
                                            {product.meta.variation_matrix && (
                                                <div className="absolute bg-red-600 text-white top-1 rounded-md pr-1 pl-1 right-2 text-sm">
                                                    <h4>Variation</h4>
                                                </div>
                                            )}
                                            {"tiers" in product.attributes && (
                                                <div className="absolute bg-red-600 text-white top-1 rounded-md pr-1 pl-1 left-2 text-sm">
                                                    <h4>Bulk Buy Offer</h4>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex h-full flex-col gap-2 rounded-b-lg border-b border-l border-r p-4">
                                            <div className="h-full">
                                                <Link href={`/products/${product.id}`} passHref legacyBehavior>
                                                    <h3 className="text-sm font-bold">{product.attributes.name}</h3>
                                                </Link>
                                                <span className="mt-2 line-clamp-6 text-xs font-medium leading-5 text-gray-500" dangerouslySetInnerHTML={{ __html: product.attributes.description }}>
                                                </span>
                                            </div>
                                            <div>
                                                {product.meta.display_price && (
                                                    <div className="flex items-center mt-2">
                                                        {product?.meta?.component_products && (
                                                            <div className="mr-1 text-md">FROM </div>
                                                        )}
                                                        {product.meta.original_display_price && (
                                                            <StrikePrice
                                                                price={product.meta.original_display_price?.without_tax?.formatted ? product.meta.original_display_price?.without_tax?.formatted : product.meta.original_display_price.with_tax.formatted}
                                                                currency={product.meta.original_display_price.without_tax?.currency ? product.meta.original_display_price?.without_tax?.currency : product.meta.original_display_price.with_tax.currency}
                                                                size="text-xl"
                                                            />
                                                        )}
                                                        <Price
                                                            price={product.meta.display_price?.without_tax?.formatted ? product.meta.display_price?.without_tax?.formatted : product.meta.display_price?.with_tax.formatted}
                                                            currency={product.meta.display_price?.without_tax?.currency ? product.meta.display_price?.without_tax?.currency : product.meta.display_price?.with_tax.currency}
                                                            original_display_price={product.meta.original_display_price}
                                                            size="text-xl"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    )
                })}
            </Slider>
        </div>
    );
};

export default RecommendationCarousel;
