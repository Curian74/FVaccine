import Loading from "@/components/layout/Loading";
import Panel from "@/components/layout/Panel";
import NewsListComponent from "@/components/layout/news/NewsListComponent";
import VaccineListComponent from "@/components/layout/vaccine/VaccineListComponent";
import { useState } from "react";

const HomePage = () => {
  const [isVaccineLoader, setIsVaccineLoader] = useState(false);

  return (
    <>
      {!isVaccineLoader && <Loading />}
      <Panel />
      <VaccineListComponent
        onLoadComplete={() => {
          console.log("setIsVaccineLoader(true) called");
          setIsVaccineLoader(true);
        }}
      />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">News</h1>
        <p className="text-gray-600 mb-6">
          Established in June 2017, Vietnam Vaccine Joint Stock Company - VNVC is
          contributing to our nation's healthcare industry to provide a full
          range of high-quality preventive vaccines with stable prices.
        </p>
      </div>
      <NewsListComponent />
    </>
  );
};
export default HomePage
