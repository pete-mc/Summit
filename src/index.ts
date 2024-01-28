import './styles/index.css';
import summitModule from '@/modules/summitModule';
import SummitRouter from '@/router/SummitRouter';

setTimeout(() => {
  window.$nuxt.$store.registerModule('Summit', summitModule);
  window.$nuxt.$store.dispatch('Summit/initialize');
  window.$nuxt.$nextTick(async () => {
    SummitRouter.getInstance();
  });
}, 1000);
