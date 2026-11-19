// Design tokens. Every image is drawn twice, once per theme.
// Backgrounds stay transparent, so the images sit on any GitHub theme.

export const themes = {
  dark: {
    id: 'dark',
    ink: '#F0F6FC',
    text: '#C9D1D9',
    muted: '#8D96A0',
    faint: '#6A737D',
    line: '#F0F6FC',
    lineO: 0.13,
    card: '#F0F6FC',
    cardO: 0.035,
    card2O: 0.065,
    accent: '#FF6A2A',
    accentText: '#FF7B42',
    accent2: '#FFB347',
    onAccent: '#190B04',
    softO: 0.2,
    glowO: 0.2,
    shadow: '#000000',
    shadowO: 0.55,
    plate: {
      top0: '#222A35',
      top1: '#171C24',
      left: '#12171D',
      right: '#0B0F14',
      stroke: '#4A535E',
      mark: '#8D96A0',
    },
    // Small interface drawings inside the cards.
    ui: { bg: '#151A21', stroke: '#3A424D', bar: '#3A424D', bar2: '#222831' },
  },
  light: {
    id: 'light',
    ink: '#0F1419',
    text: '#2D333B',
    muted: '#59636E',
    faint: '#8C959F',
    line: '#1F2328',
    lineO: 0.15,
    card: '#1F2328',
    cardO: 0.03,
    card2O: 0.055,
    accent: '#E4460A',
    accentText: '#C93B05',
    accent2: '#F2820F',
    onAccent: '#FFFFFF',
    softO: 0.14,
    glowO: 0.13,
    shadow: '#1F2328',
    shadowO: 0.2,
    plate: {
      top0: '#FFFFFF',
      top1: '#F3F5F7',
      left: '#E4E8EC',
      right: '#D5DAE0',
      stroke: '#A7B0BA',
      mark: '#6E7781',
    },
    ui: { bg: '#FFFFFF', stroke: '#C3CBD4', bar: '#CED5DC', bar2: '#EBEEF2' },
  },
};

// Layout constants shared by every image.
//
// A profile README is 846 pixels wide on a large desktop screen, and about 830
// on a laptop that shows a scrollbar. The page is designed as one column of
// 824 pixels, so that it fits both. Three tiles or two cards fill the column.
export const COLUMN = 824;
export const GUTTER = 4; // transparent margin baked into every tile and card
export const TILE_W = 272; // 3 tiles and 2 spaces of 4 = 824
export const CARD_W = 410; // 2 cards and 1 space of 4 = 824
