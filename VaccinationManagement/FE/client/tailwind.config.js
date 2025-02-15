import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Đảm bảo các file được quét
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
