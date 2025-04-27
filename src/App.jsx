// c:\xampp\htdocs\yani\birthday-tracker\src\App.jsx
import { useEffect, useState, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaBirthdayCake, FaSun, FaMoon } from "react-icons/fa";
import Confetti from "react-confetti";
import useSound from "use-sound";
import Footer from './components/footer'; // Correct import

// --- Configuration ---
const BIRTHDAY_MONTH = 5 // May (1-based for easier comparison)
const BIRTHDAY_DAY = 11; // Example Day
const BIRTHDAY_PERSON_NAME = "Dianarra Celestine";
// ---------------------

// Helper for month name
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const BIRTHDAY_MONTH_NAME = MONTH_NAMES[BIRTHDAY_MONTH - 1]; // Get month name from 1-based index

function App() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [isBirthday, setIsBirthday] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [playSound] = useSound("/birthday.mp3", { volume: 0.7 });

  // --- Refs ---
  const timerIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const hasAnimatedBirthdayProgress = useRef(false);

  // --- State for Dark Mode Placeholder ---
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light

  // --- Helper Functions ---
  const checkIsBirthday = () => {
    const now = new Date();
    return now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    let nextBirthdayYear = now.getFullYear();
    if (
      now.getMonth() + 1 > BIRTHDAY_MONTH ||
      (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() >= BIRTHDAY_DAY)
    ) {
      nextBirthdayYear += 1;
    }
    const nextBirthdayDate = new Date(nextBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    const difference = nextBirthdayDate - now;
    if (difference <= 0 || checkIsBirthday()) {
       return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    } else {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
  };

  const calculateTargetProgress = () => {
    if (checkIsBirthday()) return 100;
    const now = new Date();
    let lastBirthdayYear = now.getFullYear();
    if (now.getMonth() + 1 < BIRTHDAY_MONTH || (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() < BIRTHDAY_DAY)) {
        lastBirthdayYear -= 1;
    }
    const lastBirthday = new Date(lastBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    let nextBirthdayYear = now.getFullYear();
    if (now.getMonth() + 1 > BIRTHDAY_MONTH || (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() >= BIRTHDAY_DAY)) {
        nextBirthdayYear += 1;
    }
    const nextBirthday = new Date(nextBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    const totalDurationMs = nextBirthday - lastBirthday;
    const elapsedMs = now - lastBirthday;
    if (totalDurationMs <= 0) return 0;
    const percentage = Math.min(100, (elapsedMs / totalDurationMs) * 100);
    return percentage;
  };

  // --- Effects ---
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const updateState = () => {
        const currentlyIsBirthday = checkIsBirthday();
        setIsBirthday(currentlyIsBirthday);
        if (!currentlyIsBirthday) {
            setTimeLeft(calculateTimeLeft());
            hasAnimatedBirthdayProgress.current = false;
            if (confettiVisible) setConfettiVisible(false);
            if (modalVisible) setModalVisible(false);
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            if (!confettiVisible && !modalVisible) {
                setConfettiVisible(true);
                setTimeout(() => {
                    setModalVisible(true);
                    playSound();
                }, 2000);
            }
        }
    };
    updateState();
    timerIntervalRef.current = setInterval(updateState, 1000);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [playSound, confettiVisible, modalVisible]);

  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const targetProgress = calculateTargetProgress();
    if (isBirthday) {
        if (!hasAnimatedBirthdayProgress.current) {
            setProgress(0);
            progressIntervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressIntervalRef.current);
                        hasAnimatedBirthdayProgress.current = true;
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
        } else {
            setProgress(100);
        }
    } else {
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const difference = targetProgress - prev;
                if (Math.abs(difference) < 0.5) {
                    clearInterval(progressIntervalRef.current);
                    return targetProgress;
                }
                return prev + difference * 0.1;
            });
        }, 50);
    }
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [isBirthday]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    // Use full height, flex column, center items horizontally AND vertically
    // overflow-hidden here is an alternative to putting it on html/body in index.html
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4 relative transition-colors duration-300 ease-in-out overflow-hidden">

        {/* Dark Mode Toggle stays absolute */}
        <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="absolute top-5 right-5 z-30 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        {/* Confetti Layer */}
        {confettiVisible && (
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={isBirthday ? 400 : 0}
                recycle={false}
                style={{ position: 'fixed', top: 0, left: 0, zIndex: 10 }}
                onConfettiComplete={() => setConfettiVisible(false)}
            />
        )}

        {/* Modal Popup */}
        {modalVisible && (
            <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-4 w-full max-w-xs sm:max-w-sm transition-colors duration-300"
            >
                <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                🎉 Happy Birthday {BIRTHDAY_PERSON_NAME}! 🎉
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                Wishing you all the happiness!
                </p>
            </motion.div>
            </div>
        )}

        {/* Main Content Area - No longer needs flex-grow wrapper */}
        <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            // Removed justify-center here as parent div handles centering
            className="flex flex-col items-center gap-6 md:gap-8 z-20 w-full px-4"
        >

            {/* --- Progress Card --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col items-center space-y-4 w-full max-w-xs sm:max-w-sm transition-colors duration-300">
            <h2 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400 text-center">
                {isBirthday ? "Celebrating Today!" : `Next Birthday Progress`}
            </h2>
            <div className="relative">
                <svg className="w-32 h-32 sm:w-36 sm:h-36 transform -rotate-90">
                <circle
                    cx="50%" cy="50%" r={radius} strokeWidth="8" fill="transparent"
                    className="text-gray-200 dark:text-gray-700 transition-colors duration-300" stroke="currentColor"
                />
                <motion.circle
                    cx="50%" cy="50%" r={radius} strokeWidth="8" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    transition={{ duration: 0.5, ease: "easeInOut" }} strokeLinecap="round"
                    className="text-pink-500 dark:text-pink-400 transition-colors duration-300" stroke="currentColor"
                />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                <FaBirthdayCake className="text-pink-500 dark:text-pink-400 mb-1 transition-colors duration-300" size={24} />
                <span className="text-pink-600 dark:text-pink-400 text-lg font-semibold mt-1 transition-colors duration-300">
                    {isBirthday && hasAnimatedBirthdayProgress.current ? '100%' : `${Math.floor(clampedProgress)}%`}
                </span>
                </div>
            </div>
            </div>

            {/* --- Countdown Card --- */}
            {!isBirthday && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 md:p-8 flex flex-col items-center space-y-5 w-full max-w-xs sm:max-w-sm transition-colors duration-300"
            >
                <h2 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-400 text-center">
                {BIRTHDAY_PERSON_NAME}'s Next Birthday In:
                </h2>
                {/* Time Units */}
                <div className="flex justify-center gap-3 md:gap-4 text-pink-500 font-bold text-xl md:text-2xl w-full">
                {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="flex flex-col items-center bg-pink-50 dark:bg-gray-700 p-2 rounded-lg w-1/4">
                    <span className="tabular-nums">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{unit}</span>
                    </div>
                ))}
                </div>
                {/* Revisit Message */}
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4 px-2"> {/* Added margin-top, centering, padding */}
                    Come back every {BIRTHDAY_MONTH_NAME} {BIRTHDAY_DAY} to celebrate!
                </p>
            </motion.div>
            )}

            {/* --- Birthday Message Card --- */}
            {isBirthday && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col items-center space-y-3 w-full max-w-xs sm:max-w-sm text-center transition-colors duration-300"
            >
                <h2 className="text-lg sm:text-xl font-semibold text-pink-600 dark:text-pink-400">
                    It's Birthday Time!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hope {BIRTHDAY_PERSON_NAME} has a fantastic day!
                </p>
            </motion.div>
            )}

        </motion.div> {/* End Main Content Area */}

        {/* Footer is rendered here, but its position is controlled by its own classes */}
        <Footer />

    </div> // End Main Container Div
  );
}

export default App;
