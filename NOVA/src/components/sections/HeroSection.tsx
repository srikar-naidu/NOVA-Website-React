import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection: React.FC = (): React.JSX.Element => {
  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <section id="home" className="hero relative overflow-hidden flex items-center pt-20">
        
        {/* Optional subtle dark background */}
        <div className="absolute inset-0 bg-[#0a0a0f] -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Column - Text Content */}
          <div className="hero-content w-full md:w-1/2 text-left" data-aos="fade-up" data-aos-duration="1000">
            <div className="typing-container justify-start">
              <h1 className="typing-text text-5xl md:text-6xl font-bold mb-4">Welcome to <span className="highlight">NOVA</span></h1>
            </div>
            <h2 className="delayed-reveal-1 text-2xl text-gray-300 mb-4">Network of Visionary Aspirants</h2>
            <p className="delayed-reveal-2 text-lg text-gray-400 mb-8 max-w-lg">Empowering students to innovate, collaborate, and excel in the world of technology</p>
            <div className="hero-buttons delayed-reveal-3 flex gap-4">
              <button
                onClick={() => scrollToSection('about')}
                className="btn primary-btn bg-white text-black px-8 py-3 rounded-full font-bold hover:-translate-y-1 transition-transform"
              >
                Learn More
              </button>
              <Link to="/register" className="btn secondary-btn border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all">
                Join Us
              </Link>
            </div>
          </div>

          {/* Right Column - Video */}
          <div className="w-full md:w-1/2" data-aos="fade-left" data-aos-duration="1200">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_40px_rgba(0,200,150,0.15)] aspect-video bg-[#0a0a0f]">
              <video 
                ref={(el) => {
                  if (el) {
                    el.muted = true;
                    el.play().catch((err) => {
                      console.warn("Video autoplay blocked:", err);
                    });
                  }
                }}
                autoPlay={true}
                muted={true}
                loop={true}
                playsInline={true}
                controls={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

export default HeroSection
