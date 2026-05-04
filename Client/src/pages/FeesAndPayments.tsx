import Sidebar from "../components/Sidebar";
import FeesTopNav from "../components/fees/FeesTopNav";
import FeesHeader from "../components/fees/FeesHeader";
import FeeSchedule from "../components/fees/FeeSchedule";
import Guarantee from "../components/fees/Guarantee";
import RecentActivity from "../components/fees/RecentActivity";

export default function FeesAndPayments() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64 bg-white/50 min-h-screen">
        <FeesTopNav />
        <div className="pt-2 pb-16 px-6 lg:px-16">
          <div className="max-w-[1000px] mx-auto flex flex-col">
            <FeesHeader />
            <FeeSchedule />
            <div className="flex justify-center my-6">
                <div className="w-[85%] max-w-4xl">
                    <Guarantee />
                </div>
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
