import { useEffect, useState, useRef } from "react"; // Added useRef
import { motion } from "framer-motion";
import { FaBirthdayCake } from "react-icons/fa";
import Confetti from "react-confetti";
import useSound from "use-sound";

// --- Configuration ---
const BIRTHDAY_MONTH = 5; // May (1-based for easier comparison)
const BIRTHDAY_DAY = 11;
const BIRTHDAY_PERSON_NAME = "Dianarra Celestine"; // Make the name configurable
// ---------------------

function App() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0); // Current animated progress
  const [isBirthday, setIsBirthday] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [playSound] = useSound("/birthday.mp3", { volume: 0.7 }); // Added volume option

  // Use refs to track intervals and prevent multiple initializations/clears
  const timerIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const hasAnimatedBirthdayProgress = useRef(false); // Track if birthday animation ran

  // --- Helper Functions ---

  // Checks if today is the birthday
  const checkIsBirthday = () => {
    const now = new Date();
    return now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;
  };

  // Calculates time left until the *next* birthday
  const calculateTimeLeft = () => {
    const now = new Date();
    let nextBirthdayYear = now.getFullYear();

    // Check if the birthday this year has already passed or is today
    if (
      now.getMonth() + 1 > BIRTHDAY_MONTH ||
      (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() >= BIRTHDAY_DAY)
    ) {
      // If today is the birthday, or it has passed, target next year's birthday
      nextBirthdayYear += 1;
    }

    const nextBirthdayDate = new Date(nextBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    const difference = nextBirthdayDate - now;

    // If the difference is negative (shouldn't happen with the logic above, but safety check)
    // or if it's the actual birthday day, return zeros for the countdown display.
    // The actual "is it birthday?" logic is handled by checkIsBirthday()
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

  // Calculates the progress percentage towards the next birthday
  const calculateTargetProgress = () => {
    if (checkIsBirthday()) {
      return 100; // Target is 100% on the birthday
    }

    const now = new Date();
    let lastBirthdayYear = now.getFullYear();
    // If the birthday hasn't happened this year yet, the last birthday was last year
    if (now.getMonth() + 1 < BIRTHDAY_MONTH || (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() < BIRTHDAY_DAY)) {
        lastBirthdayYear -= 1;
    }
    const lastBirthday = new Date(lastBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);

    let nextBirthdayYear = now.getFullYear();
     // If the birthday this year has already passed or is today
    if (now.getMonth() + 1 > BIRTHDAY_MONTH || (now.getMonth() + 1 === BIRTHDAY_MONTH && now.getDate() >= BIRTHDAY_DAY)) {
        nextBirthdayYear += 1;
    }
    const nextBirthday = new Date(nextBirthdayYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);


    const totalDurationMs = nextBirthday - lastBirthday;
    const elapsedMs = now - lastBirthday;

    // Prevent division by zero if dates are somehow the same
    if (totalDurationMs <= 0) return 0;

    const percentage = Math.min(100, (elapsedMs / totalDurationMs) * 100);
    return percentage;
  };


  // --- Effects ---

  // Main timer effect for countdown and state updates
  useEffect(() => {
    // Clear any existing timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Function to run updates
    const updateState = () => {
        const currentlyIsBirthday = checkIsBirthday();
        setIsBirthday(currentlyIsBirthday); // Update birthday status

        if (!currentlyIsBirthday) {
            setTimeLeft(calculateTimeLeft()); // Update countdown only if not birthday
            hasAnimatedBirthdayProgress.current = false; // Reset birthday animation flag when it's over
            setConfettiVisible(false); // Ensure confetti is off
            setModalVisible(false); // Ensure modal is off
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Show 0s on birthday
            // Trigger confetti and modal only once when birthday starts
            if (!confettiVisible) { // Check if confetti isn't already visible
                setConfettiVisible(true);
                setTimeout(() => {
                    setModalVisible(true);
                    playSound();
                }, 1500); // Delay modal slightly after confetti
            }
        }
    };

    // Run immediately on mount
    updateState();

    // Set up the interval
    timerIntervalRef.current = setInterval(updateState, 1000);

    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [playSound]); // Include playSound in dependency array


  // Effect for handling progress bar animation
  useEffect(() => {
    // Clear any existing progress animation interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const targetProgress = calculateTargetProgress(); // Calculate where the bar should be

    if (isBirthday) {
        // --- Birthday Animation ---
        if (!hasAnimatedBirthdayProgress.current) {
            // Animate from 0 to 100 only once when birthday starts
            setProgress(0); // Start animation from 0
            progressIntervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressIntervalRef.current);
                        hasAnimatedBirthdayProgress.current = true; // Mark animation as done
                        return 100;
                    }
                    return prev + 2; // Faster animation for birthday (adjust speed here)
                });
            }, 30); // Animation interval speed
        } else {
            // If animation already ran, just ensure progress stays at 100
            setProgress(100);
        }
    } else {
        // --- Normal Progress Animation ---
        // Animate towards the calculated target progress
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                // Smoothly move towards target
                const difference = targetProgress - prev;
                if (Math.abs(difference) < 0.5) { // Close enough, stop interval
                    clearInterval(progressIntervalRef.current);
                    return targetProgress;
                }
                // Move a fraction of the difference each step for smoothness
                return prev + difference * 0.1; // Adjust multiplier for animation speed/smoothness
            });
        }, 50); // Normal progress update interval
    }

    // Cleanup interval on change or unmount
    return () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
    };
  }, [isBirthday]); // Rerun this effect only when isBirthday status changes


  // --- SVG Progress Bar Calculation ---
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Ensure progress doesn't go below 0 or above 100 for calculation
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f9fafb] to-[#e5e7eb] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative"> {/* Added relative positioning */}
      {/* Confetti Layer - controlled by state */}
      {confettiVisible && (
        <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={isBirthday ? 400 : 0} // More pieces on birthday
            recycle={false}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 10 }} // Ensure it covers screen
            onConfettiComplete={() => setConfettiVisible(false)} // Optional: hide confetti component after animation
        />
      )}

      {/* Modal Popup - controlled by state */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 text-center space-y-4 w-full max-w-sm" // Responsive width
          >
            <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
              🎉 Happy Birthday {BIRTHDAY_PERSON_NAME}! 🎉
            </h1>
            <p className="text-gray-700 text-base md:text-lg">
              Wishing you all the happiness you deserve!
            </p>
            {/* Optional: Add a close button */}
            {/* <button
              onClick={() => setModalVisible(false)}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Close
            </button> */}
          </motion.div>
        </div>
      )}

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col items-center justify-center gap-6 md:gap-8 z-20" // Ensure content is above background but below modal/confetti
      >

        {/* Progress Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col items-center space-y-4 w-auto">
          <h2 className="text-base md:text-lg font-semibold text-gray-700 text-center px-4">
            {isBirthday ? "Celebrating!" : `Progress to ${BIRTHDAY_PERSON_NAME}'s Next Birthday`}
          </h2>
          <div className="relative">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#E5E7EB" // Light gray background
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#EC4899" // Pink progress color
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset} // Use state variable directly
                // Animate strokeDashoffset for smooth transitions
                transition={{ duration: 0.5, ease: "easeInOut" }}
                strokeLinecap="round" // Rounded ends
              />
            </svg>
            {/* Center Content (Icon and Percentage) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <FaBirthdayCake className="text-pink-500 mb-1" size={28} />
              <span className="text-pink-600 text-lg font-bold mt-1">
                {/* Display 100% immediately if it's the birthday and animation finished, otherwise show animated progress */}
                {isBirthday && hasAnimatedBirthdayProgress.current ? '100%' : `${Math.floor(clampedProgress)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Card - Only shown if NOT the birthday */}
        {!isBirthday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col items-center space-y-5 w-80"
          >
            <h2 className="text-base md:text-lg font-semibold text-gray-700 text-center">
              {BIRTHDAY_PERSON_NAME}'s Next Birthday In:
            </h2>
            <div className="flex justify-center gap-3 md:gap-4 text-pink-500 font-bold text-xl md:text-2xl w-full">
              {/* Use Object.entries for cleaner rendering */}
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center bg-pink-50 p-2 rounded-lg w-1/4">
                  <span className="tabular-nums">{String(value).padStart(2, '0')}</span> {/* Fixed width numbers */}
                  <span className="text-xs text-gray-500 capitalize">{unit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Birthday Message Card - Only shown ON the birthday */}
        {isBirthday && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }} // Slight delay
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col items-center space-y-4 w-80 text-center"
          >
             <h2 className="text-xl md:text-2xl font-bold text-pink-600">
                It's Birthday Time!
             </h2>
             <p className="text-gray-600">
                Hope {BIRTHDAY_PERSON_NAME} has a fantastic day!
             </p>
           </motion.div>
        )}

      </motion.div>
    </div>
  );
}

export default App;
