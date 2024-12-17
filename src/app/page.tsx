import { Container } from "../components/Container";
import { Hero } from "../components/homepage/Hero";
import { SectionTitle } from "../components/homepage/SectionTitle";
import { Faq } from "../components/homepage/Faq";
import Navbar from "../components/Navbar/Navbar";
import { Features } from "../components/homepage/Features";
import Footer from "../components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Container>
        <Hero />
        <Features />
        <SectionTitle 
          preTitle="FAQ" 
          title="Got Questions?"
        >
          Learn more about how ScanPass works and how you can get the most out of it.
        </SectionTitle>
        <Faq />
      </Container>
      <Footer />
    </>
  );
}
