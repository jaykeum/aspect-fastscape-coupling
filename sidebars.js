// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Tutorial',
      collapsed: false,
      items: ['tutorial/couplingfastscape', 'tutorial/corecomplex'],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['reference/parameters', 'reference/aspect-vs-des'],
    },
  ],
};

export default sidebars;
