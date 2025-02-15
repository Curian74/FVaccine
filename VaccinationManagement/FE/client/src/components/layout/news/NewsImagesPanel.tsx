import { useState, useEffect, useCallback } from "react";
import NewsImageService from "@/services/NewsImageService";
import { useParams } from "react-router-dom";

const NewsImagesPanel = () => {
    const { newsId } = useParams();
    const [newsImage, setNewsImages] = useState<string[]>([""]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const baseURL = import.meta.env.VITE_BASE_URL;

    const nextSlide = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % newsImage.length);
            setIsFading(false);
        }, 500);
    }, [newsImage.length]);

    const prevSlide = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + newsImage.length) % newsImage.length);
            setIsFading(false);
        }, 500);
    };

    const fetchNewsImages = async () => {
        try {
            const data = await NewsImageService.GetAllImagesByNewsId(newsId!);
            const imageUrls = data.newsImages.map((image: { imagePath: string }) => image.imagePath);
            setNewsImages(imageUrls);
        } catch (error) {
            console.error("Error fetching news images:", error);
        }
    };

    useEffect(() => {
        fetchNewsImages();
    }, [newsId]);

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        newsImage.length > 0 ? (
            <div className="max-w mx-auto mt-4">
                <div className="relative w-full h-90 overflow-hidden">
                    <img
                        src={`${baseURL}/${newsImage[currentIndex]}`}
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
            </div>
        ) :
        <>
        </>
    );
};

export default NewsImagesPanel;
