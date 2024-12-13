import { Container } from "../components/Container";
import { Hero } from "../components/homepage/Hero";
import { SectionTitle } from "../components/homepage/SectionTitle";
import { Video } from "../components/homepage/Video";
import { Faq } from "../components/homepage/Faq";
import Navbar from "../components/Navbar/Navbar";
import { Features } from "../components/homepage/Features";

export default function Home() {
  return (
    <>
      <Navbar />
      <Container>
        <Hero />
        <SectionTitle
          preTitle="WATCH SCANPASS IN ACTION"
          title="See How Easy It Is"
        >
          Seemlessly register with ScanPass and see how we can help your business.
        </SectionTitle>
        {/* <Video /> */}
        <Features />
        <SectionTitle 
          preTitle="FAQ" 
          title="Got Questions?"
        >
          Learn more about how ScanPass works and how you can get the most out of it.
        </SectionTitle>
        <Faq />
      </Container>
    </>
  );
}
