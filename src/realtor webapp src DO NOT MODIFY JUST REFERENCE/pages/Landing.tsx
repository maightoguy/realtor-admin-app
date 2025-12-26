import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Values from "../components/Values";
import Contact from "../components/Contact";
import About from "../components/About";
import Footer from "../components/Footer";
const Landing = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Services />
      <Values />
      <About />
      <Contact />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Landing;
