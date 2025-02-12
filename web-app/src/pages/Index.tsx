
import { LondonMap } from "@/components/LondonMap";
import { NewsSidebar } from "@/components/NewsSidebar";

const Index = () => {
  return (
    <div className="flex min-h-screen">
      <NewsSidebar />
      <main className="flex-1 relative">
        <LondonMap />
      </main>
    </div>
  );
};

export default Index;
