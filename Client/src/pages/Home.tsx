import Hero from "../components/Hero"
import Features from "../components/Features"
import CTA from "../components/CTA"

interface HomeProps {
  onGetStarted: () => void
}

const Home = ({ onGetStarted }: HomeProps) => {
  return (
    <>
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <CTA onGetStarted={onGetStarted} />
    </>
  )
}

export default Home
