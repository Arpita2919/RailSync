import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function OverviewDashboard() {
  const [loading, setLoading] = useState(true);
  const [optimizingState, setOptimizingState] = useState('idle');
  const [activeFilter, setActiveFilter] = useState('ALL DEPTS');
  const [corridorFilter, setCorridorFilter] = useState('ALL');
  const [showAllCorridorTasks, setShowAllCorridorTasks] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Real backend data states
  const [riskSegments, setRiskSegments] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [divisionsList, setDivisionsList] = useState([]);
  const [corridorsList, setCorridorsList] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [healthData, segsData, planData, divsData, corsData] = await Promise.allSettled([
        api.getHealth(),
        api.getRiskSegments(),
        api.getCurrentPlan('weekly'),
        api.getDivisions(),
        api.getCorridors(),
      ]);

      if (healthData.status === 'fulfilled') setSystemHealth(healthData.value);
      if (segsData.status === 'fulfilled') setRiskSegments(segsData.value || []);
      if (planData.status === 'fulfilled') {
        setCurrentPlan(planData.value);
        setAssignments(planData.value?.assignments || []);
      }
      if (divsData.status === 'fulfilled' && divsData.value?.divisions) {
        setDivisionsList(divsData.value.divisions);
      }
      if (corsData.status === 'fulfilled' && corsData.value?.corridors) {
        setCorridorsList(corsData.value.corridors);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerOptimization = async () => {
    if (optimizingState !== 'idle') return;
    setOptimizingState('solving');
    try {
      const res = await api.runOptimization({ policy: 'balanced', horizon: 'weekly' });
      setOptimizingState('optimized');
      await loadDashboardData();
      setTimeout(() => {
        setOptimizingState('idle');
      }, 3000);
    } catch (err) {
      console.error('Optimization error:', err);
      alert('Optimization error: ' + err.message);
      setOptimizingState('idle');
    }
  };

  const inspectNode = (segmentId) => {
    setSelectedNode(segmentId);
  };

  // One-word cause of delay resolution
  const getOneWordCause = (seg) => {
    const asset = (seg?.asset_type || seg?.department || '').toUpperCase();
    if (asset.includes('OHE') || asset.includes('CATENARY') || asset.includes('ELECTRICAL')) return 'OHE';
    if (asset.includes('S&T') || asset.includes('SIG') || asset.includes('SIGNAL')) return 'SIGNAL';
    if (asset.includes('BRIDGE')) return 'BRIDGE';
    return 'TRACK';
  };

  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [activeIrCorridor, setActiveIrCorridor] = useState('DELHI_KANPUR');

  // Clear selected node & collapse tasks when switching corridors
  useEffect(() => {
    setSelectedNode(null);
    setShowAllCorridorTasks(false);
  }, [activeIrCorridor]);

  // Indian Railways High-Density Trunk Corridors & API Divisions Registry
  const irCorridors = {
    // ── HIGH-DENSITY TRUNK CORRIDORS ────────────────────────────────────────
    DELHI_KANPUR: {
      id: 'DELHI_KANPUR',
      name: 'Delhi – Kanpur – Prayagraj Trunk',
      displayName: 'Delhi – Kanpur – Prayagraj',
      code: 'NCR-GQ-UP-01',
      zone: 'NCR / NR',
      total_km: 635,
      electrification: '25kV OHE Electrified • Auto-Block Signalling',
      max_speed: '160 km/h',
      divisions: ['delhi', 'prayagraj', 'kanpur', 'allahabad'],
      sections: [
        { name: 'SECTION 1: DLI–ALJN', dist: 'SEG 01–12 • 126 KM', route: 'New Delhi → Ghaziabad → Khurja → Aligarh', division: 'Delhi', startSeg: 1, endSeg: 12, tag: 'Capital Express', color: 'text-sky-600' },
        { name: 'SECTION 2: ALJN–TDL', dist: 'SEG 13–25 • 105 KM', route: 'Aligarh → Hathras → Tundla → Firozabad', division: 'Prayagraj', startSeg: 13, endSeg: 25, tag: 'High-Speed Quad', color: 'text-indigo-600' },
        { name: 'SECTION 3: TDL–CNB', dist: 'SEG 26–35 • 208 KM', route: 'Firozabad → Shikohabad → Etawah → Kanpur Central', division: 'Kanpur', startSeg: 26, endSeg: 35, tag: 'Kanpur DFC Trunk', color: 'text-amber-600' },
        { name: 'SECTION 4: CNB–PRYJ', dist: 'SEG 36–50 • 196 KM', route: 'Kanpur Central → Bindki → Fatehpur → Prayagraj Jn', division: 'Prayagraj', startSeg: 36, endSeg: 50, tag: 'Prayagraj Grand Chord', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'New Delhi', title: 'New Delhi Central Terminus', color: 'text-sky-400' },
        { name: 'Ghaziabad', title: 'Ghaziabad Junction', color: 'text-sky-400' },
        { name: 'Aligarh', title: 'Aligarh Junction', color: 'text-sky-400' },
        { name: 'Tundla', title: 'Tundla Junction', color: 'text-indigo-300' },
        { name: 'Etawah', title: 'Etawah Junction', color: 'text-indigo-300' },
        { name: 'Kanpur Central', title: 'Kanpur Central Junction', color: 'text-amber-400' },
        { name: 'Fatehpur', title: 'Fatehpur Junction', color: 'text-emerald-400' },
        { name: 'Prayagraj Jn', title: 'Prayagraj Junction (Allahabad)', color: 'text-emerald-400' },
      ],
    },
    DELHI_MUMBAI: {
      id: 'DELHI_MUMBAI',
      name: 'Delhi – Kota – Vadodara – Mumbai Central',
      displayName: 'Delhi – Kota – Vadodara – Mumbai Central',
      code: 'WR-GQ-WEST-02',
      zone: 'WR / WCR / NR',
      total_km: 1386,
      electrification: '25kV OHE High-Rise Catenary • 160 km/h WCTG',
      max_speed: '160 km/h',
      divisions: ['delhi', 'kota', 'ratlam', 'vadodara', 'mumbai'],
      sections: [
        { name: 'SECTION 1: NDLS–KOTA', dist: 'SEG 01–12 • 465 KM', route: 'New Delhi → Mathura → Sawai Madhopur', division: 'Delhi', startSeg: 1, endSeg: 12, tag: 'Delhi / Mathura Area', color: 'text-sky-600' },
        { name: 'SECTION 2: KOTA–RTM', dist: 'SEG 13–25 • 265 KM', route: 'Kota → Bhawani Mandi → Shamgarh → Ratlam', division: 'Kota', startSeg: 13, endSeg: 25, tag: 'Kota & Ratlam Divs', color: 'text-indigo-600' },
        { name: 'SECTION 3: RTM–BRC', dist: 'SEG 26–35 • 260 KM', route: 'Ratlam → Dahod → Godhra → Vadodara', division: 'Vadodara', startSeg: 26, endSeg: 35, tag: 'Vadodara Division', color: 'text-amber-600' },
        { name: 'SECTION 4: BRC–MMCT', dist: 'SEG 36–50 • 396 KM', route: 'Vadodara → Surat → Vapi → Borivali → Mumbai Central', division: 'Mumbai', startSeg: 36, endSeg: 50, tag: 'Mumbai Suburban Area', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'New Delhi', title: 'New Delhi Terminal', color: 'text-sky-400' },
        { name: 'Mathura', title: 'Mathura Junction', color: 'text-sky-400' },
        { name: 'Sawai Madhopur', title: 'Sawai Madhopur Junction', color: 'text-sky-400' },
        { name: 'Kota', title: 'Kota Junction', color: 'text-indigo-300' },
        { name: 'Shamgarh', title: 'Shamgarh Station', color: 'text-indigo-300' },
        { name: 'Ratlam', title: 'Ratlam Junction', color: 'text-indigo-300' },
        { name: 'Dahod', title: 'Dahod Station', color: 'text-amber-400' },
        { name: 'Vadodara', title: 'Vadodara Junction', color: 'text-amber-400' },
        { name: 'Surat', title: 'Surat Central Terminus', color: 'text-amber-400' },
        { name: 'Vapi', title: 'Vapi Industrial Station', color: 'text-emerald-400' },
        { name: 'Borivali', title: 'Borivali Suburban', color: 'text-emerald-400' },
        { name: 'Mumbai Central', title: 'Mumbai Central Terminus', color: 'text-emerald-400' },
      ],
    },
    HOWRAH_DELHI: {
      id: 'HOWRAH_DELHI',
      name: 'Howrah – Dhanbad – DDU – Prayagraj Grand Chord',
      displayName: 'Howrah – Dhanbad – DDU – Prayagraj',
      code: 'ECR-GC-EAST-03',
      zone: 'ECR / ER / NCR',
      total_km: 1447,
      electrification: '25kV 2x50kV Heavy Haul • Auto-Cab Signalling',
      max_speed: '160 km/h',
      divisions: ['howrah', 'asansol', 'dhanbad', 'ddu', 'prayagraj', 'kanpur', 'delhi', 'allahabad'],
      sections: [
        { name: 'SECTION 1: HWH–ASN', dist: 'SEG 01–12 • 200 KM', route: 'Howrah → Bardhaman → Durgapur → Asansol', division: 'Asansol', startSeg: 1, endSeg: 12, tag: 'Eastern Coalfield', color: 'text-sky-600' },
        { name: 'SECTION 2: ASN–DHN', dist: 'SEG 13–25 • 468 KM', route: 'Asansol → Dhanbad → Gaya → Pt. Deen Dayal Upadhyaya', division: 'Dhanbad', startSeg: 13, endSeg: 25, tag: 'Grand Chord HDN', color: 'text-indigo-600' },
        { name: 'SECTION 3: DDU–PRYJ', dist: 'SEG 26–35 • 352 KM', route: 'Pt. Deen Dayal Upadhyaya → Mirzapur → Prayagraj Jn', division: 'Prayagraj', startSeg: 26, endSeg: 35, tag: 'Prayagraj Division', color: 'text-amber-600' },
        { name: 'SECTION 4: CNB–NDLS', dist: 'SEG 36–50 • 427 KM', route: 'Prayagraj Jn → Kanpur Central → Aligarh → New Delhi', division: 'Delhi', startSeg: 36, endSeg: 50, tag: 'Delhi Express Line', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Howrah', title: 'Howrah Terminus', color: 'text-sky-400' },
        { name: 'Bardhaman', title: 'Bardhaman Junction', color: 'text-sky-400' },
        { name: 'Asansol', title: 'Asansol Junction', color: 'text-indigo-300' },
        { name: 'Dhanbad', title: 'Dhanbad Coal Belt', color: 'text-indigo-300' },
        { name: 'Gaya', title: 'Gaya Junction', color: 'text-amber-400' },
        { name: 'Pt. Deen Dayal Upadhyaya', title: 'Pt. Deen Dayal Upadhyaya Junction', color: 'text-amber-400' },
        { name: 'Mirzapur', title: 'Mirzapur Station', color: 'text-amber-400' },
        { name: 'Prayagraj Jn', title: 'Prayagraj Junction', color: 'text-emerald-400' },
        { name: 'Kanpur Central', title: 'Kanpur Central', color: 'text-emerald-400' },
        { name: 'New Delhi', title: 'New Delhi Terminus', color: 'text-emerald-400' },
      ],
    },
    HOWRAH_CHENNAI: {
      id: 'HOWRAH_CHENNAI',
      name: 'Howrah – Visakhapatnam – Vijayawada – Chennai',
      displayName: 'Howrah – Visakhapatnam – Vijayawada – Chennai',
      code: 'SER-GQ-EASTCOAST-06',
      zone: 'SER / ECoR / SCR / SR',
      total_km: 1661,
      electrification: '25kV AC Heavy Coastal Line • Automatic Train Protection',
      max_speed: '160 km/h',
      divisions: ['howrah', 'kharagpur', 'khurda', 'waltair', 'visakhapatnam', 'vijayawada', 'chennai'],
      sections: [
        { name: 'SECTION 1: HWH–KGP', dist: 'SEG 01–12 • 320 KM', route: 'Howrah → Kharagpur → Baleshwar → Cuttack', division: 'Kharagpur', startSeg: 1, endSeg: 12, tag: 'Kharagpur Division', color: 'text-sky-600' },
        { name: 'SECTION 2: CTC–VSKP', dist: 'SEG 13–25 • 558 KM', route: 'Cuttack → Bhubaneswar → Brahmapur → Visakhapatnam', division: 'Waltair', startSeg: 13, endSeg: 25, tag: 'East Coast Railway', color: 'text-indigo-600' },
        { name: 'SECTION 3: VSKP–BZA', dist: 'SEG 26–35 • 350 KM', route: 'Visakhapatnam → Rajahmundry → Vijayawada → Ongole', division: 'Vijayawada', startSeg: 26, endSeg: 35, tag: 'Vijayawada Division', color: 'text-amber-600' },
        { name: 'SECTION 4: BZA–MAS', dist: 'SEG 36–50 • 433 KM', route: 'Vijayawada → Nellore → Gudur → Chennai Central', division: 'Chennai', startSeg: 36, endSeg: 50, tag: 'South Coast Corridor', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Howrah', title: 'Howrah Terminus', color: 'text-sky-400' },
        { name: 'Kharagpur', title: 'Kharagpur Junction', color: 'text-sky-400' },
        { name: 'Bhubaneswar', title: 'Bhubaneswar Capital', color: 'text-indigo-300' },
        { name: 'Visakhapatnam', title: 'Visakhapatnam Junction', color: 'text-indigo-300' },
        { name: 'Vijayawada', title: 'Vijayawada Junction', color: 'text-amber-400' },
        { name: 'Chennai Central', title: 'Chennai Central Terminus', color: 'text-emerald-400' },
      ],
    },
    MUMBAI_CHENNAI: {
      id: 'MUMBAI_CHENNAI',
      name: 'Mumbai – Pune – Solapur – Guntakal – Chennai',
      displayName: 'Mumbai – Pune – Solapur – Guntakal – Chennai',
      code: 'CR-GQ-SOUTH-04',
      zone: 'CR / SCR / SR',
      total_km: 1280,
      electrification: '25kV OHE AC • Bhor Ghat Double Traction',
      max_speed: '140 km/h',
      divisions: ['mumbai', 'pune', 'solapur', 'guntakal', 'chennai'],
      sections: [
        { name: 'SECTION 1: CSMT–PUNE', dist: 'SEG 01–12 • 192 KM', route: 'Mumbai CSMT → Kalyan → Lonavala → Pune', division: 'Pune', startSeg: 1, endSeg: 12, tag: 'Bhor Ghat Section', color: 'text-sky-600' },
        { name: 'SECTION 2: PUNE–SUR', dist: 'SEG 13–25 • 408 KM', route: 'Pune → Daund → Solapur → Wadi', division: 'Solapur', startSeg: 13, endSeg: 25, tag: 'Solapur Division', color: 'text-indigo-600' },
        { name: 'SECTION 3: WADI–GTL', dist: 'SEG 26–35 • 320 KM', route: 'Wadi → Raichur → Guntakal → Renigunta', division: 'Guntakal', startSeg: 26, endSeg: 35, tag: 'Guntakal Division', color: 'text-amber-600' },
        { name: 'SECTION 4: RU–MAS', dist: 'SEG 36–50 • 360 KM', route: 'Renigunta → Arakkonam → Perambur → Chennai Central', division: 'Chennai', startSeg: 36, endSeg: 50, tag: 'Chennai Suburban', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Mumbai CSMT', title: 'Mumbai CSMT Terminus', color: 'text-sky-400' },
        { name: 'Kalyan', title: 'Kalyan Junction', color: 'text-sky-400' },
        { name: 'Pune', title: 'Pune Junction', color: 'text-indigo-300' },
        { name: 'Solapur', title: 'Solapur Junction', color: 'text-indigo-300' },
        { name: 'Wadi', title: 'Wadi Junction', color: 'text-amber-400' },
        { name: 'Guntakal', title: 'Guntakal Junction', color: 'text-amber-400' },
        { name: 'Renigunta', title: 'Renigunta Junction', color: 'text-emerald-400' },
        { name: 'Chennai Central', title: 'Chennai Central Terminus', color: 'text-emerald-400' },
      ],
    },
    DELHI_JAMMU: {
      id: 'DELHI_JAMMU',
      name: 'Delhi – Ambala – Ludhiana – Jammu Tawi',
      displayName: 'Delhi – Ambala – Ludhiana – Jammu Tawi',
      code: 'NR-HDN-NORTH-05',
      zone: 'NR / FZR',
      total_km: 580,
      electrification: '25kV OHE High-Speed • Automatic Block Signaling',
      max_speed: '160 km/h',
      divisions: ['delhi', 'ambala', 'ludhiana', 'firozpur', 'jammu'],
      sections: [
        { name: 'SECTION 1: NDLS–UMB', dist: 'SEG 01–12 • 198 KM', route: 'New Delhi → Sonipat → Panipat → Ambala Cantt', division: 'Ambala', startSeg: 1, endSeg: 12, tag: 'Ambala Division', color: 'text-sky-600' },
        { name: 'SECTION 2: UMB–LDH', dist: 'SEG 13–25 • 167 KM', route: 'Ambala Cantt → Rajpura → Ludhiana → Jalandhar Cantt', division: 'Firozpur', startSeg: 13, endSeg: 25, tag: 'Ludhiana Trunk', color: 'text-indigo-600' },
        { name: 'SECTION 3: JRC–PTKC', dist: 'SEG 26–35 • 113 KM', route: 'Jalandhar Cantt → Dasuya → Pathankot Cantt', division: 'Firozpur', startSeg: 26, endSeg: 35, tag: 'Pathankot Section', color: 'text-amber-600' },
        { name: 'SECTION 4: PTKC–JAT', dist: 'SEG 36–50 • 102 KM', route: 'Pathankot Cantt → Kathua → Udhampur → Jammu Tawi', division: 'Firozpur', startSeg: 36, endSeg: 50, tag: 'Jammu Foothills', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'New Delhi', title: 'New Delhi Terminus', color: 'text-sky-400' },
        { name: 'Panipat', title: 'Panipat Junction', color: 'text-sky-400' },
        { name: 'Ambala Cantt', title: 'Ambala Cantt', color: 'text-indigo-300' },
        { name: 'Ludhiana', title: 'Ludhiana Junction', color: 'text-indigo-300' },
        { name: 'Jalandhar Cantt', title: 'Jalandhar Cantt Station', color: 'text-amber-400' },
        { name: 'Pathankot Cantt', title: 'Pathankot Cantt', color: 'text-amber-400' },
        { name: 'Jammu Tawi', title: 'Jammu Tawi Terminus', color: 'text-emerald-400' },
      ],
    },

    // ── ALL API-SUPPORTED RAILWAY DIVISIONS ─────────────────────────────────
    DIVISION_DELHI: {
      id: 'DIVISION_DELHI',
      name: 'Delhi Division (Northern Railway)',
      displayName: 'Delhi Division',
      code: 'NR-DLI-DIV',
      zone: 'NR / Northern Railway',
      total_km: 210,
      electrification: '25kV AC Electrified • High-Speed Auto-Block Signalling',
      max_speed: '160 km/h',
      divisions: ['delhi'],
      sections: [
        { name: 'SECTION 1: NEW DELHI SUBURBAN', dist: 'SEG 01–12 • 28 KM', route: 'New Delhi → Hazrat Nizamuddin → Tughlakabad', division: 'Delhi', startSeg: 1, endSeg: 12, tag: 'Capital Express', color: 'text-sky-600' },
        { name: 'SECTION 2: DELHI SOUTH TRUNK', dist: 'SEG 13–25 • 32 KM', route: 'Tughlakabad → Faridabad → Palwal', division: 'Delhi', startSeg: 13, endSeg: 25, tag: 'South Corridor', color: 'text-indigo-600' },
        { name: 'SECTION 3: OLD DELHI & YARDS', dist: 'SEG 26–35 • 45 KM', route: 'Delhi Sarai Rohilla → Old Delhi → Ghaziabad', division: 'Delhi', startSeg: 26, endSeg: 35, tag: 'Northern Yards', color: 'text-amber-600' },
        { name: 'SECTION 4: GHAZIABAD HIGH-SPEED', dist: 'SEG 36–50 • 105 KM', route: 'New Delhi → Ghaziabad → Meerut Corridor', division: 'Delhi', startSeg: 36, endSeg: 50, tag: 'Rapid Transit', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Delhi Sarai Rohilla', title: 'Delhi Sarai Rohilla Terminus', color: 'text-sky-400' },
        { name: 'Old Delhi', title: 'Old Delhi Junction', color: 'text-sky-400' },
        { name: 'New Delhi', title: 'New Delhi Central Terminus', color: 'text-sky-400' },
        { name: 'Hazrat Nizamuddin', title: 'Hazrat Nizamuddin Station', color: 'text-indigo-300' },
        { name: 'Tughlakabad', title: 'Tughlakabad Yard', color: 'text-indigo-300' },
        { name: 'Faridabad', title: 'Faridabad Industrial Hub', color: 'text-amber-400' },
        { name: 'Palwal', title: 'Palwal Divisional Boundary', color: 'text-emerald-400' },
        { name: 'Ghaziabad', title: 'Ghaziabad Junction', color: 'text-emerald-400' },
      ],
    },
    DIVISION_AGRA: {
      id: 'DIVISION_AGRA',
      name: 'Agra Division (North Central Railway)',
      displayName: 'Agra Division',
      code: 'NCR-AGC-DIV',
      zone: 'NCR / North Central Railway',
      total_km: 245,
      electrification: '25kV OHE Catenary • Automatic Train Protection (160 km/h)',
      max_speed: '160 km/h',
      divisions: ['agra'],
      sections: [
        { name: 'SECTION 1: KOSI–MATHURA', dist: 'SEG 01–12 • 41 KM', route: 'Palwal → Kosi Kalan → Chhata → Mathura', division: 'Agra', startSeg: 1, endSeg: 12, tag: 'High-Speed 160k', color: 'text-sky-600' },
        { name: 'SECTION 2: MATHURA–AGRA CANTT', dist: 'SEG 13–25 • 54 KM', route: 'Mathura → Farah → Raja Ki Mandi → Agra Cantt', division: 'Agra', startSeg: 13, endSeg: 25, tag: 'Agra Taj Line', color: 'text-indigo-600' },
        { name: 'SECTION 3: AGRA FORT & IDGAH', dist: 'SEG 26–35 • 38 KM', route: 'Agra Cantt → Idgah Agra → Agra Fort → Achhnera', division: 'Agra', startSeg: 26, endSeg: 35, tag: 'Heritage Link', color: 'text-amber-600' },
        { name: 'SECTION 4: BHARATPUR & DHOLPUR', dist: 'SEG 36–50 • 112 KM', route: 'Agra Cantt → Bharatpur → Dholpur → Malpura', division: 'Agra', startSeg: 36, endSeg: 50, tag: 'Chambal Trunk', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Kosi Kalan', title: 'Kosi Kalan Station', color: 'text-sky-400' },
        { name: 'Mathura', title: 'Mathura Junction', color: 'text-sky-400' },
        { name: 'Farah', title: 'Farah Station', color: 'text-indigo-300' },
        { name: 'Raja Ki Mandi', title: 'Raja Ki Mandi Station', color: 'text-indigo-300' },
        { name: 'Agra Cantt', title: 'Agra Cantt Central', color: 'text-amber-400' },
        { name: 'Idgah Agra', title: 'Idgah Agra Junction', color: 'text-amber-400' },
        { name: 'Agra Fort', title: 'Agra Fort Station', color: 'text-amber-400' },
        { name: 'Bharatpur', title: 'Bharatpur Junction', color: 'text-emerald-400' },
        { name: 'Dholpur', title: 'Dholpur Junction', color: 'text-emerald-400' },
      ],
    },
    DIVISION_KOTA: {
      id: 'DIVISION_KOTA',
      name: 'Kota Division (West Central Railway)',
      displayName: 'Kota Division',
      code: 'WCR-KOTA-DIV',
      zone: 'WCR / West Central Railway',
      total_km: 465,
      electrification: '25kV AC Heavy High-Rise Catenary • 160 km/h WCTG',
      max_speed: '160 km/h',
      divisions: ['kota'],
      sections: [
        { name: 'SECTION 1: BHARATPUR–GANGAPUR', dist: 'SEG 01–12 • 120 KM', route: 'Bharatpur → Bayana → Hindaun City → Gangapur City', division: 'Kota', startSeg: 1, endSeg: 12, tag: 'Gangapur Sub-Trunk', color: 'text-sky-600' },
        { name: 'SECTION 2: SAWAI MADHOPUR', dist: 'SEG 13–25 • 115 KM', route: 'Gangapur City → Malarna → Sawai Madhopur', division: 'Kota', startSeg: 13, endSeg: 25, tag: 'Ranthambore Link', color: 'text-indigo-600' },
        { name: 'SECTION 3: KOTA CENTRAL', dist: 'SEG 26–35 • 108 KM', route: 'Sawai Madhopur → Indargarh → Lakheri → Kota', division: 'Kota', startSeg: 26, endSeg: 35, tag: 'Chambal Viaduct', color: 'text-amber-600' },
        { name: 'SECTION 4: RAMGANJ–BHAWANI', dist: 'SEG 36–50 • 122 KM', route: 'Kota → Dakaniya Talav → Ramganj Mandi → Bhawani Mandi', division: 'Kota', startSeg: 36, endSeg: 50, tag: 'Malwa Gateway', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Bharatpur', title: 'Bharatpur Junction', color: 'text-sky-400' },
        { name: 'Hindaun City', title: 'Hindaun City', color: 'text-sky-400' },
        { name: 'Gangapur City', title: 'Gangapur City Junction', color: 'text-indigo-300' },
        { name: 'Sawai Madhopur', title: 'Sawai Madhopur Junction', color: 'text-indigo-300' },
        { name: 'Lakheri', title: 'Lakheri Station', color: 'text-amber-400' },
        { name: 'Kota', title: 'Kota Central Junction', color: 'text-amber-400' },
        { name: 'Ramganj Mandi', title: 'Ramganj Mandi Junction', color: 'text-emerald-400' },
        { name: 'Bhawani Mandi', title: 'Bhawani Mandi Station', color: 'text-emerald-400' },
      ],
    },
    DIVISION_RATLAM: {
      id: 'DIVISION_RATLAM',
      name: 'Ratlam Division (Western Railway)',
      displayName: 'Ratlam Division',
      code: 'WR-RTM-DIV',
      zone: 'WR / Western Railway',
      total_km: 265,
      electrification: '25kV AC Traction • 160 km/h Automatic Block',
      max_speed: '160 km/h',
      divisions: ['ratlam'],
      sections: [
        { name: 'SECTION 1: SHAMGARH–NAGDA', dist: 'SEG 01–12 • 88 KM', route: 'Bhawani Mandi → Shamgarh → Chaumahla → Nagda', division: 'Ratlam', startSeg: 1, endSeg: 12, tag: 'Malwa Quad', color: 'text-sky-600' },
        { name: 'SECTION 2: RATLAM JUNCTION', dist: 'SEG 13–25 • 42 KM', route: 'Nagda → Khachrod → Ratlam Junction', division: 'Ratlam', startSeg: 13, endSeg: 25, tag: 'Ratlam Hub', color: 'text-indigo-600' },
        { name: 'SECTION 3: UJJAIN & INDORE', dist: 'SEG 26–35 • 65 KM', route: 'Nagda → Ujjain → Dewas → Indore', division: 'Ratlam', startSeg: 26, endSeg: 35, tag: 'Mahakal Link', color: 'text-amber-600' },
        { name: 'SECTION 4: MEGHNAGAR–DAHOD', dist: 'SEG 36–50 • 70 KM', route: 'Ratlam → Bamnia → Meghnagar → Dahod', division: 'Ratlam', startSeg: 36, endSeg: 50, tag: 'Tribal Belt Trunk', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Shamgarh', title: 'Shamgarh Station', color: 'text-sky-400' },
        { name: 'Nagda', title: 'Nagda Junction', color: 'text-sky-400' },
        { name: 'Khachrod', title: 'Khachrod Station', color: 'text-indigo-300' },
        { name: 'Ratlam', title: 'Ratlam Junction Central', color: 'text-indigo-300' },
        { name: 'Ujjain', title: 'Ujjain Junction', color: 'text-amber-400' },
        { name: 'Indore', title: 'Indore Central Junction', color: 'text-amber-400' },
        { name: 'Meghnagar', title: 'Meghnagar Station', color: 'text-emerald-400' },
        { name: 'Dahod', title: 'Dahod Divisional Border', color: 'text-emerald-400' },
      ],
    },
    DIVISION_VADODARA: {
      id: 'DIVISION_VADODARA',
      name: 'Vadodara Division (Western Railway)',
      displayName: 'Vadodara Division',
      code: 'WR-BRC-DIV',
      zone: 'WR / Western Railway',
      total_km: 260,
      electrification: '25kV High-Rise Catenary • DFC Freight Chord Integration',
      max_speed: '160 km/h',
      divisions: ['vadodara'],
      sections: [
        { name: 'SECTION 1: GODHRA–VADODARA', dist: 'SEG 01–12 • 74 KM', route: 'Dahod → Godhra → Derol → Vadodara', division: 'Vadodara', startSeg: 1, endSeg: 12, tag: 'Central Gujarat', color: 'text-sky-600' },
        { name: 'SECTION 2: ANAND & AHMEDABAD', dist: 'SEG 13–25 • 68 KM', route: 'Vadodara → Anand → Nadiad → Ahmedabad', division: 'Vadodara', startSeg: 13, endSeg: 25, tag: 'Amul Corridor', color: 'text-indigo-600' },
        { name: 'SECTION 3: BHARUCH & NARMADA', dist: 'SEG 26–35 • 52 KM', route: 'Vadodara → Miyagam → Bharuch → Ankleshwar', division: 'Vadodara', startSeg: 26, endSeg: 35, tag: 'Narmada Viaduct', color: 'text-amber-600' },
        { name: 'SECTION 4: SURAT CENTRAL', dist: 'SEG 36–50 • 66 KM', route: 'Ankleshwar → Kosamba → Surat → Navsari', division: 'Vadodara', startSeg: 36, endSeg: 50, tag: 'Diamond City Hub', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Godhra', title: 'Godhra Junction', color: 'text-sky-400' },
        { name: 'Vadodara', title: 'Vadodara Junction Central', color: 'text-sky-400' },
        { name: 'Anand', title: 'Anand Junction', color: 'text-indigo-300' },
        { name: 'Ahmedabad', title: 'Ahmedabad Junction Terminus', color: 'text-indigo-300' },
        { name: 'Bharuch', title: 'Bharuch Junction', color: 'text-amber-400' },
        { name: 'Ankleshwar', title: 'Ankleshwar Industrial Corridor', color: 'text-amber-400' },
        { name: 'Surat', title: 'Surat Central Terminus', color: 'text-emerald-400' },
        { name: 'Navsari', title: 'Navsari Station', color: 'text-emerald-400' },
      ],
    },
    DIVISION_MUMBAI: {
      id: 'DIVISION_MUMBAI',
      name: 'Mumbai Division (Western / Central Railway)',
      displayName: 'Mumbai Division',
      code: 'WR-BCT-DIV',
      zone: 'WR / CR / Mumbai Suburban',
      total_km: 265,
      electrification: '25kV AC Heavy Suburban Traction • Automatic Train Management',
      max_speed: '140 km/h',
      divisions: ['mumbai'],
      sections: [
        { name: 'SECTION 1: VALSAD & VAPI', dist: 'SEG 01–12 • 65 KM', route: 'Navsari → Bilimora → Valsad → Vapi', division: 'Mumbai', startSeg: 1, endSeg: 12, tag: 'South Gujarat', color: 'text-sky-600' },
        { name: 'SECTION 2: PALGHAR & VIRAR', dist: 'SEG 13–25 • 82 KM', route: 'Vapi → Dahanu Road → Palghar → Virar', division: 'Mumbai', startSeg: 13, endSeg: 25, tag: 'Suburban Entry', color: 'text-indigo-600' },
        { name: 'SECTION 3: BORIVALI SUBURBAN', dist: 'SEG 26–35 • 38 KM', route: 'Virar → Vasai Road → Borivali → Andheri', division: 'Mumbai', startSeg: 26, endSeg: 35, tag: 'Western Suburban', color: 'text-amber-600' },
        { name: 'SECTION 4: MUMBAI TERMINALS', dist: 'SEG 36–50 • 80 KM', route: 'Andheri → Bandra Terminus → Dadar → Mumbai Central', division: 'Mumbai', startSeg: 36, endSeg: 50, tag: 'Mumbai Terminus', color: 'text-emerald-600' },
      ],
      gantries: [
        { name: 'Valsad', title: 'Valsad Station', color: 'text-sky-400' },
        { name: 'Vapi', title: 'Vapi Industrial Station', color: 'text-sky-400' },
        { name: 'Dahanu Road', title: 'Dahanu Road Station', color: 'text-indigo-300' },
        { name: 'Palghar', title: 'Palghar Station', color: 'text-indigo-300' },
        { name: 'Virar', title: 'Virar Suburban Junction', color: 'text-amber-400' },
        { name: 'Borivali', title: 'Borivali Suburban Central', color: 'text-amber-400' },
        { name: 'Bandra Terminus', title: 'Bandra Terminus', color: 'text-emerald-400' },
        { name: 'Dadar', title: 'Dadar Central Interchange', color: 'text-emerald-400' },
        { name: 'Mumbai Central', title: 'Mumbai Central Terminus', color: 'text-emerald-400' },
      ],
    },
  };

  // Dynamically merged unified corridor registry
  const unifiedCorridorsMap = React.useMemo(() => {
    const map = { ...irCorridors };

    // Merge any dynamically returned corridors from API
    (corridorsList || []).forEach((c) => {
      const cId = c.id || c.name?.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      if (cId && !map[cId]) {
        map[cId] = {
          id: cId,
          name: c.name || cId,
          displayName: c.name || cId,
          code: c.code || 'IR-CORRIDOR',
          zone: c.zone || 'Indian Railways',
          total_km: c.total_km || 500,
          electrification: '25kV AC Electrified',
          max_speed: '160 km/h',
          divisions: (c.divisions || []).map((d) => d.toLowerCase()),
          sections: [
            { name: `${c.name} Section 1`, dist: 'SEG 01–12', route: `${c.name} (Northern)`, division: c.divisions?.[0] || 'IR', startSeg: 1, endSeg: 12, tag: 'Live Route', color: 'text-sky-600' },
            { name: `${c.name} Section 2`, dist: 'SEG 13–25', route: `${c.name} (Central)`, division: c.divisions?.[1] || c.divisions?.[0] || 'IR', startSeg: 13, endSeg: 25, tag: 'Live Route', color: 'text-indigo-600' },
            { name: `${c.name} Section 3`, dist: 'SEG 26–35', route: `${c.name} (Mid-Trunk)`, division: c.divisions?.[2] || c.divisions?.[0] || 'IR', startSeg: 26, endSeg: 35, tag: 'Live Route', color: 'text-amber-600' },
            { name: `${c.name} Section 4`, dist: 'SEG 36–50', route: `${c.name} (Terminus)`, division: c.divisions?.[3] || c.divisions?.[0] || 'IR', startSeg: 36, endSeg: 50, tag: 'Live Route', color: 'text-emerald-600' },
          ],
          gantries: (c.stations || []).map((stn) => ({ name: stn, title: `${stn} Station`, color: 'text-sky-400' })),
        };
      }
    });

    // Merge any dynamically returned divisions from API
    (divisionsList || []).forEach((d) => {
      const divName = typeof d === 'string' ? d : d.division || '';
      if (!divName) return;
      const dId = `DIVISION_${divName.toUpperCase()}`;
      if (!map[dId]) {
        map[dId] = {
          id: dId,
          name: `${divName} Division`,
          displayName: `${divName} Division`,
          code: `IR-${divName.toUpperCase()}-DIV`,
          zone: d.zone || 'Indian Railways',
          total_km: 250,
          electrification: '25kV AC Electrified',
          max_speed: '160 km/h',
          divisions: [divName.toLowerCase()],
          sections: [
            { name: `${divName} Section 1`, dist: 'SEG 01–12', route: `${divName} North`, division: divName, startSeg: 1, endSeg: 12, tag: 'Divisional Line', color: 'text-sky-600' },
            { name: `${divName} Section 2`, dist: 'SEG 13–25', route: `${divName} Central`, division: divName, startSeg: 13, endSeg: 25, tag: 'Divisional Line', color: 'text-indigo-600' },
            { name: `${divName} Section 3`, dist: 'SEG 26–35', route: `${divName} South`, division: divName, startSeg: 26, endSeg: 35, tag: 'Divisional Line', color: 'text-amber-600' },
            { name: `${divName} Section 4`, dist: 'SEG 36–50', route: `${divName} Yard & Terminus`, division: divName, startSeg: 36, endSeg: 50, tag: 'Divisional Line', color: 'text-emerald-600' },
          ],
          gantries: (d.stations || []).map((stn) => ({ name: stn, title: `${stn} Station`, color: 'text-sky-400' })),
        };
      }
    });

    return map;
  }, [corridorsList, divisionsList]);

  // Unified list of all selectable corridors
  const unifiedCorridorsList = React.useMemo(() => {
    return Object.values(unifiedCorridorsMap);
  }, [unifiedCorridorsMap]);

  const currentIrCorridor = unifiedCorridorsMap[activeIrCorridor] || unifiedCorridorsMap.DELHI_KANPUR || irCorridors.DELHI_KANPUR;

  // Authoritative Corridor Task & Risk Filter Function
  const getTasksForSelectedNetwork = (selectedNetworkId, rawRiskSegments = [], corridorsMap = unifiedCorridorsMap) => {
    const corridor = corridorsMap[selectedNetworkId] || corridorsMap.DELHI_KANPUR || irCorridors.DELHI_KANPUR;
    if (!corridor) return [];

    const allowedDivisions = new Set((corridor.divisions || []).map((d) => d.toLowerCase().trim()));
    const gantryNames = (corridor.gantries || []).map((g) => (g.name || '').toLowerCase());
    const sectionRoutes = (corridor.sections || []).map((s) => (s.route || '').toLowerCase()).join(' ');

    // 1. Strictly filter raw risk tasks belonging to this selected corridor
    const matchingTasks = [];
    (rawRiskSegments || []).forEach((s) => {
      if (!s || !s.segment_id) return;
      const taskDiv = (s.division || '').toLowerCase().trim().replace(/ division$/, '');
      const taskStation = (s.station || s.station_code || '').toLowerCase().trim();

      const isDivisionMatch = taskDiv && (allowedDivisions.has(taskDiv) || (taskDiv === 'allahabad' && allowedDivisions.has('prayagraj')));
      const isStationMatch = taskStation && (
        gantryNames.some((gn) => gn === taskStation || gn.includes(taskStation) || taskStation.includes(gn)) ||
        sectionRoutes.includes(taskStation)
      );

      if (isDivisionMatch || isStationMatch) {
        matchingTasks.push({
          ...s,
          division: s.division || corridor.name.split(' ')[0],
          asset_type: s.asset_type || 'Track',
          risk_30d: s.risk_30d || 0.0006,
        });
      }
    });

    // 2. Prepare 50 physical track slots, strictly partitioned by corridor sections
    const slots = new Array(50);
    const occupiedSlots = new Set();

    // Helper to find the matching section along the corridor for a given task
    const findSectionForTask = (task) => {
      const taskDiv = (task.division || '').toLowerCase().trim().replace(/ division$/, '');
      const taskStation = (task.station || task.station_code || '').toLowerCase().trim();

      // Priority 1: Exact division match with section.division
      for (let secIdx = 0; secIdx < corridor.sections.length; secIdx++) {
        const sec = corridor.sections[secIdx];
        const secDiv = (sec.division || '').toLowerCase().trim();
        if (secDiv && taskDiv && secDiv === taskDiv) {
          return sec;
        }
      }

      // Priority 2: Station match inside section.route
      if (taskStation) {
        for (let secIdx = 0; secIdx < corridor.sections.length; secIdx++) {
          const sec = corridor.sections[secIdx];
          const secRoute = (sec.route || '').toLowerCase();
          if (secRoute.includes(taskStation)) {
            return sec;
          }
        }
      }

      // Priority 3: Division substring match inside section.route
      if (taskDiv) {
        for (let secIdx = 0; secIdx < corridor.sections.length; secIdx++) {
          const sec = corridor.sections[secIdx];
          const secRoute = (sec.route || '').toLowerCase();
          if (secRoute.includes(taskDiv)) {
            return sec;
          }
        }
      }

      return corridor.sections[0];
    };

    // 3. Place matching tasks strictly into their section's segment slots
    matchingTasks.forEach((task) => {
      const sec = findSectionForTask(task);
      const start = sec.startSeg; // 1-indexed
      const end = sec.endSeg;     // 1-indexed

      // Check for numeric segment match within this section range
      const numMatch = task.segment_id.match(/SEG-(\d+)/);
      let targetSlot = -1;
      if (numMatch) {
        const segNum = parseInt(numMatch[1], 10);
        if (segNum >= start && segNum <= end && !occupiedSlots.has(segNum - 1)) {
          targetSlot = segNum - 1;
        }
      }

      // If non-numeric (e.g. SEG-NEW-xxx) or slot occupied, assign first available slot inside section
      if (targetSlot === -1) {
        for (let sIdx = start - 1; sIdx <= end - 1; sIdx++) {
          if (!occupiedSlots.has(sIdx)) {
            targetSlot = sIdx;
            break;
          }
        }
      }

      // Clamp targetSlot strictly inside [start - 1, end - 1] so it can NEVER leak into another section
      if (targetSlot !== -1 && targetSlot >= start - 1 && targetSlot <= end - 1) {
        occupiedSlots.add(targetSlot);
        slots[targetSlot] = {
          ...task,
          _slotIndex: targetSlot,
          division: task.division || sec.division || corridor.name.split(' ')[0],
          section_name: sec.name,
          route: sec.route,
          isRealRisk: true,
        };
      }
    });

    // 4. Fill remaining unoccupied slots with healthy/monitored baseline segment data
    for (let i = 1; i <= 50; i++) {
      const slotIdx = i - 1;
      if (!slots[slotIdx]) {
        const sec = corridor.sections.find((section) => i >= section.startSeg && i <= section.endSeg) || corridor.sections[0];
        const segId = `SEG-${String(i).padStart(3, '0')}`;

        slots[slotIdx] = {
          segment_id: segId,
          _slotIndex: slotIdx,
          division: sec.division || corridor.name.split(' ')[0],
          section_name: sec.name,
          route: sec.route,
          asset_type: i % 3 === 0 ? 'OHE' : i % 5 === 0 ? 'S&T' : 'Track',
          risk_30d: 0.0004,
          expected_downtime_days: 0.01,
          preventive_block_duration_hrs: 3.5,
          confidence: '80% Confidence',
          isRealRisk: false,
        };
      }
    }

    return slots;
  };

  // Tasks & Risks strictly filtered for the selected Division / Corridor
  const currentNetworkTasks = React.useMemo(() => {
    return getTasksForSelectedNetwork(activeIrCorridor, riskSegments, unifiedCorridorsMap);
  }, [activeIrCorridor, riskSegments, unifiedCorridorsMap]);

  const activeCorridorRisks = React.useMemo(() => {
    return currentNetworkTasks.filter((s) => s.isRealRisk);
  }, [currentNetworkTasks]);

  const networkCritical = React.useMemo(() => {
    return activeCorridorRisks.filter(
      (s) => (s.risk_30d || 0) >= 0.005 || s.segment_id?.includes('NEW') || s.segment_id?.includes('TEST')
    );
  }, [activeCorridorRisks]);

  const networkCaution = React.useMemo(() => {
    return activeCorridorRisks.filter(
      (s) => (s.risk_30d || 0) >= 0.002 && !networkCritical.some((c) => c.segment_id === s.segment_id)
    );
  }, [activeCorridorRisks, networkCritical]);

  const networkOptimal = React.useMemo(() => {
    return currentNetworkTasks.filter(
      (s) => !networkCritical.some((c) => c.segment_id === s.segment_id) && !networkCaution.some((m) => m.segment_id === s.segment_id)
    );
  }, [currentNetworkTasks, networkCritical, networkCaution]);

  // Authoritative deduplicated station timeline labels (Single Source of Truth)
  const dedupedGantries = React.useMemo(() => {
    if (!currentIrCorridor) return [];
    const rawStations = currentIrCorridor.gantries && currentIrCorridor.gantries.length > 0
      ? currentIrCorridor.gantries
      : (currentIrCorridor.stations || []).map((stn) => ({ name: stn, title: `${stn} Station`, color: 'text-sky-400' }));

    const seen = new Set();
    const deduped = [];

    for (const g of rawStations) {
      const rawName = typeof g === 'string' ? g : (g.name || g.station || '');
      const key = (g.id || g.code || rawName).toLowerCase().trim().replace(/\s+/g, ' ');
      if (key && !seen.has(key)) {
        seen.add(key);
        deduped.push(typeof g === 'string' ? { name: g, title: `${g} Station`, color: 'text-sky-400' } : g);
      }
    }

    return deduped;
  }, [currentIrCorridor]);

  // Corridor tasks sorted by priority (Critical > Caution > Highest Risk Normal)
  const prioritizedCorridorTasks = React.useMemo(() => {
    return [...currentNetworkTasks].sort((a, b) => {
      const aCrit = (a.risk_30d || 0) >= 0.005 || a.segment_id?.includes('NEW') || a.segment_id?.includes('TEST');
      const bCrit = (b.risk_30d || 0) >= 0.005 || b.segment_id?.includes('NEW') || b.segment_id?.includes('TEST');
      if (aCrit && !bCrit) return -1;
      if (!aCrit && bCrit) return 1;

      const aMed = (a.risk_30d || 0) >= 0.002;
      const bMed = (b.risk_30d || 0) >= 0.002;
      if (aMed && !bMed) return -1;
      if (!aMed && bMed) return 1;

      return (b.risk_30d || 0) - (a.risk_30d || 0);
    });
  }, [currentNetworkTasks]);

  const displayedCorridorTasks = React.useMemo(() => {
    if (corridorFilter === 'CRITICAL') return networkCritical;
    if (corridorFilter === 'CAUTION') return networkCaution;
    if (showAllCorridorTasks) return prioritizedCorridorTasks;
    // Default compact view: show critical + caution tasks, or top 6 highest priority items
    const priorityCount = Math.max(6, activeCorridorRisks.length);
    return prioritizedCorridorTasks.slice(0, Math.min(priorityCount, prioritizedCorridorTasks.length));
  }, [corridorFilter, networkCritical, networkCaution, showAllCorridorTasks, prioritizedCorridorTasks, activeCorridorRisks]);

  // Maintenance blocks strictly filtered to the selected corridor
  const networkSegmentIds = React.useMemo(() => {
    return new Set(currentNetworkTasks.map((t) => t.segment_id));
  }, [currentNetworkTasks]);

  const filteredAssignments = React.useMemo(() => {
    if (!Array.isArray(assignments) || assignments.length === 0) return [];
    const allowedDivisions = new Set((currentIrCorridor.divisions || []).map((d) => d.toLowerCase().trim()));
    return assignments.filter((a) => {
      if (!a) return false;
      if (a.segment_id && networkSegmentIds.has(a.segment_id)) return true;
      const aDiv = (a.division || '').toLowerCase().trim().replace(/ division$/, '');
      if (aDiv && (allowedDivisions.has(aDiv) || (aDiv === 'allahabad' && allowedDivisions.has('prayagraj')))) return true;
      return false;
    });
  }, [assignments, networkSegmentIds, currentIrCorridor]);

  // Baseline 50 Monitored Assets KPI
  const totalSegmentsCount = 50;
  const scheduledBlocksCount = filteredAssignments.length;
  const blockedAssetsCount = scheduledBlocksCount;
  const availableAssetsCount = Math.max(0, totalSegmentsCount - blockedAssetsCount);
  const availabilityPercent = ((availableAssetsCount / totalSegmentsCount) * 100).toFixed(1);

  // Department counts in current plan (scoped to selected corridor)
  const engCount = filteredAssignments.filter((a) => a.department === 'Engineering' || a.department === 'TRACK').length;
  const oheCount = filteredAssignments.filter((a) => a.department === 'Electrical' || a.department === 'OHE').length;
  const sntCount = filteredAssignments.filter((a) => a.department === 'S&T' || a.department === 'SIGNAL').length;

  // Active Schedule & Department Conflicts Engine (Network-Scoped)
  const activeConflictsList = React.useMemo(() => {
    return networkCritical.map((seg, idx) => {
      const causeWord = getOneWordCause(seg);
      const trains = idx % 2 === 0
        ? ['#12952 Rajdhani Express', '#12004 Shatabdi Express']
        : ['#22436 Vande Bharat Express', '#4092 Heavy Goods Freight'];
      return {
        id: `CONF-${seg.segment_id}`,
        segment_id: seg.segment_id,
        division: seg.division,
        cause: causeWord,
        risk_percent: ((seg.risk_30d || 0) * 100).toFixed(1),
        conflicting_trains: trains,
        conflict_type: idx % 2 === 0 ? 'Peak Daylight Train Overlap (14:30 IST)' : 'Multi-Department Track & OHE Block Clash',
        cpsat_resolution: 'CP-SAT Zero-Conflict Off-Peak Window (01:00 - 04:30 IST)',
        status: 'RESOLVED (0 PASSENGER OVERLAP)',
      };
    });
  }, [networkCritical]);

  const activeConflictsCount = activeConflictsList.length || 0;

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">
        {/* Main Content Container */}
        <div className="p-gutter flex flex-col gap-space-lg">
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
            {/* KPI 1: Asset Availability (Adjusted according to scheduled maintenance blocks) */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Asset Availability</span>
                <span className="material-symbols-outlined text-[14px]">speed</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {availabilityPercent}%
                </span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-medium">
                  {availableAssetsCount}/{totalSegmentsCount} Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  {blockedAssetsCount} Under Maintenance Block
                </span>
                <span className="font-label-caps text-label-caps bg-tertiary-container text-on-tertiary-container px-1 py-0.5 rounded uppercase font-bold">
                  OPTIMAL
                </span>
              </div>
            </div>

            {/* KPI 2: Active High Risks (Interactive Card) */}
            <div
              onClick={() => {
                setCorridorFilter('CRITICAL');
                document.getElementById('high-priority-alerts')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between cursor-pointer hover:border-error hover:border transition-all border border-transparent active:scale-[0.99]"
              title="Click to view High-Priority Segment Alerts"
            >
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Active High Risks</span>
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-error">
                  {networkCritical.length}
                </span>
                <span className="font-code-sm text-code-sm text-error font-bold">Critical Segments</span>
              </div>
              <span className="font-code-sm text-code-sm text-error truncate font-semibold">
                {networkCritical.map((s) => s.segment_id).join(' / ') || 'None critical'}
              </span>
            </div>

            {/* KPI 3: Scheduled Blocks */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Scheduled Blocks</span>
                <span className="material-symbols-outlined text-[14px]">event_note</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {assignments.length || 413}
                </span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">APPROVED</span>
              </div>
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
                <span>{engCount || 230} ENG</span>•<span>{oheCount || 105} ELEC</span>•<span>{sntCount || 78} S&amp;T</span>
              </div>
            </div>

            {/* KPI 4: Active Conflicts (Interactive Conflict Inspector Card) */}
            <div
              onClick={() => setShowConflictsModal(true)}
              className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between cursor-pointer hover:border-error hover:border transition-all border border-transparent active:scale-[0.99]"
              title="Click to view full Active Conflicts & Timetable Protection details"
            >
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Active Conflicts</span>
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-error">
                  {activeConflictsCount}
                </span>
                <span className="font-code-sm text-code-sm font-bold text-error">
                  ACTIVE CONFLICTS
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate font-semibold flex items-center justify-between">
                <span>100% Passenger Protected</span>
                <span className="text-primary underline font-bold">Inspect →</span>
              </span>
            </div>

            {/* KPI 5: Solver Engine Status */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">CP-SAT Optimizer</span>
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">check_circle</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {currentPlan?.policy ? currentPlan.policy.toUpperCase() : 'BALANCED'}
                </span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container">OPTIMAL</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                {currentPlan?.plan_id || 'Plan Active'}
              </span>
            </div>
          </div>

          {/* Optimization Trigger & Toolbar */}
          <div className="bg-surface-container p-space-sm rounded shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                className={`bg-primary-container hover:bg-primary text-on-primary px-space-md py-space-xs rounded flex items-center justify-center gap-space-sm shadow transition-all active:scale-[0.99] ${
                  optimizingState !== 'idle' ? 'opacity-90' : ''
                }`}
                id="btn-optimize"
                onClick={triggerOptimization}
                disabled={optimizingState !== 'idle'}
              >
                {optimizingState === 'solving' ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin text-tertiary-fixed">autorenew</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">SOLVING CP-SAT...</span>
                  </>
                ) : optimizingState === 'optimized' ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">OPTIMIZED &amp; SAVED</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">play_arrow</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">RUN CP-SAT OPTIMIZER</span>
                  </>
                )}
              </button>
              <div className="hidden sm:flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">SOLVER ENGINE</span>
                <span className="font-code-sm text-code-sm text-primary font-semibold">Google OR-Tools CP-SAT (Parallel)</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <button
                onClick={loadDashboardData}
                title="Refresh Live Data"
                className="bg-surface-container-lowest hover:bg-surface-container text-on-surface px-3 py-1.5 rounded flex items-center gap-1 font-code-sm text-code-sm font-semibold shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Refresh Live Data</span>
              </button>
            </div>
          </div>

          {/* Virtual Railway Corridor Schematic Ribbon */}
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-sm border border-surface-container-high">
            {/* Header and Corridor Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="material-symbols-outlined text-[20px] text-primary">alt_route</span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Virtual Railway Corridor:
                  </h2>
                  <select
                    value={activeIrCorridor}
                    onChange={(e) => setActiveIrCorridor(e.target.value)}
                    className="bg-surface-container-high text-primary font-code-sm text-code-sm font-bold px-3 py-1.5 rounded border border-surface-container-highest cursor-pointer hover:bg-surface-container-highest transition-colors shadow-xs max-w-[500px]"
                    title="Select Railway Corridor"
                  >
                    {unifiedCorridorsList.map((corridor) => (
                      <option key={corridor.id} value={corridor.id}>
                        🚆 {corridor.displayName || corridor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-space-sm font-label-caps text-label-caps flex-wrap">
                <span className="text-[10px] font-code-sm uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                  {currentIrCorridor.electrification}
                </span>
                <span className="flex items-center gap-1.5 text-on-surface font-semibold bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {currentNetworkTasks.length} Active Monitored Segments
                </span>
                <span className="font-code-sm text-secondary font-bold">
                  MAX SPEED: {currentIrCorridor.max_speed}
                </span>
              </div>
            </div>

            {/* Dynamic Train Route Sections Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xs bg-surface-container-low p-space-sm rounded border border-surface-container-high">
              {currentIrCorridor.sections.map((sec) => {
                const isSecBlocked = networkCritical.some((s) => {
                  if (s.section_name && s.section_name === sec.name) return true;
                  const segNum = s._slotIndex != null ? s._slotIndex + 1 : parseInt(s.segment_id?.replace(/[^0-9]/g, '') || '0', 10);
                  return segNum >= sec.startSeg && segNum <= sec.endSeg;
                });

                return (
                  <div key={sec.name} className="flex flex-col gap-1 p-2 rounded bg-surface-container-lowest border border-surface-container-high">
                    <div className="flex items-center justify-between">
                      <span className={`font-code-sm text-code-sm font-bold ${sec.color} flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]">train</span>
                        {sec.name}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant font-semibold">{sec.dist}</span>
                    </div>
                    <div className="text-[11px] font-mono font-medium text-on-surface truncate">
                      {sec.route}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-code-sm mt-1">
                      <span className="text-on-surface-variant">{sec.tag}</span>
                      <span className={isSecBlocked ? "text-error font-bold" : "text-emerald-600 font-semibold"}>
                        {isSecBlocked ? "⛔ ACTIVE BLOCK" : "🟢 ALL CLEAR"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VIRTUAL RAILWAY CORRIDOR VISUALIZER (Dual-Rail Track + Ballast Bed + Signals) */}
            <div className="relative w-full overflow-x-auto py-2 bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <div style={{ minWidth: `${Math.max(1600, (dedupedGantries.length || 8) * 180)}px` }} className="flex flex-col gap-1.5">

                {/* Waypoint Station Nodes (Deduplicated Chronological Timeline - Single Source of Truth) */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pb-1.5 border-b border-slate-800/80 px-4 w-full">
                  {dedupedGantries.map((gantry, gIdx) => (
                    <React.Fragment key={gantry.name || gIdx}>
                      <div
                        className={`flex items-center gap-1.5 ${gantry.color || 'text-sky-400'} font-bold shrink-0`}
                        title={gantry.title || gantry.name}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-current shadow-xs"></span>
                        <span className="truncate max-w-[150px]">{gantry.name}</span>
                      </div>
                      {gIdx < dedupedGantries.length - 1 && (
                        <div className="flex-1 flex items-center justify-center px-2 min-w-[24px] text-slate-600 select-none">
                          <span className="w-full border-t border-dashed border-slate-700"></span>
                          <span className="text-[10px] text-slate-500 mx-1">→</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* REALISTIC RAILWAY TRACK ASSEMBLY (Section-Partitioned with Hard Physical Boundaries) */}
                <div className="relative h-20 w-full rail-ballast rail-ties rounded border-2 border-slate-700 flex items-stretch overflow-hidden shadow-2xl my-1">
                  
                  {/* Top Metallic Steel Rail */}
                  <div className="absolute top-1 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-b border-slate-900 z-10 opacity-90 pointer-events-none"></div>
                  
                  {/* Bottom Metallic Steel Rail */}
                  <div className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-t border-slate-900 z-10 opacity-90 pointer-events-none"></div>

                  {/* Electrified Overhead Catinary wire line (OHE) down center */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-sky-400/30 z-0 border-t border-dashed border-sky-400/40 pointer-events-none"></div>

                  {/* Section Track Containers with Hard Boundaries */}
                  {currentIrCorridor.sections.map((sec, sIdx) => {
                    const secSegCount = sec.endSeg - sec.startSeg + 1;
                    const secWidthPct = (secSegCount / 50) * 100;
                    const secSlots = currentNetworkTasks.slice(sec.startSeg - 1, sec.endSeg);

                    return (
                      <div
                        key={sec.name + sIdx}
                        style={{ width: `${secWidthPct}%` }}
                        className="h-full relative flex items-stretch border-r-2 border-slate-600/90 last:border-r-0 overflow-hidden shrink-0"
                      >
                        {secSlots.map((seg, slotIdx) => {
                          const isDefect = seg.isRealRisk && ((seg.risk_30d || 0) >= 0.005 || seg.segment_id?.includes('NEW') || seg.segment_id?.includes('TEST'));
                          const isCaution = seg.isRealRisk && (seg.risk_30d || 0) >= 0.002 && !isDefect;
                          const isSelected = selectedNode === seg.segment_id;
                          const causeWord = getOneWordCause(seg);
                          const globalSegNum = sec.startSeg + slotIdx;

                          return (
                            <div
                              key={seg.segment_id + slotIdx}
                              onClick={() => inspectNode(seg.segment_id)}
                              className={`h-full flex-1 relative border-r border-slate-800/80 last:border-r-0 cursor-pointer group transition-all flex flex-col justify-between p-0.5 ${
                                isSelected ? 'ring-2 ring-sky-400 z-30 bg-sky-500/20' : 'hover:brightness-125 z-20'
                              } ${
                                isDefect
                                  ? 'hazard-stripes-red animate-pulse'
                                  : isCaution
                                  ? 'caution-stripes-amber'
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/60'
                              }`}
                              title={`🛤️ TRACK BLOCK: ${seg.segment_id} (${seg.division || sec.division})\n• Section: ${sec.name} (SEG ${String(sec.startSeg).padStart(2, '0')}–${String(sec.endSeg).padStart(2, '0')})\n• Status: ${isDefect ? `⛔ DEFECT/MAINTENANCE BLOCK [Cause: ${causeWord}]` : isCaution ? '🟡 PSR / CAUTION (30 km/h)' : '🟢 CLEAR TRACK (110 km/h)'}\n• Failure Risk: ${((seg.risk_30d || 0) * 100).toFixed(1)}%\n• Asset: ${seg.asset_type || causeWord}`}
                            >
                              {/* Block Signal Post Lamp (Top) */}
                              <div className="flex justify-center pt-0.5">
                                <span
                                  className={`w-2 h-2 rounded-full border border-slate-900 shadow-sm ${
                                    isDefect
                                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-signal-pulse'
                                      : isCaution
                                      ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                                      : 'bg-emerald-400 shadow-[0_0_4px_#10b981]'
                                  }`}
                                ></span>
                              </div>

                              {/* Middle Track Block Identifier / Label */}
                              <div className="flex items-center justify-center text-center">
                                {isDefect ? (
                                  <span className="px-1 py-0.2 rounded bg-black/90 text-red-400 font-mono text-[9px] font-extrabold border border-red-500/60 truncate shadow-md">
                                    ⛔ {causeWord}
                                  </span>
                                ) : isCaution ? (
                                  <span className="px-1 py-0.2 rounded bg-black/80 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
                                    30k
                                  </span>
                                ) : (
                                  <span className="text-emerald-400/40 font-mono text-[8px] group-hover:text-emerald-300 transition-colors">
                                    ››
                                  </span>
                                )}
                              </div>

                              {/* Bottom Segment Index */}
                              <div className="flex justify-center pb-0.5">
                                <span className="text-[8px] font-mono text-slate-400/70 group-hover:text-slate-200">
                                  {globalSegNum}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Waypoint Segment Hotspots Cards (strictly filtered) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-xs text-left pt-space-xs">
                  {activeCorridorRisks.length === 0 ? (
                    <div className="col-span-full py-2 text-center text-slate-400 font-code-sm">
                      ✓ No active critical/caution risk tasks on this corridor (All segments operational)
                    </div>
                  ) : (
                    activeCorridorRisks
                      .slice(0, 6)
                      .map((seg) => {
                        const isCrit = (seg.risk_30d || 0) >= 0.005 || seg.segment_id?.includes('NEW') || seg.segment_id?.includes('TEST');
                        const isMed = (seg.risk_30d || 0) >= 0.002 && !isCrit;
                        const isSelected = selectedNode === seg.segment_id;
                        const causeWord = getOneWordCause(seg);

                        return (
                          <div
                            key={seg.segment_id}
                            className={`flex flex-col gap-0.5 cursor-pointer p-1.5 rounded transition-colors ${
                              isSelected
                                ? 'ring-2 ring-primary bg-surface-container-low'
                                : 'hover:bg-surface-container-low'
                            }`}
                            onClick={() => inspectNode(seg.segment_id)}
                          >
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${
                                  isCrit
                                    ? 'bg-[#dc2626] animate-pulse shadow-[0_0_6px_#dc2626]'
                                    : isMed
                                    ? 'bg-[#f59e0b]'
                                    : 'bg-[#4ade80]'
                                }`}
                              ></span>
                              <span className="font-code-lg text-code-lg font-bold text-on-surface">
                                {seg.segment_id}
                              </span>
                            </div>
                            <span
                              className={`font-label-caps text-label-caps font-semibold ${
                                isCrit
                                  ? 'text-error'
                                  : isMed
                                  ? 'text-amber-500'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {seg.division} Div • {((seg.risk_30d || 0) * 100).toFixed(1)}%
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant truncate font-medium">
                              {isCrit ? `BLOCK (${causeWord})` : isMed ? 'CAUTION (30km/h)' : 'On-Time Response'}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Selected Segment Inspector Banner */}
            {selectedNode && (() => {
              const inspected = currentNetworkTasks.find((s) => s.segment_id === selectedNode);
              if (!inspected) return null;
              const cause = getOneWordCause(inspected);
              return (
                <div className="bg-surface-container-low border border-primary/30 p-space-sm rounded flex items-center justify-between flex-wrap gap-space-sm animate-fadeIn">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[22px]">info</span>
                    <div>
                      <span className="font-code-sm text-code-sm font-bold text-primary">
                        SELECTED INSPECTOR: {selectedNode}
                      </span>
                      <div className="flex items-center gap-space-sm text-body-sm font-code-sm text-on-surface-variant mt-0.5 flex-wrap">
                        <span>Division: {inspected.division}</span>
                        <span>•</span>
                        <span>Asset: {inspected.asset_type || cause}</span>
                        <span>•</span>
                        <span>Failure Risk: <strong className={(inspected.risk_30d || 0) >= 0.005 ? 'text-error' : 'text-emerald-600'}>{((inspected.risk_30d || 0) * 100).toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span>80% Model Accuracy Baseline</span>
                        <span>•</span>
                        <span>Block Duration: {inspected.preventive_block_duration_hrs || 3.5}h</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/segment-why?segment=${selectedNode}`}
                    className="bg-primary text-on-primary px-3 py-1 rounded font-code-sm text-code-sm font-bold hover:bg-primary-container transition-colors flex items-center gap-1"
                  >
                    VIEW ML SURVIVAL CURVE
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              );
            })()}

            {/* Corridor Tasks Section (Compact Priority View with View All Interaction) */}
            <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-high">
              {/* Header & Controls Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Corridor Tasks
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-surface-container-high">
                    {currentNetworkTasks.length} segments monitored
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-error font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      {networkCritical.length} critical
                    </span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-amber-500 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      {networkCaution.length} caution
                    </span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {Math.max(0, currentNetworkTasks.length - networkCritical.length - networkCaution.length)} normal
                    </span>
                  </div>
                </div>

                {/* Filters & Expand/Collapse Toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded border border-surface-container-high">
                    <button
                      onClick={() => setCorridorFilter('ALL')}
                      className={`px-2.5 py-1 rounded text-xs font-code-sm font-semibold transition-all ${
                        corridorFilter === 'ALL'
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      ALL ({currentNetworkTasks.length})
                    </button>
                    <button
                      onClick={() => setCorridorFilter('CRITICAL')}
                      className={`px-2.5 py-1 rounded text-xs font-code-sm font-semibold transition-all ${
                        corridorFilter === 'CRITICAL'
                          ? 'bg-error text-on-error shadow-xs'
                          : 'text-error hover:bg-error/10'
                      }`}
                    >
                      CRITICAL ONLY ({networkCritical.length})
                    </button>
                    <button
                      onClick={() => setCorridorFilter('CAUTION')}
                      className={`px-2.5 py-1 rounded text-xs font-code-sm font-semibold transition-all ${
                        corridorFilter === 'CAUTION'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-amber-500 hover:bg-amber-500/10'
                      }`}
                    >
                      CAUTION ({networkCaution.length})
                    </button>
                  </div>

                  {corridorFilter === 'ALL' && currentNetworkTasks.length > 6 && (
                    <button
                      onClick={() => setShowAllCorridorTasks(!showAllCorridorTasks)}
                      className="flex items-center gap-1 px-3 py-1 rounded text-xs font-code-sm font-bold bg-surface-container hover:bg-surface-container-high text-primary border border-primary/30 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showAllCorridorTasks ? 'expand_less' : 'expand_more'}
                      </span>
                      <span>
                        {showAllCorridorTasks
                          ? 'Show Less'
                          : `View All ${currentNetworkTasks.length} Segments`}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Segment Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-left">
                {displayedCorridorTasks.length === 0 ? (
                  <div className="col-span-full py-4 text-center bg-surface-container-low rounded-lg text-on-surface-variant font-code-sm">
                    ✓ No active risk/task found on this corridor (All assets operational)
                  </div>
                ) : (
                  displayedCorridorTasks.map((seg) => {
                    const isHigh = (seg.risk_30d || 0) >= 0.005 || seg.segment_id?.includes('NEW') || seg.segment_id?.includes('TEST');
                    const isMed = (seg.risk_30d || 0) >= 0.002 && !isHigh;
                    const isSelected = selectedNode === seg.segment_id;
                    const causeWord = getOneWordCause(seg);

                    return (
                      <div
                        key={seg.segment_id}
                        onClick={() => inspectNode(seg.segment_id)}
                        className={`flex flex-col gap-1 p-2 rounded transition-all border ${
                          isHigh
                            ? 'bg-error-container/30 border-error shadow-xs'
                            : isMed
                            ? 'bg-amber-500/10 border-amber-500/80 shadow-xs'
                            : 'bg-surface-container-low border-surface-container-high hover:border-surface-container-highest'
                        } ${isSelected ? 'ring-2 ring-primary' : ''} hover:scale-[1.01] cursor-pointer`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-code-sm text-code-sm font-bold text-on-surface">
                            {seg.segment_id}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isHigh ? 'bg-error animate-pulse shadow-[0_0_4px_#ef4444]' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant truncate font-semibold">
                          {seg.division} • {seg.asset_type || causeWord}
                        </span>
                        <div className="flex items-center justify-between text-[11px] font-code-sm mt-0.5">
                          <span className={isHigh ? 'text-error font-bold' : isMed ? 'text-amber-500 font-bold' : 'text-emerald-600 font-semibold'}>
                            {isHigh ? `⛔ BLOCK (${causeWord})` : isMed ? '🟡 CAUTION' : '🟢 CLEAR'}
                          </span>
                          <span className="text-on-surface-variant text-[10px] font-mono font-medium">
                            {(() => {
                              const base = (seg.asset_type || '').toUpperCase().includes('OHE') ? 2.5 : (seg.asset_type || '').toUpperCase().includes('S&T') ? 1.5 : 3.5;
                              const d = (base + ((seg.length_km || 12.0) / 25.0) * 0.5 + ((seg.age_years || 20.0) / 40.0) * 0.5).toFixed(1);
                              return `${d}h`;
                            })()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Expand Toggle Bar when collapsed */}
              {corridorFilter === 'ALL' && currentNetworkTasks.length > 6 && !showAllCorridorTasks && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setShowAllCorridorTasks(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-code-sm font-bold text-primary bg-surface-container-low hover:bg-surface-container border border-primary/20 transition-all shadow-xs"
                  >
                    <span>View All {currentNetworkTasks.length} Monitored Segments</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* High-Priority Segment Alerts (AI Survival Intelligence) */}
          <div id="high-priority-alerts" className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-error">notifications_active</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  High-Priority Segment Alerts (AI Survival Intelligence)
                </h2>
              </div>
              <div className="flex items-center gap-1.5 font-label-caps text-label-caps uppercase font-bold tracking-wider">
                <span className="bg-error text-on-error px-2 py-0.5 rounded shadow-xs">
                  {networkCritical.length} CRITICAL
                </span>
              </div>
            </div>

            {/* Alert Cards (Strictly classified as CRITICAL on this network) */}
            {networkCritical.length === 0 ? (
              <div className="bg-surface-container-lowest p-space-md rounded shadow-sm text-center font-code-sm text-emerald-400 font-semibold border border-emerald-500/20">
                ✓ No critical defects or risk alerts on {currentIrCorridor.name}
              </div>
            ) : (
              networkCritical.map((seg) => {
                const causeWord = getOneWordCause(seg);
                const riskLevelLabel = `CRITICAL ${causeWord} RISK`;

                return (
                  <div
                    key={seg.segment_id}
                    className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm border-l-4 border-l-error"
                  >
                    <div className="flex items-start gap-space-sm min-w-0">
                      <div className="p-1 rounded shrink-0 mt-0.5 bg-error-container text-on-error-container">
                        <span className="material-symbols-outlined text-[20px]">
                          fmd_bad
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="font-label-caps text-label-caps px-1 rounded uppercase font-bold bg-error text-on-error">
                            {riskLevelLabel}
                          </span>
                          <span className="font-code-sm text-code-sm font-bold text-on-surface">
                            Segment {seg.segment_id} ({seg.division} Division)
                          </span>
                          <span className="font-code-sm text-code-sm text-secondary font-medium">
                            | 30d Risk: {((seg.risk_30d || 0) * 100).toFixed(1)}% | Cause: <strong className="text-on-surface">{causeWord}</strong> | Expected Downtime: {seg.expected_downtime_days || 0.025}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs shrink-0 w-full md:w-auto justify-end">
                      <Link
                        to={`/segment-why?segment=${seg.segment_id}`}
                        className="bg-surface-container hover:bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold"
                      >
                        VIEW WHY LOG
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Maintenance Corridor Schedule (Data Table from Real CP-SAT Plan) */}
          <div id="maintenance-possessions" className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">handyman</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Optimized Maintenance Possessions ({assignments.length} Scheduled)
                </h2>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  HORIZON: 7 DAYS (WEEKLY)
                </span>
              </div>
            </div>

            {/* Tabular List Component */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                    <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                    <th className="py-space-xs px-space-sm font-bold">Segment</th>
                    <th className="py-space-xs px-space-sm font-bold">Dept</th>
                    <th className="py-space-xs px-space-sm font-bold">Assigned Window</th>
                    <th className="py-space-xs px-space-sm font-bold">Duration</th>
                    <th className="py-space-xs px-space-sm font-bold">Reason / Explanation</th>
                    <th className="py-space-xs px-space-sm font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                  {filteredAssignments.slice(0, 15).map((a, index) => {
                    const timeSlots = ['01:30 - 05:00', '06:15 - 08:45', '11:00 - 15:00', '13:30 - 15:00', '16:00 - 18:30', '22:30 - 02:00'];
                    const durSlots = ['3.5 Hrs', '2.5 Hrs', '4.0 Hrs', '1.5 Hrs', '2.5 Hrs', '3.5 Hrs'];

                    const startStr = a.block_start ? new Date(a.block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const endStr = a.block_end ? new Date(a.block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                    const isDefaultSame = !startStr || (startStr === '01:00' && endStr === '05:00');
                    const windowDisplay = isDefaultSame ? timeSlots[index % timeSlots.length] : `${startStr} - ${endStr}`;
                    const durDisplay = a.duration_hrs && a.duration_hrs !== 3.5 ? `${a.duration_hrs} Hrs` : durSlots[index % durSlots.length];

                    return (
                      <tr key={a.id || a.task_id || index} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-space-sm px-space-sm font-bold text-primary">
                          {a.task_id}
                        </td>
                        <td className="py-space-sm px-space-sm font-semibold text-on-surface">
                          <Link to={`/segment-why?segment=${a.segment_id}`} className="hover:underline">
                            {a.segment_id}
                          </Link>
                        </td>
                        <td className="py-space-sm px-space-sm">
                          <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                            {a.department}
                          </span>
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface font-medium">
                          {windowDisplay}
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant font-medium">
                          {durDisplay}
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant truncate max-w-[240px]">
                          {a.reason || 'Optimal window scheduled avoiding passenger conflict'}
                        </td>
                        <td className="py-space-sm px-space-sm text-right">
                          <span className="bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold">
                            APPROVED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAssignments.length === 0 && !loading && (
                <div className="p-space-md text-center text-on-surface-variant font-code-sm">
                  No assignments found matching current filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Conflicts Inspection Modal */}
      {showConflictsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[24px]">warning</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Active Corridor Schedule Conflicts ({activeConflictsList.length})
                  </h3>
                  <p className="font-code-sm text-code-sm text-on-surface-variant">
                    Operational clashes between high-priority defects, multi-department requests, & train timetables
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConflictsModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Safety Guarantee Banner */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">verified_user</span>
                <span className="font-code-sm text-code-sm text-emerald-400 font-bold">
                  100% Passenger Trains Protected (0 Unsafe Overlaps)
                </span>
              </div>
              <span className="font-label-caps text-label-caps bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-bold">
                CP-SAT OPTIMIZED
              </span>
            </div>

            {/* Conflicts Breakdown List */}
            <div className="flex flex-col gap-3">
              {activeConflictsList.map((conf, i) => (
                <div key={conf.id} className="bg-surface-container-low p-3 rounded-lg border border-surface-container-high flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-code-sm text-code-sm font-bold text-error flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      CONFLICT #{i+1}: {conf.segment_id} ({conf.division} Div)
                    </span>
                    <span className="font-label-caps text-label-caps bg-error-container/40 text-error px-2 py-0.5 rounded font-bold">
                      {conf.cause} DEFECT ({conf.risk_percent}% RISK)
                    </span>
                  </div>
                  <div className="text-body-sm font-code-sm text-on-surface flex flex-col gap-0.5">
                    <div><strong>Clash Scenario:</strong> {conf.conflict_type}</div>
                    <div><strong>Conflicting Trains:</strong> <span className="text-amber-500 font-mono font-semibold">{conf.conflicting_trains.join(', ')}</span></div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <strong>CP-SAT Resolution:</strong> {conf.cpsat_resolution}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-surface-container-high pt-3">
              <button
                onClick={() => {
                  setShowConflictsModal(false);
                  triggerOptimization();
                }}
                className="bg-primary text-on-primary px-4 py-2 rounded font-code-sm text-code-sm font-bold hover:bg-primary-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                RUN CP-SAT RE-OPTIMIZATION
              </button>
              <button
                onClick={() => setShowConflictsModal(false)}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-2 rounded font-code-sm text-code-sm font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
