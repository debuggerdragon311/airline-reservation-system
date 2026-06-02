/**
 * @fileoverview Flights.jsx
 * Main flight search interface featuring a custom glassmorphic UI,
 * custom cursor tracking, and an animated slide-out side menu.
 */

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  PlaneTakeoff, PlaneLanding, ChevronRight, ArrowRight,
  Clock, Users, Briefcase, AlertCircle, Loader2, Search,
  CheckCircle2, XCircle, Timer, ChevronDown, UserCircle, Check
} from 'lucide-react'
import client from '../api/client'
import toast from 'react-hot-toast'

/* ==========================================================================
   CONSTANTS & CONFIGURATION
   ========================================================================== */

/**
 * Maps IATA airport codes to their corresponding city names.
 * @type {Record<string, string>}
 */
const CITY_MAP = {
  DEL: 'New Delhi', BOM: 'Mumbai', CCU: 'Kolkata',
  MAA: 'Chennai',   BLR: 'Bengaluru', HYD: 'Hyderabad',
}

/**
 * Available trip types for the search tabs.
 * @type {string[]}
 */
const TRIP_TABS = ['ROUND TRIP', 'ONE WAY', 'MULTI CITY']

/**
 * Configuration for the slide-out navigation menu sections.
 * @type {Array<{title: string, links: string[]}>}
 */
const SIDE_MENU_GROUPS = [
  {
    title: 'Plan & Book',
    links: ['Book a Flight', 'Hotels & Accommodation', 'Car Rentals', 'Tour Packages']
  },
  {
    title: 'Manage Travel',
    links: ['My Trips', 'Online Check-in', 'Flight Status', 'Add Baggage']
  },
  {
    title: 'Information',
    links: ['Baggage Allowances', 'Airport Lounges', 'Visa Requirements']
  }
]

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Calculates and formats the duration between two timestamps.
 * @param {string|Date} departure - The departure time.
 * @param {string|Date} arrival - The arrival time.
 * @returns {string} Formatted duration (e.g., "2h 30m").
 */
function calculateDuration(departure, arrival) {
  const diffInMs = new Date(arrival) - new Date(departure)
  const diffInMinutes = diffInMs / 60000
  const hours = Math.floor(diffInMinutes / 60)
  const minutes = diffInMinutes % 60
  return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim()
}

/**
 * Formats an ISO date string into a local time string (Asia/Kolkata).
 * @param {string|Date} isoString - The date string to format.
 * @returns {string} Formatted time (e.g., "14:30").
 */
function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false, 
    timeZone: 'Asia/Kolkata',
  })
}

/**
 * Formats a numeric price into INR currency.
 * @param {number} price - The raw price value.
 * @returns {string} Formatted currency string (e.g., "₹5,000").
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(price)
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

/**
 * Renders a visual status badge for a flight.
 * @param {Object} props
 * @param {'SCHEDULED'|'BOARDING'|'DEPARTED'|'LANDED'|'CANCELLED'} props.status - Flight status.
 */
function StatusBadge({ status }) {
  const STATUS_CONFIG = {
    SCHEDULED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Scheduled' },
    BOARDING:  { color: 'bg-amber-50 text-amber-700 border-amber-200',       icon: Timer,        label: 'Boarding'  },
    DEPARTED:  { color: 'bg-blue-50 text-blue-700 border-blue-200',          icon: PlaneTakeoff, label: 'Departed'  },
    LANDED:    { color: 'bg-gray-50 text-gray-600 border-gray-200',          icon: PlaneLanding, label: 'Landed'    },
    CANCELLED: { color: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle,      label: 'Cancelled' },
  }
  
  const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED
  const Icon = currentStatus.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
      <Icon size={11} />{currentStatus.label}
    </span>
  )
}

/**
 * Renders a loading skeleton placeholder for flight cards.
 */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-6 bg-gray-100 rounded w-16" />
        </div>
        <div className="flex-1 mx-8">
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gray-100 rounded w-16" />
            <div className="flex-1 h-px bg-gray-100" />
            <div className="h-8 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-8 bg-gray-100 rounded w-28" />
        </div>
      </div>
    </div>
  )
}

/**
 * Displays details for a single flight option.
 * @param {Object} props
 * @param {Object} props.flight - The flight data object.
 */
function FlightCard({ flight }) {
  const departureTime = formatTime(flight.departureTime)
  const arrivalTime = formatTime(flight.arrivalTime)
  const durationStr = calculateDuration(flight.departureTime, flight.arrivalTime)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 w-40">
            <div className="w-10 h-10 rounded-xl bg-[#0A1628] flex items-center justify-center flex-shrink-0">
              <PlaneTakeoff size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">AeroBook</p>
              <p className="text-sm font-bold text-gray-900 font-mono">{flight.flightNumber}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{departureTime}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{flight.origin}</p>
              <p className="text-xs text-gray-400">{CITY_MAP[flight.origin] || ''}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400 font-medium">{durationStr}</p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-gray-200" />
                <PlaneTakeoff size={14} className="text-[#2563EB]" />
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <p className="text-xs text-gray-400">Direct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{arrivalTime}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{flight.destination}</p>
              <p className="text-xs text-gray-400">{CITY_MAP[flight.destination] || ''}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[100px]">
            <StatusBadge status={flight.status} />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={11} /><span>{flight.totalSeats} seats</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 pl-4 border-l border-gray-100">
            <div>
              <p className="text-xs text-gray-400 text-right">from</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatPrice(flight.basePrice)}</p>
            </div>
            <button className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Select<ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 py-[14px] bg-gray-50 border-t border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Briefcase size={12} /><span>Economy · Business available</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} /><span>On-time performance · 94%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom interactive cursor with a solid center dot and expanding frosted glass ring.
 * Disables the default browser cursor via injected styles.
 */
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      
      // Determine if the user is hovering over an interactive element
      const target = e.target
      const isClickable = 
        target.closest('button, a, input, select, .cursor-pointer') !== null ||
        window.getComputedStyle(target).cursor === 'pointer'
        
      setIsHovering(isClickable)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      
      {/* Outer frosted ring */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-full transition-all duration-300 ease-out flex items-center justify-center"
        style={{
          left: pos.x, top: pos.y,
          width: isHovering ? '64px' : '36px', 
          height: isHovering ? '64px' : '36px',
          border: isHovering ? 'none' : '1.5px solid rgba(26,26,46,0.6)',
          backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
          transform: 'translate(-50%, -50%)',
          backdropFilter: isHovering ? 'blur(4px)' : 'none',
          boxShadow: isHovering ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
        }}
      />
      
      {/* Inner solid tracking dot */}
      <div
        className="fixed pointer-events-none z-[10000] rounded-full transition-transform duration-200"
        style={{
          left: pos.x, top: pos.y, 
          width: '8px', height: '8px',
          backgroundColor: '#A53F3F', // Brand primary color
          transform: `translate(-50%, -50%) scale(${isHovering ? 0 : 1})`,
        }}
      />
    </>
  )
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

/**
 * Main Flight Search Page.
 * Handles URL parameters, flight fetching, and complex UI layouts.
 */
export default function Flights() {
  // Routing & Parameters
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Form State
  const [origin, setOrigin]           = useState(searchParams.get('origin') || '')
  const [destination, setDestination] = useState(searchParams.get('destination') || '')
  const [date, setDate]               = useState(searchParams.get('date') || '')
  const [seatClass, setSeatClass]     = useState(searchParams.get('seatClass') || 'ECONOMY')
  const [tripType, setTripType]       = useState('ROUND TRIP')
  
  // UI Interaction State
  const [isMenuOpen, setIsMenuOpen]   = useState(false)
  const [isCabinOpen, setIsCabinOpen] = useState(false)
  
  // Data State
  const [flights, setFlights]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState(null)

  // References
  const cabinRef = useRef(null)

  // Fetch flights on initial load if params are present
  useEffect(() => {
    const initialOrigin = searchParams.get('origin')
    const initialDest = searchParams.get('destination')
    const initialDate = searchParams.get('date')
    
    if (initialOrigin && initialDest && initialDate) {
      fetchFlights(initialOrigin, initialDest, initialDate)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle outside clicks to close the custom dropdown menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (cabinRef.current && !cabinRef.current.contains(event.target)) {
        setIsCabinOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [cabinRef])

  /**
   * Executes the API call to search for flights.
   * @param {string} originCode - 3-letter IATA code.
   * @param {string} destCode - 3-letter IATA code.
   * @param {string} flightDate - YYYY-MM-DD date string.
   */
  async function fetchFlights(originCode, destCode, flightDate) {
    setLoading(true)
    setError(null)
    setSearched(false)
    
    try {
      const { data } = await client.get('/flights/search', { 
        params: { origin: originCode, destination: destCode, date: flightDate } 
      })
      setFlights(data)
      setSearched(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch flights. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally { 
      setLoading(false) 
    }
  }

  /**
   * Form submission handler. Validates and updates URL parameters.
   */
  function handleSearch(e) {
    e.preventDefault()
    if (!origin || !destination || !date) { 
      toast.error('Please fill in all search fields.')
      return 
    }
    
    setSearchParams({ origin, destination, date, seatClass })
    fetchFlights(origin, destination, date)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f0f2f5] relative">
      <CustomCursor />

      {/* ── HERO SECTION & BACKGROUND ── */}
      <div className="relative w-full h-full">
        <img 
          src="/hero.jpeg" 
          alt="AeroBook Flights Background" 
          className="absolute inset-0 w-full h-full object-cover" 
          style={{ objectPosition: 'center 50%' }} 
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.58) 28%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 85%)' }}
        />

        {/* ── TOP NAVIGATION BAR ── */}
        <nav
          className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between transition-all duration-500"
          style={{ paddingLeft: '55px', paddingRight: '55px', paddingTop: '62.3px' }}
        >
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#A53F3F] rounded-lg flex items-center justify-center">
              <PlaneTakeoff size={16} className="text-white" />
            </div>
            <span className="text-[1.2rem] font-black text-[#0A1628] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              AEROBOOK
            </span>
          </div>

          <div className="flex items-center gap-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            {/* Primary Nav Links (Fades out when Side Panel is active) */}
            <div className={`hidden md:flex items-center gap-8 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {['MILES&SMILES', 'FLY DIFFERENT', 'OFFER&DEST'].map(item => (
                <button key={item} className="text-[12px] font-black text-black hover:opacity-70 tracking-[0.12em] uppercase transition-opacity">
                  {item}
                </button>
              ))}
              <button className="flex items-center gap-1.5 text-[12px] font-black text-black hover:opacity-70 tracking-[0.12em] uppercase transition-opacity">
                <Search size={14} strokeWidth={3} />SEARCH
              </button>
            </div>
            
            {/* Animated Hamburger Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-11 h-11 flex flex-col items-center justify-center gap-[6px] transition-all duration-500 ease-in-out ${
                isMenuOpen 
                  ? 'rotate-90 bg-transparent'
                  : 'bg-white/40 backdrop-blur-md hover:bg-white/70'
              }`}
            >
              <span className="w-[20px] h-[2.5px] bg-black" />
              <span className="w-[20px] h-[2.5px] bg-black" />
              <span className="w-[20px] h-[2.5px] bg-black" />
            </button>
          </div>
        </nav>

        {/* ── SIDE PANEL OVERLAY BACKDROP ── */}
        <div 
          onClick={() => setIsMenuOpen(false)}
          className={`fixed inset-0 bg-[#0A1628]/30 backdrop-blur-md z-[40] transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* ── SLIDE-OUT SIDE PANEL ── */}
        <div 
          className={`fixed top-0 right-0 h-full w-[400px] bg-white/70 backdrop-blur-2xl border-l border-white/50 shadow-2xl z-[50] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pt-[140px] px-12 overflow-y-auto ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* User Account Section */}
          <div className="flex items-center gap-4 pb-8 border-b border-gray-300/50 mb-8 cursor-pointer group">
            <div className="w-12 h-12 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <UserCircle size={24} />
            </div>
            <div>
              <p className="text-[12px] font-extrabold text-gray-500 tracking-widest uppercase">Sign In</p>
              <p className="text-[16px] font-bold text-[#1a1a2e] mt-0.5">Miles & Smiles</p>
            </div>
          </div>

          {/* Dynamic Link Groups */}
          <div className="flex flex-col gap-10">
            {SIDE_MENU_GROUPS.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase mb-5">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-4">
                  {group.links.map((link, lIdx) => (
                    <a href="#" key={lIdx} className="text-[18px] font-bold text-[#1a1a2e] hover:text-[#A53F3F] hover:translate-x-1.5 transition-all duration-200">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Utility Links */}
          <div className="mt-16 pt-8 border-t border-gray-300/50 pb-12 flex items-center justify-between text-[12px] font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-[#1a1a2e] transition-colors">Help Center</a>
            <a href="#" className="hover:text-[#1a1a2e] transition-colors">EN · USD</a>
          </div>
        </div>

        {/* ── MAIN SEARCH WIDGET (HEADLINE + FORM) ── */}
        <div 
          className="absolute z-20 flex flex-col gap-10"
          style={{ top: '60%', transform: 'translateY(-50%)', left: '55px', width: 'calc(100% - 110px)', maxWidth: '1100px' }}
        >
          {/* Typography / Hero Text */}
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.05 }}>
            <p className="text-[3rem] font-bold text-[#1a1a2e] tracking-tight">WHERE</p>
            <p className="text-[3rem] font-bold text-[#1a1a2e] tracking-tight">DO YOU WANT TO</p>
            <p className="font-black text-[#0A1628] tracking-tight" style={{ fontSize: '6.8rem', lineHeight: 1 }}>
              EXPLORE
            </p>
          </div>

          {/* Search Box Container */}
          <div className="w-full">
            <form onSubmit={handleSearch}>
              
              {/* Trip Type Tabs */}
              <div className="flex gap-[2px] mb-[2px]">
                {TRIP_TABS.map(t => (
                  <button key={t} type="button" onClick={() => setTripType(t)}
                  className={`px-6 py-3.5 text-[12px] font-extrabold tracking-widest uppercase transition-colors ${
                    tripType === t
                    ? 'text-[#1a1a2e] bg-white/80 backdrop-blur-md' 
                    : 'text-gray-700 hover:text-[#1a1a2e] bg-white/30 hover:bg-white/50 backdrop-blur-md'
                  }`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Input Fields Row */}
              <div className="flex items-stretch gap-[2px]">
                
                {/* Input: Origin */}
                <div className="flex-1 px-8 py-6 bg-white/50 backdrop-blur-md hover:bg-white/70 transition-colors cursor-pointer min-w-0">
                  <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Where?</p>
                  <input type="text" value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())}
                    placeholder="Your Destination" maxLength={3}
                    className="w-full text-[17px] font-bold text-[#1a1a2e] placeholder-gray-600 bg-transparent outline-none" />
                  {origin && CITY_MAP[origin] && <p className="text-[12px] font-semibold text-gray-700 mt-1">{CITY_MAP[origin]}</p>}
                </div>

                {/* Input: Destination */}
                <div className="flex-1 px-8 py-6 bg-white/50 backdrop-blur-md hover:bg-white/70 transition-colors cursor-pointer min-w-0">
                  <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">From</p>
                  <input type="text" value={destination} onChange={e => setDestination(e.target.value.toUpperCase())}
                    placeholder="Amsterdam Schiphol - AMS" maxLength={3}
                    className="w-full text-[17px] font-bold text-[#1a1a2e] placeholder-gray-600 bg-transparent outline-none" />
                  {destination && CITY_MAP[destination] && <p className="text-[12px] font-semibold text-gray-700 mt-1">{CITY_MAP[destination]}</p>}
                </div>

                {/* Input: Date */}
                <div className="flex-1 px-8 py-6 bg-white/50 backdrop-blur-md hover:bg-white/70 transition-colors cursor-pointer min-w-0">
                  <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Date</p>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full text-[17px] font-bold text-[#1a1a2e] bg-transparent outline-none cursor-pointer" />
                </div>

                {/* Custom Cabin Class Dropdown */}
                <div 
                  ref={cabinRef}
                  className="relative flex-1 px-8 py-6 bg-white/50 backdrop-blur-md hover:bg-white/70 transition-colors cursor-pointer min-w-0 select-none"
                  onClick={() => setIsCabinOpen(!isCabinOpen)}
                >
                  <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Cabin</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-bold text-[#1a1a2e]">
                      {seatClass === 'ECONOMY' ? 'Economy' : 'Business'}
                    </span>
                    <ChevronDown size={16} className={`text-gray-700 transition-transform duration-300 ${isCabinOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Options Panel */}
                  <div 
                    className={`absolute left-0 top-full mt-[2px] w-full bg-white/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-200 z-50 origin-top ${
                      isCabinOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
                    }`}
                  >
                    {['ECONOMY', 'BUSINESS'].map((opt) => (
                      <div 
                        key={opt}
                        onClick={() => setSeatClass(opt)}
                        className={`px-6 py-4 flex items-center justify-between hover:bg-white/60 transition-colors ${
                          seatClass === opt ? 'bg-white/40' : ''
                        }`}
                      >
                        <span className={`text-[15px] ${seatClass === opt ? 'font-bold text-[#1a1a2e]' : 'font-semibold text-gray-600'}`}>
                          {opt === 'ECONOMY' ? 'Economy' : 'Business'}
                        </span>
                        {seatClass === opt && <Check size={16} className="text-[#A53F3F]" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button type="submit" disabled={loading}
                  className="w-[88px] flex items-center justify-center bg-[#2b323c] hover:bg-[#1a1a2e] text-white transition-colors disabled:opacity-60 flex-shrink-0">
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                </button>
              </div>
            </form>

            {/* Quick Links Row */}
            <div className="flex gap-[2px] mt-[2px]">
              {[
                { icon: CheckCircle2, label: 'Check-in' },
                { icon: Timer,        label: 'Flight Status' },
                { icon: Briefcase,    label: 'Baggage Infor.' },
              ].map(({ icon: Icon, label }) => (
                <button key={label}
                  className="flex items-center gap-2 px-8 py-[18px] bg-white/30 backdrop-blur-md text-[13px] font-bold text-gray-800 hover:text-[#1a1a2e] hover:bg-white/50 transition-colors group">
                  <Icon size={16} className="text-gray-700 group-hover:text-[#1a1a2e] transition-colors" />
                  {label}
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-[#1a1a2e] transition-colors ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="absolute bottom-8 left-[55px] right-[55px] z-30 flex items-center justify-between text-white text-[11px] font-bold tracking-wider uppercase drop-shadow-lg">
          <p>© {new Date().getFullYear()} AeroBook Airlines. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-200 transition-colors drop-shadow-lg">Legal Notice</a>
            <a href="#" className="hover:text-gray-200 transition-colors drop-shadow-lg">Privacy Policy</a>
            <a href="#" className="hover:text-gray-200 transition-colors drop-shadow-lg">Cookie Settings</a>
          </div>
        </div>
      </div>
    </div>
  )
}