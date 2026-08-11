'use client'
import React from 'react';

export default function ServiceSliderArrows() {
    const scrollSlider = (direction: 'prev' | 'next') => {
        const slider = document.querySelector('.panzer-scroll-service');
        if (!slider) return;
        
        const wrapper = slider.querySelector('.swiper-wrapper') || slider;
        const firstSlide = slider.querySelector('.swiper-slide');
        const sliderStyles = window.getComputedStyle(wrapper);
        const gap = parseFloat(sliderStyles.columnGap || sliderStyles.gap) || 0;
        
        const step = firstSlide ? firstSlide.getBoundingClientRect().width + gap : slider.clientWidth;
        
        slider.scrollBy({
            left: direction === 'prev' ? -step : step,
            behavior: 'smooth',
        });
    };

    return (
        <div className="panzer-service-arrows">
            <button 
                type="button" 
                className="panzer-service-arrow panzer-service-prev" 
                aria-label="Previous service" 
                onClick={() => scrollSlider('prev')}
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button 
                type="button" 
                className="panzer-service-arrow panzer-service-next" 
                aria-label="Next service" 
                onClick={() => scrollSlider('next')}
            >
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    );
}
