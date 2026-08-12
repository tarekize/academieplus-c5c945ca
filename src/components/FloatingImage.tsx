// Image simple à chargement prioritaire (loading="eager"), utilisée dans les visuels
// flottants de la landing page (composée en absolute par le composant parent).
const FloatingImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
    />
  );
};

export default FloatingImage;
