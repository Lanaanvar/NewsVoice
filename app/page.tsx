"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/lib/context/auth-context";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import TechImg from "../components/assets/Tech.jpg";
import BizImg from "../components/assets/Business.jpg";
import PolImg from "../components/assets/Politics.jpg";
import SportImg from "../components/assets/Sports.jpg";
import HealthImg from "../components/assets/Health.jpg";
import EntertainmentImg from "../components/assets/Entertainment.jpg";
import ScienceImg from "../components/assets/Science.jpg";

// ...imports stay the same

export default function Home() {
  const router = useRouter();
  const { userLoggedIn, loading } = useAuth() || {};
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      router.replace("/auth/signup");
    }
    if (!loading && userLoggedIn) {
      fetchCategories();
    }
  }, [userLoggedIn, loading, router]);

  const fetchCategories = async () => {
    try {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setCategories([]);
        return;
      }
      user.getIdToken(true).then((idToken: string) => {
        fetch("http://localhost:8000/user/categories", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Unauthorized");
            return res.json();
          })
          .then((data) => setCategories(data))
          .catch((err) => {
            console.error("Failed to fetch categories:", err);
            setCategories([]);
          });
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  if (loading || !userLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center text-[#e0e7ff] bg-gradient-to-br from-[#0a0f1f] via-[#111b30] to-[#1f2d53]">
        <p className="text-xl font-semibold animate-pulse">
          {loading ? "Loading..." : "Redirecting to signup..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#111b30] to-[#1f2d53] text-[#e0e7ff] flex flex-col">
      <Header />
      <main className="flex-1 px-0 md:px-8 pt-0 md:pt-10 pb-24">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-[#1e293b] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Made For You
              </h1>
              <p className="text-[#94a3b8] text-xl mb-4">
                Your personalized audio brief is ready
              </p>
              <button
                className="bg-[#f8fafc] text-[#0a0f1f] border border-[#cbd5e1] hover:bg-[#e2e8f0] hover:border-[#94a3b8] font-semibold px-6 py-3 rounded-full shadow-sm transition duration-200 flex items-center gap-2 text-lg"
                onClick={() => router.push("/audio")}
              >
                Listen Now <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            {/* <div className="mt-6 md:mt-0">
              <Image
                src="/category-placeholder.png"
                alt="Audio"
                width={100}
                height={100}
                className="rounded-xl shadow-md"
              />
            </div> */}
          </div>
        </section>

        {/* Category Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Browse by Category
          </h2>
          <div className="relative">
            <button
              aria-label="Scroll left"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#1f2d53] hover:bg-[#3b82f6] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto pb-2 px-12 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {categories.map((category: any, index: number) => {
                let imageSrc = "/category-placeholder.png";
                if (typeof category === "object" && category.name) {
                  if (category.name === "Technology") imageSrc = TechImg.src;
                  else if (category.name === "Business") imageSrc = BizImg.src;
                  else if (category.name === "Politics") imageSrc = PolImg.src;
                  else if (category.name === "Health") imageSrc = HealthImg.src;
                  else if (category.name === "Entertainment")
                    imageSrc = EntertainmentImg.src;
                  else if (category.name === "Science")
                    imageSrc = ScienceImg.src;
                  else if (category.name === "Sports") imageSrc = SportImg.src;
                }
                return (
                  <div
                    key={category.id || index}
                    className="relative min-w-[220px] sm:min-w-[260px] md:min-w-[320px] w-[90vw] sm:w-[320px] md:w-[340px] h-40 sm:h-48 md:h-56 bg-gradient-to-br from-[#23232a] via-[#23232a] to-[#18181b] rounded-2xl flex flex-col justify-end p-0 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#23232a]/60 group overflow-hidden"
                    onClick={() => {
                      console.log(category.id);
                      router.push(
                        `/audio?category=${encodeURIComponent(
                          category.id
                        )}`
                      );
                    }}
                  >
                    <Image
                      src={imageSrc}
                      alt={category.name || "Category"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-[#f8fafc] text-[#0a0f1f] border border-[#cbd5e1] group-hover:bg-[#e2e8f0] group-hover:border-[#94a3b8] px-3 py-1 rounded-md shadow-md transition duration-200">
                      <span className="font-semibold text-sm truncate block text-center">
                        {category.name || "Untitled"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              aria-label="Scroll right"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#1f2d53] hover:bg-[#3b82f6] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
