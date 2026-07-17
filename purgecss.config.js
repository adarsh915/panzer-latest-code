module.exports = {
  content: [
    './src/app/(frontend)/**/*.tsx',
    './src/app/(frontend)/**/*.ts',
    './src/components/frontend/**/*.tsx',
    './src/components/frontend/**/*.ts',
    './public/assets/js/**/*.js',
  ],
  css: ['./public/assets/css/style.css'],
  safelist: {
    standard: [
      'body',
      'html',
      /lenis.*/,
      /swiper.*/,
      /modal.*/,
      /fade.*/,
      /show.*/,
      /collapsing.*/,
      /active.*/,
      /wow.*/,
      /animated.*/,
      /select2.*/,
      /mfp-.*/,
      /odometer.*/,
      /slick.*/,
      /panzer-resource-breadcrumb.*/,
      /bg-.*/,
      /text-.*/,
      /d-.*/,
      /container.*/,
      /row.*/,
      /col-.*/,
      /nav-.*/,
      /navbar-.*/,
      /dropdown-.*/,
      /btn-.*/
    ]
  }
};
