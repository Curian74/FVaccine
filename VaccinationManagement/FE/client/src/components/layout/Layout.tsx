import Content from "./Content";
import Header from "./Header";
const Layout = () => {
  return (
    <>
      <div className="sticky top-0 z-30 w-full">
        <Header />
      </div>
      <div className="flex flex-col items-center">
        <div className="max-w-screen-2xl w-full lg:w-full xl:w-full">
          <Content />
        </div>
      </div>
    
    </>
  );
};
export default Layout;
