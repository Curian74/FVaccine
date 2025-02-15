import  { useState, useEffect, useCallback } from "react";
import Panel1 from "@/assets/images/banner/panel1.png"
import Panel2 from "@/assets/images/banner/panel2.png"
import Panel3 from "@/assets/images/banner/panel3.png"
import VnvcImage from "@/assets/images/banner/vnvc-homepage.jpg"
const Panel = () => {
    const images = [
        Panel1,
        Panel2,
        Panel3,
        Panel1,
        Panel2,
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const nextSlide = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            setIsFading(false);
        }, 500);
    },[images.length]);

    const prevSlide = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex(
                (prevIndex) => (prevIndex - 1 + images.length) % images.length
            );
            setIsFading(false);
        }, 500);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <div className="max-w mx-auto">
            {/* Slider */}
            <div className="relative w-full h-90 overflow-hidden">
                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex}`}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"
                        }`}
                />
                <button
                    className="absolute top-1/2 left-20 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    onClick={prevSlide}
                >
                    ❮
                </button>
                <button
                    className="absolute top-1/2 right-20 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    onClick={nextSlide}
                >
                    ❯
                </button>
            </div>

            {/* Content */}
            <div className=" bg-blue-900 text-white">
                <div className="mt-1 mx-auto relative flex justify-between text-center">
                    <div className="items-center ml-16 w-1/3 mt-3">

                        <h1 className="text-2xl font-bold">
                            VNVC VACCINATION CENTER
                        </h1>
                        <p className="mt-4 text-justify">
                            With over 200 modern centers nationwide, VNVC strives to provide millions of Vietnamese children and families with safe,
                            high-quality, and affordable vaccination services. Over the past 8 years, VNVC has introduced dozens of new-generation vaccines,
                            rare vaccines, and hundreds of millions of essential doses for children and adults. In particular, VNVC has supplied
                            over 30 million doses of the AstraZeneca Covid-19 vaccine, making a timely contribution to the fight against the pandemic.
                        </p>
                        <div></div>
                        <p className="mt-4 text-justify">
                            Thanks to outstanding efforts and achievements, VNVC has been honored with numerous awards and commendations from the Government,
                            health agencies, and the community, establishing itself as a leading, high-quality, safe, and reputable vaccination service system across the country, and transforming the landscape of Vietnam’s vaccination service industry.
                        </p>

                    </div>
                    <div className="items-center ml-16 w-2/3 m-5">

                        <img src={VnvcImage} alt="VNVC VACCINATION CENTER" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Panel;
