import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../features/userSlice";
import { toggleTheme } from "../features/themeSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.user);
  const { isDark } = useSelector((state) => state.theme);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const result = await dispatch(signupUser(formData));
    if (signupUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <>
      <style>
        {`
        @keyframes bounce-in-top {
          0% { transform: translateY(-300px); opacity: 0; }
          60% { transform: translateY(30px); opacity: 1; }
          80% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        .bounce-in-top {
          animation: bounce-in-top 3s ease-in-out infinite;
        }

        .word1 { animation-delay: 0s; }
        .word2 { animation-delay: 0.4s; }
        .word3 { animation-delay: 0.7s; }
        `}
      </style>

      <div
        className={
          isDark
            ? "bg-gray-900 text-white min-h-screen"
            : "bg-gray-100 text-black min-h-screen"
        }
      >
        {/* TOP BAR */}
        <div className="p-4 flex justify-end">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="px-3 py-1 border rounded-md text-sm"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="min-h-screen flex flex-col lg:flex-row">

          {/* LEFT ANIMATION */}
          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="text-center font-extrabold space-y-4">
              <div className="text-5xl bounce-in-top word1 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                ROCK
              </div>

              <div className="text-7xl bounce-in-top word2 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                PAPER
              </div>

              <div className="text-8xl bounce-in-top word3 bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                SCISSORS
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="lg:w-1/2 flex items-center justify-center p-6 relative">

            {/* BACKGROUND GLOWS (FIXED) */}
            <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full top-20 left-20 pointer-events-none"></div>
            <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-3xl rounded-full bottom-10 right-20 pointer-events-none"></div>

            {/* FORM CARD */}
            <div
              className={`relative z-10 w-full max-w-md p-8 min-h-[400px] rounded-2xl shadow-2xl flex flex-col justify-center ${
                isDark
                  ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700"
                  : "bg-white"
              }`}
            >
              <h2 className="text-3xl font-bold mb-8 text-center">
                Create Account
              </h2>

              <form onSubmit={handleSignup} className="space-y-5">

                <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-base rounded-md border outline-none ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "border-gray-300"
                  }`}
                />

                <input
                  name="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-base rounded-md border outline-none ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "border-gray-300"
                  }`}
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-base rounded-md border outline-none ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "border-gray-300"
                  }`}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <p className="text-center text-md mt-6">
                Already have an account?{" "}
                <Link className="text-blue-400 font-medium" to="/login">
                  Login
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Signup;