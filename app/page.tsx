import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import CharacterPreview from "./components/landing/CharacterPreview";
import HowItWorks from "./components/landing/HowItWorks";
import Testimonials from "./components/landing/Testimonials";
import CtaSection from "./components/landing/CtaSection";

export default function Home() {
  return (
    <main>
      <Navbar></Navbar>
      <Hero></Hero>
      <Features></Features>
      <CharacterPreview></CharacterPreview>
      <HowItWorks></HowItWorks>
      <Testimonials></Testimonials>
      <CtaSection></CtaSection>
    </main>
  );
}
