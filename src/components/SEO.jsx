import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SEO = ({ title, description, keywords, image, url }) => {
  const { t } = useTranslation();
  const siteTitle = t("navbar.brand") || "Tour Mada Découverte";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Agence de voyage à Madagascar`;
  const metaDescription = description || "Découvrez Madagascar avec Tour Mada Découverte. Circuits authentiques, parcs nationaux, plages paradisiaques et expériences uniques sur mesure.";
  const metaKeywords = keywords || "Madagascar, tourisme, voyage, circuit, aventure, nature, parc national";
  const siteUrl = url || "https://tourmada.mg";
  const metaImage = image || "/logo.jpg";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};
