import AboutHero from "../components/about/AboutHero";
import WhatIsADR from "../components/about/WhatIsADR";
import WhyItMatters from "../components/about/WhyItMatters";
import Benefits from "../components/about/Benefits";
import AboutCTA from "../components/about/AboutCTA";

const AboutADR = () => {
  return (
    <div className="font-sans bg-(--color-bg-white) pb-20">
      <AboutHero />
      <WhatIsADR />
      <WhyItMatters />
      <Benefits />
      <AboutCTA />
    </div>
  );
};

export default AboutADR;
