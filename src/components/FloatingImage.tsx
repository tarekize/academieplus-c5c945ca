import { motion } from "framer-motion";

const FloatingImage = ({ src, alt }: { src: string, alt: string }) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      animate={{
        y: ["-5px", "5px"],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  );
};

export default FloatingImage;
