import Spinner from "@/assets/images/rocket.gif";
const Loading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <img className="w-16 h-16" src={Spinner} />
    </div>
  );
};
export default Loading;
