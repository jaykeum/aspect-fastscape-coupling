// @ts-check
// Docusaurus config for the ASPECT-FastScape coupling tutorial.
// Deployed to GitHub Pages by .github/workflows/deploy.yml.
//
// CHANGE THESE TWO LINES to your GitHub user name before pushing:
const GITHUB_USER = 'jaykeum';
const REPO_NAME = 'aspect-fastscape-coupling';

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ASPECT–FastScape coupling',
  tagline: 'How ASPECT and FastScape exchange velocity and topography, and how to run a coupled core-complex model',
  favicon: 'img/favicon.ico',

  url: `https://${GITHUB_USER}.github.io`,
  baseUrl: `/${REPO_NAME}/`,
  organizationName: GITHUB_USER,
  projectName: REPO_NAME,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: `https://github.com/${GITHUB_USER}/${REPO_NAME}/tree/main/`,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { respectPrefersColorScheme: true },
      navbar: {
        title: 'ASPECT–FastScape',
        items: [
          { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Main' },
          { href: 'https://github.com/geodynamics/aspect', label: 'ASPECT', position: 'right' },
          { href: 'https://github.com/fastscape-lem/fastscapelib-fortran', label: 'FastScape', position: 'right' },
          { href: `https://github.com/${GITHUB_USER}/${REPO_NAME}`, label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Related',
            items: [
              { label: 'DES3D–goSPL coupling tutorial', href: 'https://geoflac.github.io/des3d/docs/tutorial/couplinggospl' },
              { label: 'GeoFLAC/DynEarthSol Workshop 2026', href: 'https://sungho91.github.io/geoflac-des-2026/' },
            ],
          },
          {
            title: 'Codes',
            items: [
              { label: 'ASPECT manual', href: 'https://aspect-documentation.readthedocs.io/' },
              { label: 'FastScape', href: 'https://fastscape.org/' },
            ],
          },
        ],
        copyright: `Jaeyoon Keum · prepared for the GeoFLAC/DynEarthSol Workshop & Hackathon 2026, KIGAM`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash'],
      },
    }),
};

export default config;
