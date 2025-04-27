import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaBirthdayCake } from "react-icons/fa";
import Confetti from "react-confetti";
import useSound from "use-sound";

const birthdayMonth = 4; // May
const birthdayDay = 27; // 11th

function App() {
  const [timeLeft, setTimeLeft] = useState({});
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [isBirthday, setIsBirthday] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playSound] = useSound("/birthday.mp3");
  const [modalVisible, setModalVisible] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);

  // Calculate the remaining time until the next birthday
  const calculateTimeLeft = () => {
    const now = new Date();
    let birthday = new Date(now.getFullYear(), birthdayMonth - 1, birthdayDay);

    if (now > birthday) {
      birthday = new Date(now.getFullYear() + 1, birthdayMonth - 1, birthdayDay);
    }

    const difference = birthday - now;

    if (difference <= 0) {
      setIsBirthday(true);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    } else {
      setIsBirthday(false); // Reset after birthday
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }
  };

  // Calculate the progress percentage towards the next birthday
  const calculateProgress = () => {
    const now = new Date();
    const lastBirthday = new Date(
      now.getFullYear() - (now < new Date(now.getFullYear(), birthdayMonth - 1, birthdayDay) ? 1 : 0),
      birthdayMonth - 1,
      birthdayDay
    );
    const nextBirthday = new Date(
      now.getFullYear() + (now > new Date(now.getFullYear(), birthdayMonth - 1, birthdayDay) ? 1 : 0),
      birthdayMonth - 1,
      birthdayDay
    );

    const totalYearMs = nextBirthday - lastBirthday;
    const elapsedMs = now - lastBirthday;
    const percentage = Math.min(100, (elapsedMs / totalYearMs) * 100);
    setTargetProgress(percentage);
  };

  useEffect(() => {
    calculateTimeLeft();
    calculateProgress();
    const timer = setInterval(() => {
      calculateTimeLeft();
      if (new Date().getSeconds() === 0) {
        calculateProgress();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isBirthday) {
      // Once birthday, progress bar fills up to 100% and stays there
      setProgress(100); // Set progress to 100 immediately
      setConfettiVisible(true); // Show confetti immediately after reaching 100%
      setTimeout(() => {
        setModalVisible(true);
        playSound();
      }, 2500); // Show modal after a short delay
    } else {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= targetProgress) {
            clearInterval(interval);
            return targetProgress;
          }
          return prev + 1;
        });
      }, 20); // Speed of progress bar filling normally
    }
    return () => clearInterval(interval);
  }, [isBirthday, targetProgress, playSound]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const now = new Date();
    const birthday = new Date(now.getFullYear(), birthdayMonth - 1, birthdayDay);

    // Check if today is the birthday day
    if (now.getDate() === birthday.getDate() && now.getMonth() === birthday.getMonth()) {
      setIsBirthday(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f9fafb] to-[#e5e7eb] flex flex-col items-center justify-center p-8 space-y-8 overflow-hidden">
      {/* Confetti only appears if it's the birthday and after reaching 100% */}
      {confettiVisible && (
        <Confetti numberOfPieces={300} recycle={false} className="z-40" />
      )}

      {/* Modal Popup */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4 w-80"
          >
            <h1 className="text-2xl font-bold text-pink-600">
              🎉 Happy Birthday Dianarra! 🎉
            </h1>
            <p className="text-gray-600">Wishing you all the happiness you deserve!</p>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row items-center justify-center gap-8"
      >

        {/* Progress Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center space-y-4 w-auto">
          <h2 className="text-lg font-semibold text-gray-700">Progress to your Next Birthday</h2>
          <div className="relative">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#EC4899"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <FaBirthdayCake className="text-pink-500" size={28} />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-pink-600 text-lg font-bold mt-1"
              >
                {Math.floor(progress)}%
              </motion.span>
            </div>
          </div>
        </div>

        {/* Countdown Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center space-y-6 w-80">
          {!isBirthday && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 text-center">
                Dianarra Celestine's Next Birthday In:
              </h2>
              <div className="flex justify-center gap-4 text-pink-500 font-bold text-lg">
                <div className="flex flex-col items-center">
                  <span>{timeLeft.days}</span>
                  <span className="text-xs text-gray-500">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.hours}</span>
                  <span className="text-xs text-gray-500">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.minutes}</span>
                  <span className="text-xs text-gray-500">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.seconds}</span>
                  <span className="text-xs text-gray-500">Seconds</span>
                </div>
              </div>
            </>
          )}
        </div>

      </motion.div>
    </div>
  );
}

export default App;