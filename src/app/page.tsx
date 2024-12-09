import { Container } from "../components/Container";
import { Hero } from "../components/homepage/Hero";
import { SectionTitle } from "../components/homepage/SectionTitle";
import { Video } from "../components/homepage/Video";
import { Faq } from "../components/homepage/Faq";
import Navbar from "../components/Navbar/Navbar";

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
          Check out our demo video to see how you can create stunning voice clips in just a few clicks.
        </SectionTitle>
        <Video />
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
