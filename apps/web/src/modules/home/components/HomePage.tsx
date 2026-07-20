import { loadHomePageData } from "@/modules/home/data/home.loader";

import { HomePageContent } from "./HomePageContent";

export async function HomePage() {
  const homeData = await loadHomePageData();

  return <HomePageContent data={homeData} />;
}
