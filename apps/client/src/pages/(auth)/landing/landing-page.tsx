import Navbar from "./components/landing-navbar";

import { config } from "@shared/config/config";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Star } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <main className="lg:h-[calc(80vh-100px)] relative z-10 flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg bg-accent">
              <Layers className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              MonoMERN Stack
            </h1>
            <p className="text-xl text-stone-400 mb-8 max-w-2xl mx-auto">
              Full-stack {config.app.name} boilerplate powered by MongoDB,
              Express, React, and Node.js — built for speed, scalability, and
              security.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="https://github.com/frontend-alex/MonoMERN-Stack">
              <Button variant="outline" size="lg">
                <img
                  loading="lazy"
                  src="/images/providers/github.webp"
                  className="size-4"
                />
                View on GitHub
              </Button>
            </Link>
            <Link to="https://github.com/frontend-alex/MonoMERN-Stack">
              <Button variant="outline" size="lg">
                <Star className="mr-2 h-4 w-4" />
                Star
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
