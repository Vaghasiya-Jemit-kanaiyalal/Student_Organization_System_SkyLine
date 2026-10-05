/**
 * Smart image resolution helper for merchandise and media items.
 * Seamlessly resolves external webpage links (Next Direct, Amazon, Dribbble, TradeIndia)
 * to high-resolution optimized local assets and ensures zero broken images.
 */

export const resolveMerchImage = (imageSrc, type = '', name = '') => {
  const nameLower = (name || '').toLowerCase();
  const typeLower = (type || '').toLowerCase();

  const isHoodie = typeLower.includes('hoodie') || nameLower.includes('hoodie');
  const isTShirt =
    typeLower.includes('t-shirt') ||
    typeLower.includes('tshirt') ||
    nameLower.includes('t-shirt') ||
    nameLower.includes('tshirt');

  const str = String(imageSrc || '').trim();

  // 1. TradeIndia Vintage Sports T-Shirt
  if (
    str.includes('tradeindia.com') ||
    str.includes('9392133') ||
    nameLower.includes('vintage')
  ) {
    return '/images/merchandise/tshirt_tradeindia.jpg';
  }

  // 2. Amazon India Athletic Zip-Up Tech Hoodie (TOGS & TERRE)
  if (
    str.includes('amazon.in') ||
    str.includes('B0DMFM1YDH') ||
    str.includes('TOGS') ||
    nameLower.includes('athletic') ||
    nameLower.includes('zip-up')
  ) {
    return '/images/merchandise/hoodie_amazon.jpg';
  }

  // 3. Next Direct Crest Heavyweight Hoodie
  if (
    str.includes('nextdirect.com') ||
    str.includes('su663457') ||
    str.includes('f70396') ||
    nameLower.includes('crest hoodie') ||
    nameLower.includes('heavyweight')
  ) {
    return '/images/merchandise/hoodie_nextdirect.jpg';
  }

  // 4. Dribbble Signature Graphic T-Shirt
  if (
    str.includes('dribbble.com') ||
    str.includes('t-shirt-desing') ||
    str.includes('t-shirt-design') ||
    nameLower.includes('signature cotton')
  ) {
    return '/images/merchandise/tshirt_dribbble.jpg';
  }

  // General fallbacks if an unhandled unsplash link or empty string
  if (!str || str.includes('unsplash') || !str.startsWith('/')) {
    if (isHoodie) return '/images/merchandise/hoodie_nextdirect.jpg';
    if (isTShirt) return '/images/merchandise/tshirt_dribbble.jpg';
    return '/images/merchandise/hoodie_nextdirect.jpg';
  }

  return str;
};

export const getMerchImageFallback = (type = '', name = '') => {
  const nameLower = (name || '').toLowerCase();
  const typeLower = (type || '').toLowerCase();

  if (nameLower.includes('vintage') || nameLower.includes('sports')) {
    return '/images/merchandise/tshirt_tradeindia.jpg';
  }
  if (nameLower.includes('athletic') || nameLower.includes('zip-up')) {
    return '/images/merchandise/hoodie_amazon.jpg';
  }
  if (typeLower.includes('t-shirt') || typeLower.includes('tshirt')) {
    return '/images/merchandise/tshirt_dribbble.jpg';
  }
  return '/images/merchandise/hoodie_nextdirect.jpg';
};
