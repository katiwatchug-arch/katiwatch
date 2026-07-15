const config = {
  plugins: [
    "@tailwindcss/postcss",
    [
      "postcss-preset-env",
      {
        features: {
          "cascade-layers": true,
          "color-mix": true,
        },
      },
    ],
  ],
};

export default config;
