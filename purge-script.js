const { PurgeCSS } = require('purgecss');
const fs = require('fs');

(async () => {
  const purgeCSSResults = await new PurgeCSS().purge({
    content: [
      './src/app/(frontend)/**/*.tsx',
      './src/app/(frontend)/**/*.ts',
      './src/components/frontend/**/*.tsx',
      './src/components/frontend/**/*.ts',
      './public/assets/js/**/*.js'
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
  });

  fs.writeFileSync('./public/assets/css/style.css', purgeCSSResults[0].css);
  console.log('PurgeCSS complete. Old size:', fs.statSync('./public/assets/css/style.css.backup2').size, 'New size:', fs.statSync('./public/assets/css/style.css').size);
})();
