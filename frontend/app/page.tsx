"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRightLeft,
  MessageCircle,
  Video,
  Star,
  Zap,
  Heart,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

// ========== TYPE DEFINITIONS ==========
interface GalleryImage {
  src: string;
  alt: string;
  name: string;
  age: number;
}

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

interface PhotoCardProps {
  src: string;
  alt: string;
  name: string;
  age: number;
}

// ========== CONFIGURATION: Image Sources ==========
const IMAGES: {
  hero: string;
  gallery: GalleryImage[];
} = {
  hero: "https://images.pexels.com/photos/14916276/pexels-photo-14916276.jpeg",
  gallery: [
    {
      src: "https://images.pexels.com/photos/3754270/pexels-photo-3754270.jpeg",
      alt: "Happy couple walking",
      name: "Alex & Jamie",
      age: 29,
    },
    {
      src: "https://images.pexels.com/photos/14446867/pexels-photo-14446867.jpeg",
      alt: "Couple laughing",
      name: "Sam & Chris",
      age: 27,
    },
    {
      src: "https://images.pexels.com/photos/32439850/pexels-photo-32439850.jpeg",
      alt: "Romantic dinner",
      name: "Taylor & Jordan",
      age: 31,
    },
    {
      src: "https://images.pexels.com/photos/812258/pexels-photo-812258.jpeg",
      alt: "Couple hiking",
      name: "Casey & Avery",
      age: 26,
    },
  ],
};

// ========== REUSABLE COMPONENTS ==========
const AnimatedSection = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <GlassCard className="p-6 text-center hover:shadow-xl transition-all duration-300 group">
    <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </GlassCard>
);

const TestimonialCard = ({ quote, author, role }: TestimonialCardProps) => (
  <GlassCard className="p-6">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      ))}
    </div>
    <p className="text-muted-foreground italic mb-4">“{quote}”</p>
    <p className="font-semibold">{author}</p>
    <p className="text-xs text-muted-foreground">{role}</p>
  </GlassCard>
);

const PricingCard = ({
  name,
  price,
  description,
  features,
  buttonText,
  popular = false,
}: PricingCardProps) => (
  <GlassCard
    className={`p-6 text-center relative ${popular ? "border-primary shadow-lg scale-105" : ""}`}
  >
    {popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
        Most Popular
      </span>
    )}
    <h3 className="text-2xl font-bold mb-2">{name}</h3>
    <div className="mb-4">
      <span className="text-3xl font-bold">{price}</span>
      {price !== "Free" && (
        <span className="text-muted-foreground">/month</span>
      )}
    </div>
    <p className="text-sm text-muted-foreground mb-6">{description}</p>
    <ul className="space-y-2 mb-8 text-sm text-left">
      {features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> {feature}
        </li>
      ))}
    </ul>
    <Button variant={popular ? "default" : "outline"} className="w-full">
      {buttonText}
    </Button>
  </GlassCard>
);

// Gallery Photo Card with hover effect
const PhotoCard = ({ src, alt, name, age }: PhotoCardProps) => (
  <motion.div
    className="relative group overflow-hidden rounded-2xl shadow-xl"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative aspect-4/5 w-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />
    </div>
    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
      <div className="text-white">
        <p className="font-semibold">
          {name}, {age}
        </p>
        <p className="text-sm text-white/80">Found love ❤️</p>
      </div>
    </div>
  </motion.div>
);

// ========== MAIN LANDING PAGE ==========
export default function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-linear-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Matchify+ logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-2xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Matchify+
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>
              Log in
            </Button>
            <Button onClick={() => setRegisterModalOpen(true)}>Sign up</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 space-y-32">
        {/* Hero Section – split text + image */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Find your perfect match with AI-powered discovery.
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Join thousands of singles who found love using our intelligent
              matching system.
            </motion.p>
            <motion.div
              className="flex gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={() => setRegisterModalOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Heart className="h-5 w-5" /> Get Started
              </Button>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Discover More
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={IMAGES.hero}
                alt="Happy couple"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Precision Meets Passion
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our precision meets passion approach ensures that we deliver a
              tailored experience for each client.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Sparkles}
              title="AI Recommendations"
              description="Our advanced algorithms analyze your preferences and behaviors to recommend potential matches based on your interests and values."
            />
            <FeatureCard
              icon={ArrowRightLeft}
              title="Swipe with Gestures"
              description="Use your fingers to swipe left or right to navigate through our app. Natural and intuitive."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Real-Time Chat"
              description="Interact with real-time chat features to communicate with your partner instantly."
            />
            <FeatureCard
              icon={Video}
              title="Video Calls"
              description="Video calls allow you to see and hear each other in real-time. Perfect for getting to know someone better."
            />
          </div>
        </AnimatedSection>

        {/* Gallery Section – Interactive Couple Photos */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Love Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thousands of couples found their soulmate on Matchify+. Here are
              just a few.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMAGES.gallery.map((img, idx) => (
              <PhotoCard
                key={idx}
                src={img.src}
                alt={img.alt}
                name={img.name}
                age={img.age}
              />
            ))}
          </div>
        </AnimatedSection>

        {/* Testimonials */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Verified Stories
            </h2>
            <p className="text-muted-foreground">
              Real people, real connections.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard
              quote="Was it hard to find someone special? Matchify felt different from all the others. I found my soulmate in this app."
              author="Sarah J."
              role="Verified User"
            />
            <TestimonialCard
              quote="The AI recommendations are exactly what I needed. It didn't just find someone I liked, it understood me and helped me choose a person for me."
              author="Michael T."
              role="Premium Member"
            />
          </div>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Tier
            </h2>
            <p className="text-muted-foreground">
              Start free, upgrade anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="Free"
              description="Perfect to get started"
              features={[
                "Basic matching",
                "Swipe up to 20 profiles/day",
                "Text chat",
                "Limited filters",
              ]}
              buttonText="Sign Up Free"
            />
            <PricingCard
              name="Premium"
              price="$19.99"
              description="Most popular choice"
              features={[
                "Advanced search",
                "Live video calls",
                "Smart matching",
                "See who liked you",
                "Unlimited swipes",
              ]}
              buttonText="Upgrade Now"
              popular={true}
            />
            <PricingCard
              name="Basic"
              price="$9.99"
              description="Good value"
              features={[
                "Advanced search",
                "Live video calls",
                "Smart matching",
                "Swipe up to 100/day",
              ]}
              buttonText="Choose Basic"
            />
          </div>
        </AnimatedSection>

        {/* Final CTA */}
        <AnimatedSection>
          <GlassCard className="p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Gala awaits in your pocket.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Combine features like live video calls, messaging, and more to
              create the perfect romantic evening.
            </p>
            <Button size="lg" className="gap-2">
              <Heart className="h-5 w-5" /> Start Your Journey
            </Button>
          </GlassCard>
        </AnimatedSection>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm py-8 border-t border-white/10">
          <p>
            &copy; {new Date().getFullYear()} Matchify+. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl">
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome Back
          </DialogTitle>
          <LoginForm onSuccess={() => setLoginModalOpen(false)} />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                setLoginModalOpen(false);
                setRegisterModalOpen(true);
              }}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl">
          <DialogTitle className="text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
          <RegisterForm onSuccess={() => setRegisterModalOpen(false)} />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => {
                setRegisterModalOpen(false);
                setLoginModalOpen(true);
              }}
              className="text-primary hover:underline"
            >
              Log in
            </button>
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
