import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { loginUser } from "../features/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.theme.isDark);
  const { loading, error } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/");
    }
  };

  return (
    <div
      className={`min-h-screen flex relative overflow-hidden ${
        isDark
          ? "bg-linear-to-br from-gray-900 via-gray-800 to-black text-white"
          : "bg-linear-to-br from-gray-400 via-white to-gray-300 text-gray-900"
      }`}
    >

      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full top-20 left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-3xl rounded-full bottom-10 right-20"></div>

      <style>
        {`
        @keyframes slideUpFade {
          0% {
            transform: translateY(40px);
            opacity: 0;
            filter: blur(10px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes floatText {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .rps-animate {
          animation:
            slideUpFade 0.8s ease forwards,
            floatText 3s ease-in-out infinite;
        }

        .delay-1 { animation-delay: 0.2s, 1s; }
        .delay-2 { animation-delay: 0.6s, 1.4s; }
        .delay-3 { animation-delay: 1s, 1.8s; }
        `}
      </style>

      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10 relative z-10">


        <div
          className={`w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-lg ${
            isDark
              ? "bg-gray-800/80 ring-1 ring-gray-700"
              : "bg-white/80 ring-1 ring-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-md border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                }`}
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="block text-sm mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 pr-12 rounded-md border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 bottom-2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-blue-500 text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 font-medium">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="text-center space-y-8">
          <div className="text-5xl font-extrabold space-y-4 tracking-wide">
            <div
              className=" rps-animate delay-1 
              bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 
              bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
            >
              ROCK
            </div>

            <div
              className=" text-7xl rps-animate delay-2 
              bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 
              bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
            >
              PAPER
            </div>

            <div
              className=" text-8xl rps-animate delay-3 
              bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 
              bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
            >
              SCISSORS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
