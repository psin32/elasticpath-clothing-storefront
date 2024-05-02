import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import HitComponentAlgolia from '../search/HitAlgolia';
import { SearchHit } from '../search/SearchHit';
import { ProductResponse, ShopperCatalogResource } from '@moltin/sdk';
import { getEpccImplicitClient } from '../../lib/epcc-implicit-client';
import { getProductByIds } from '../../services/products';

interface AlgoliaCarouselProps {
    items: SearchHit[]
}

const AlgoliaCarousel = ({ items }: AlgoliaCarouselProps) => {

    const [products, setProducts] = useState<ShopperCatalogResource<ProductResponse[]> | undefined>(undefined);
    const client = getEpccImplicitClient()

    useEffect(() => {
        const init = async () => {
            setProducts(await getProductByIds(items.map(hit => hit.objectID).join(","), client))
        };
        init();
    }, []);

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
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
        <div className="image-slider-container">
            {items.length > 1 && (
                <Slider {...settings}>
                    {products && items.map((item, index) => {
                        const product: ProductResponse | undefined = products.data.find(prd => prd.id === item.objectID)
                        return (
                            product && (
                                <div className='px-2' key={index}>
                                    <HitComponentAlgolia hit={item} product={product} />
                                </div>
                            )
                        )
                    })}
                </Slider>
            )}

            {items.length == 1 && products && items.map((item, index) => {
                const product: ProductResponse | undefined = products.data.find(prd => prd.id === item.objectID)
                return (
                    product && (
                        <div className='px-2 w-full md:w-1/2 lg:w-1/4' key={index}>
                            <HitComponentAlgolia hit={item} product={product} />
                        </div>
                    )
                )
            })}

        </div>
    );
};

export default AlgoliaCarousel;
