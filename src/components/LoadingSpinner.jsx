import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="text-blue-600 font-semibold text-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;