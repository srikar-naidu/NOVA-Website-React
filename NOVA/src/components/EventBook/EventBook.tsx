import React, { useRef, useState } from 'react'
import HTMLFlipBook, { PageFlipInstance } from 'react-pageflip'
import './EventBook.css'
import cert1 from "../../assets/novathon/cert_1.png"
import cert2 from "../../assets/novathon/cert_2.png"
import cert3 from "../../assets/novathon/cert_3.png"
import cert4 from "../../assets/novathon/cert_4.png"
import group2 from "../../assets/novathon/group_2.jpg"
import poster from "../../assets/novathon/poster.png"

// Decode Session Images
import decodePoster from "../../assets/decode_session/poster.jpg"
import decodeImg1 from "../../assets/decode_session/img1.jpg"
import decodeImg2 from "../../assets/decode_session/img2.jpg"
import decodeImg3 from "../../assets/decode_session/img3.png"
import decodeImg4 from "../../assets/decode_session/img4.png"
import decodeImg5 from "../../assets/decode_session/img5.jpg"
import decodeImg6 from "../../assets/decode_session/img6.png"
import decodeImg7 from "../../assets/decode_session/img7.png"
import decodeImg8 from "../../assets/decode_session/img8.png"
import decodeImg9 from "../../assets/decode_session/img9.png"
import decodeImg10 from "../../assets/decode_session/img10.png"
import decodeImg11 from "../../assets/decode_session/img11.png"
import decodeImg12 from "../../assets/decode_session/img12.png"
import decodeImg13 from "../../assets/decode_session/img13.png"
import decodeImg14 from "../../assets/decode_session/img14.png"
import decodeImg15 from "../../assets/decode_session/img15.png"
import decodeImg16 from "../../assets/decode_session/img16.png"
import decodeImg17 from "../../assets/decode_session/img17.png"
import decodeImg18 from "../../assets/decode_session/img18.png"
import decodeImg19 from "../../assets/decode_session/img19.png"
import decodeImg20 from "../../assets/decode_session/img20.png"
import decodeImg21 from "../../assets/decode_session/img21.png"
import decodeImg22 from "../../assets/decode_session/img22.png"

import event3Img1 from "../../assets/event_3/img1.png"
import event3Img2 from "../../assets/event_3/img2.png"
import event3Img3 from "../../assets/event_3/img3.jpg"
import event3Img4 from "../../assets/event_3/img4.png"
import event3Img5 from "../../assets/event_3/img5.png"
import codeathonPoster from "../../assets/event_3/codeathon_poster.jpg"
import finalistsImg from "../../assets/event_3/finalists.png"
import winnersImg from "../../assets/event_3/winners.jpg"

interface PageProps {
  density?: 'soft' | 'hard'
  children?: React.ReactNode
  number?: string | number
}

const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div className="page" ref={ref} data-density={props.density || 'soft'}>
      <div className="page-content">
        {props.children}
        <div className="page-footer">
          {props.number}
        </div>
      </div>
    </div>
  )
})
Page.displayName = 'Page'

interface CoverPageProps {
  logo?: string
  title: string
  subtitle?: string
  density?: 'soft' | 'hard'
}

const CoverPage = React.forwardRef<HTMLDivElement, CoverPageProps>((props, ref) => {
  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content">
        <div className="cover-design">
          <div className="cover-glow"></div>
          {props.logo && <div className="cover-logo-container"><img src={props.logo} alt="Logo" className="cover-logo" /></div>}
          <h2>{props.title}</h2>
          {props.subtitle && <h3>{props.subtitle}</h3>}
          <div className="cover-footer">
            <span>MEMORIAL BOOK</span>
          </div>
        </div>
      </div>
    </div>
  )
})
CoverPage.displayName = 'CoverPage'

export interface BookProject {
  id: number
  title: string
  team: string
  award: string
  desc: string
  link: string
  img: string
}

export interface EventBookData {
  title: string
  subtitle: string
  about: string
  problemStatements: string[]
  stats: {
    registrations: string
    submissions: string
    teams: string
    cities: string
  }
  images: string[]
  projects: BookProject[]
}

interface EventBookProps {
  data?: EventBookData
}

const EventBook: React.FC<EventBookProps> = ({ data }): React.JSX.Element => {
  const book = useRef<PageFlipInstance | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [selectedProj, setSelectedProj] = useState<BookProject | null>(null)

  const onPage = (e: { data: number }) => {
    setCurrentPage(e.data)
  }

  const defaultData: EventBookData = {
    title: "NOVA Event book",
    subtitle: "UI Hackathon 2024",
    about: "An AI-powered UI building hackathon where visionary aspirants competed to design and develop the most innovative user interfaces using modern tech stacks.",
    problemStatements: [
      "Interactive Dashboard for Smart Cities",
      "AI-Driven Learning Management System",
      "Sustainable E-commerce UX Design",
      "Community Safety & Alert Platform",
      "Health-Tech Patient Monitoring",
      "FinTech Wealth Management Interface"
    ],
    stats: {
      registrations: "300+",
      submissions: "120+",
      teams: "80+",
      cities: "12+"
    },
    images: [
      cert1,
      cert2,
      cert3,
      cert4,
      group2
    ],
    projects: [
      { id: 1, title: "FOCUS FLOW", team: "Rubix", award: "FULLSTACK Winner", desc: "A distraction-free productivity workspace featuring an AI-powered assistant and focus analytics.", link: "https://foocusflow.vercel.app/", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500" },
      { id: 2, title: "STUDY NSQUARE", team: "N^2", award: "FULLSTACK RunnerUp", desc: "An innovative educational platform designed to enhance learning experiences and collaboration.", link: "https://study-nsquare-ifdh.vercel.app", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=500" },
      { id: 3, title: "HABIT FLOW", team: "SOLAR WAVES", award: "FRONTEND Winner", desc: "A smart habit tracker designed for students to build better habits through gamification.", link: "https://routine-bliss-hub.lovable.app/", img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=500" },
      { id: 4, title: "INCOIS SAMACHAR", team: "THE_SHIP", award: "FRONTEND RunnerUp", desc: "A comprehensive coastal hazard monitoring system providing real-time safety alerts.", link: "https://incois-samachar.vercel.app/", img: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=500" }
    ]
  }

  const bookData = data || defaultData

  // Stable page elements to prevent removeChild errors on state changes
  const memoPages = React.useMemo(() => [
    <CoverPage key="p1" title={bookData.title} logo="/images/hero/NOVA LOGo.jpg" />,
    
    <Page key="p2" number="2">
      <div className="about-page">
        <h2 className="page-title">I. NOVATHON</h2>
        <p className="event-description">{bookData.about}</p>
        <div className="event-poster-container">
          <img src={poster} alt="NOVATHON Poster" className="event-poster-img" />
        </div>
      </div>
    </Page>,

    <Page key="p3" number="3">
      <div className="problems-page">
        <h2 className="page-title">The Challenge</h2>
        <div className="problem-statements">
          <ul>
            {bookData.problemStatements.map((ps, i) => (
              <li key={i}>{ps}</li>
            ))}
          </ul>
        </div>
      </div>
    </Page>,

    <Page key="p4" number="4">
      <div className="stats-page">
        <h2 className="page-title">Stats</h2>
        <p className="mini-desc">NOVATHON 2024 witnessed an unprecedented gathering of creative minds from across the region. With over 300 registrations and nearly 100 final submissions, the event pushed the boundaries of what's possible in a 30-hour design sprint. These numbers represent the dedication and passion of every participant who turned a vision into reality.</p>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{bookData.stats.registrations}</span>
            <span className="stat-label">Regs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{bookData.stats.submissions}</span>
            <span className="stat-label">Subs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{bookData.stats.teams}</span>
            <span className="stat-label">Teams</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{bookData.stats.cities}</span>
            <span className="stat-label">Cities</span>
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p5" number="5">
      <div className="gallery-page">
        <h2 className="page-title">Memories I</h2>
        <div className="gallery-full">
          <div className="full-item">
            <img src={cert1} alt="Ceremony 1" loading="lazy" />
          </div>
          <div className="full-item">
            <img src={cert2} alt="Ceremony 2" loading="lazy" />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p6" number="6">
      <div className="gallery-page">
        <h2 className="page-title">Memories II</h2>
        <div className="gallery-full">
          <div className="full-item">
            <img src={cert3} alt="Ceremony 3" loading="lazy" />
          </div>
          <div className="full-item">
            <img src={cert4} alt="Ceremony 4" loading="lazy" />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p7" number="7">
      <div className="gallery-page">
        <h2 className="page-title">The Collective</h2>
        <div className="gallery-full">
          <div className="full-item">
            <img src={group2} alt="Group Collective" loading="lazy" />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p8" number="8">
      <div className="winners-page">
        <h2 className="page-title">Hall of Fame</h2>
        <div className="winners-list dense">
          {bookData.projects.map((proj, i) => (
            <div key={i} className="winner-row mini">
              <div className="winner-medal">
                <i className="fas fa-trophy" style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#00C896', fontSize: '1.2rem' }}></i>
              </div>
              <div className="winner-details">
                <h4>{proj.team}</h4>
                <p>{proj.award}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>,

    <Page key="p9" number="9">
      <div className="projects-page">
        <h2 className="page-title">The Innovators</h2>
        <p className="mini-desc">Out of many incredible submissions, these four projects stood out for their exceptional blend of technical complexity and user-centric design. From AI-driven productivity tools to high-impact monitoring systems, these innovators demonstrated the true power of UI/UX in solving real-world challenges. Explore the future of digital experiences through their brilliant work.</p>
        <div className="projects-showcase interactive dense-grid">
          {bookData.projects.map((proj, i) => (
            <div key={i} className="book-project-card interaction mini">
              <div className="project-header">
                <h4>{proj.title} <span className="team-tag">{proj.team}</span></h4>
              </div>
              <div className="project-actions">
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="book-btn primary">
                  <i className="fas fa-external-link-alt"></i> VIEW FULL
                </a>
                <button className="book-btn secondary" onClick={() => setSelectedProj(proj)}>
                  <i className="fas fa-info-circle"></i> DESCRIPTION
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>,

    <Page key="p10" number="10">
      <div className="about-page">
        <h2 className="page-title">II. DECODE SESSION</h2>
        <div className="event-poster-container" style={{ marginTop: '20px' }}>
          <img src={decodePoster} alt="Decode Session Poster" className="event-poster-img" />
        </div>
      </div>
    </Page>,

    <Page key="p11" number="11">
      <div className="about-page">
        <h2 className="page-title">The Walkthrough</h2>
        <div className="event-description-container" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
          <p className="event-description" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            Get an exclusive walkthrough of the NOVATHON winning projects!
          </p>
          <p className="event-description" style={{ fontSize: '1rem', marginTop: '10px', color: 'rgba(255,255,255,0.8)' }}>
            A crisp, high-energy session designed to answer participant curiosity and share real development insights.
          </p>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '100px' }}>
              <img src={decodeImg1} alt="Decode 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '100px' }}>
              <img src={decodeImg2} alt="Decode 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p12" number="12">
      <div className="gallery-page">
        <h2 className="page-title">Team Rubix</h2>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg4} alt="Decode 4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small"style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg3} alt="Decode 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg9} alt="Decode 9" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg10} alt="Decode 10" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p13" number="13">
      <div className="gallery-page">
        <h2 className="page-title">Team N^2</h2>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg12} alt="Decode 12" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg11} alt="Decode 11" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg13} alt="Decode 13" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg14} alt="Decode 14" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p14" number="14">
      <div className="gallery-page">
        <h2 className="page-title">Team Solar Waves</h2>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg15} alt="Decode 15" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg16} alt="Decode 16" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg17} alt="Decode 17" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg18} alt="Decode 18" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p15" number="15">
      <div className="gallery-page">
        <h2 className="page-title">Team The_Ship</h2>
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg19} alt="Decode 19" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg20} alt="Decode 20" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
            <img src={decodeImg21} alt="Decode 21" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="gallery-item-small" style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', gridColumn: 'span 2' }}>
            <img src={decodeImg22} alt="Decode 22" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p16" number="16">
      <div className="about-page">
        <h2 className="page-title">III. CODE-A-THON</h2>
        <div className="event-poster-container" style={{ marginTop: '20px' }}>
          <img src={codeathonPoster} alt="Code-a-thon Poster" className="event-poster-img" style={{ borderRadius: '15px' }} />
        </div>
      </div>
    </Page>,

    <Page key="p17" number="17">
      <div className="about-page">
        <h2 className="page-title">The Challenge</h2>
        <div className="event-description-container" style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
          <p className="event-description" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            NOVA Club x Forge Alumnus brings you the Preliminary Round of a Microsoft-associated Code-a-thon, a high-energy challenge built around AI-powered real-world problem solving. 💻✨
          </p>
          <p className="event-description" style={{ fontSize: '0.95rem', marginTop: '10px', color: '#00C896' }}>
            Top performers get a chance to move forward to the Code-a-thon at the Microsoft Office! 🔥
          </p>
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>🎁 Participant Highlights:</p>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              <li style={{ marginBottom: '5px' }}><i className="fas fa-star" style={{ color: '#ffd700', marginRight: '8px' }}></i> Microsoft campus experience</li>
              <li style={{ marginBottom: '5px' }}><i className="fas fa-star" style={{ color: '#ffd700', marginRight: '8px' }}></i> Resume & career-focused sessions</li>
              <li style={{ marginBottom: '5px' }}><i className="fas fa-star" style={{ color: '#ffd700', marginRight: '8px' }}></i> Corporate networking</li>
              <li style={{ marginBottom: '5px' }}><i className="fas fa-star" style={{ color: '#ffd700', marginRight: '8px' }}></i> Certificates & monetary rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p18" number="18">
      <div className="gallery-page">
        <h2 className="page-title">Lab Insights I</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', height: '100%' }}>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={event3Img1} alt="Event 3" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ height: '150px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={event3Img2} alt="Event 3" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={event3Img3} alt="Event 3" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p19" number="19">
      <div className="gallery-page">
        <h2 className="page-title">Lab Insights II</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', height: '100%' }}>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={event3Img4} alt="Event 3" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={event3Img5} alt="Event 3" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </Page>,

    <Page key="p20" number="20">
      <div className="about-page">
        <h2 className="page-title">The Finalists</h2>
        <div className="event-poster-container" style={{ marginTop: '20px' }}>
          <img src={finalistsImg} alt="Finalists Group" className="event-poster-img" style={{ borderRadius: '15px', width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', background: 'rgba(255,255,255,0.03)' }} />
        </div>
        <p className="event-description" style={{ fontSize: '0.95rem', marginTop: '15px', textAlign: 'center', color: '#00C896' }}>
          Congratulations to the brilliant minds heading to the finals! 🚀
        </p>
      </div>
    </Page>,

    <Page key="p21" number="21">
      <div className="winners-page center">
        <h2 className="page-title">The Winners</h2>
        <div className="event-poster-container" style={{ marginTop: '20px' }}>
          <img src={winnersImg} alt="Winners Group" className="event-poster-img" style={{ borderRadius: '15px', width: '100%', height: 'auto', maxHeight: '320px', objectFit: 'contain', background: 'rgba(255,255,255,0.03)' }} />
        </div>
        <p style={{ fontSize: '1rem', marginTop: '15px', textAlign: 'center', color: '#ffd700', fontWeight: 'bold' }}>
          Congratulations to the Champions! 🏆
        </p>
      </div>
    </Page>,

    <Page key="p22" number="22">
      <div className="winners-page center">
        <h2 className="page-title">Thank You</h2>
        <div className="thanks-content" style={{ textAlign: 'center', padding: '0 20px' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
            A heartfelt thank you to our distinguished judges, sponsors, and the tireless NOVA organizing team.
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.8 }}>
            Your support made this 30-hour marathon of innovation possible. Together, we are building the future of UI.
          </p>
        </div>
      </div>
    </Page>,

    <Page key="p23" number="23">
      <div className="winners-page center">
        <div className="end-badge">
          <i className="fas fa-heart" style={{ color: '#ff1493' }}></i>
          <span>THANKS TO ALL ASPIRANTS</span>
        </div>
        <p className="mini-desc" style={{ textAlign: 'center', marginTop: '1rem' }}>
          Your innovation fuels the stars. See you in the next NOVATHON.
        </p>
      </div>
    </Page>,

    <CoverPage key="p24" title="FIN" subtitle="The End of the Beginning" density="hard" />
  ], [bookData])

  return (
    <div className="event-book-wrapper">
      <div className="flipbook-container">
        <HTMLFlipBook
          width={400}
          height={400}
          size="stretch"
          minWidth={280}
          maxWidth={800}
          minHeight={250}
          maxHeight={500}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onPage}
          className="novathon-book"
          ref={book}
          key="novathon-flipbook-v1"
        >
          {memoPages}
        </HTMLFlipBook>
      </div>

      <div className="book-controls">
        <button 
          onClick={() => {
            if (book.current) {
              book.current.pageFlip().flipPrev()
            }
          }} 
          className="nav-btn btn-prev"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="page-indicator">Page {currentPage + 1} of {memoPages.length}</span>
        <button 
          onClick={() => {
            if (book.current) {
              book.current.pageFlip().flipNext()
            }
          }} 
          className="nav-btn btn-next"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Project Description Modal */}
      {selectedProj && (
        <div className="book-modal-overlay" onClick={() => setSelectedProj(null)}>
          <div className="book-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProj(null)}>
              <i className="fas fa-times"></i>
            </button>
            <h3>{selectedProj.title}</h3>
            <div className="team-badge" style={{ marginBottom: '15px' }}>{selectedProj.team} • {selectedProj.award}</div>
            <p>{selectedProj.desc}</p>
            <div className="project-actions">
              <a href={selectedProj.link} target="_blank" rel="noopener noreferrer" className="book-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fas fa-external-link-alt"></i> VISIT PROJECT
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventBook
