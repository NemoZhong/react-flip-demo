export const routes = [
  {
    path: '/',
    component: '@/layouts/index',
    routes: [
      {
        path: '/',
        name: 'index',
        component: './index',
      },
      {
        path: '/picture',
        name: 'pic',
        component: './picture',
      },
      {
        path: '/flip-card',
        name: 'flip',
        component: './flipCard',
      },
    ],
  },
  {
    component: './404',
  },
];
