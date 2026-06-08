
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-grow flex flex-col w-full -mx-4 md:-mx-8">
      
{/*  TopNavBar  */}
<header className="w-full border-b border-outline-variant bg-transparent">
<div className="flex justify-between items-center w-full px-xl py-lg max-w-7xl mx-auto">
<div className="font-h3 text-h3 font-bold text-on-surface dark:text-on-surface">
                Kelas Frontend
            </div>
<nav className="hidden md:flex gap-xl">
<a className="nav-underline text-on-surface-variant hover:text-primary transition-colors duration-200 font-label text-label" href="#">Courses</a>
<a className="nav-underline text-on-surface-variant hover:text-primary transition-colors duration-200 font-label text-label" href="#">Curriculum</a>
<a className="nav-underline text-on-surface-variant hover:text-primary transition-colors duration-200 font-label text-label" href="#">Instructors</a>
<a className="nav-underline text-on-surface-variant hover:text-primary transition-colors duration-200 font-label text-label" href="#">Community</a>
</nav>
<div className="flex items-center gap-lg">
<a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label text-label hidden md:block" href="#">Sign In</a>
<a className="brutalist-button-primary px-lg py-sm font-button-md text-button-md" href="#">Enroll Now</a>
</div>
</div>
</header>
<main className="flex-grow flex flex-col">
{/*  Hero Section  */}
<section className="w-full max-w-7xl mx-auto px-xl py-6xl flex flex-col items-center justify-center text-center">
<h1 className="font-h1-mobile text-h1-mobile md:font-h1 md:text-h1 mb-xl text-primary max-w-4xl">
                Master the Modern Web.
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-3xl">
                A high-performance, developer-centric educational environment.
                Build production-ready applications with precision and modern tools.
            </p>
<div className="flex flex-col sm:flex-row gap-lg">
<a className="brutalist-button-primary px-xl py-lg font-button-lg text-button-lg" href="#">Start Coding Now</a>
<a className="brutalist-button-secondary px-xl py-lg font-button-lg text-button-lg" href="#">View Curriculum</a>
</div>
</section>
{/*  Features Bento Grid  */}
<section className="w-full max-w-7xl mx-auto px-xl py-5xl">
<div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
{/*  Feature 1  */}
<div className="brutalist-card p-xl flex flex-col">
<span className="material-symbols-outlined text-primary text-[32px] mb-lg" data-icon="terminal" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
<h3 className="font-h3 text-h3 mb-md text-on-surface">Project-Based Learning</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
                        Abandon endless tutorials. Build real-world projects that solve actual problems using the latest frontend tech stack.
                    </p>
</div>
{/*  Feature 2  */}
<div className="brutalist-card p-xl flex flex-col">
<span className="material-symbols-outlined text-primary text-[32px] mb-lg" data-icon="groups" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
<h3 className="font-h3 text-h3 mb-md text-on-surface">Expert Mentors</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
                        Learn directly from industry veterans who have shipped code at scale. Get code reviews that actually improve your skills.
                    </p>
</div>
{/*  Feature 3  */}
<div className="brutalist-card p-xl flex flex-col">
<span className="material-symbols-outlined text-primary text-[32px] mb-lg" data-icon="work" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
<h3 className="font-h3 text-h3 mb-md text-on-surface">Job-Ready Portfolio</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">
                        Graduate with a portfolio of complex, performant applications that demonstrate your capability to engineering managers.
                    </p>
</div>
</div>
</section>
{/*  Code Sample Highlight  */}
<section className="w-full max-w-7xl mx-auto px-xl py-5xl">
<div className="brutalist-card p-xl md:p-3xl grid grid-cols-1 lg:grid-cols-2 gap-3xl items-center">
<div>
<h2 className="font-h2 text-h2 mb-xl text-primary">Code First. Always.</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
                        Our platform integrates directly with your workflow. Learn through our embedded code editor aesthetic, focusing on clean architecture and best practices.
                     </p>
<ul className="space-y-md font-body-sm text-body-sm text-on-surface-variant">
<li className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="check">check</span>
                             Strict typing with TypeScript
                         </li>
<li className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="check">check</span>
                             Component-driven architecture
                         </li>
<li className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary-container" data-icon="check">check</span>
                             Performance optimization techniques
                         </li>
</ul>
</div>
<div className="bg-surface-container-lowest p-xl border border-surface-variant text-on-surface-variant font-mono text-sm overflow-x-auto">
<pre><code><span className="text-primary">import</span> {'{ useState }'} <span className="text-primary">from</span> <span className="text-primary-container">&apos;react&apos;</span>;

<span className="text-primary">export function</span> <span className="text-primary-container">DeveloperMindset</span>() {'{'}
  <span className="text-primary">const</span> [skills, setSkills] = <span className="text-primary-container">useState</span>([]);

  <span className="text-primary">const</span> <span className="text-primary-container">levelUp</span> = () =&gt; {'{'}
    setSkills([...skills, <span className="text-primary-container">&apos;Advanced Hooks&apos;</span>]);
  {'}'};

  <span className="text-primary">return</span> (
    &lt;<span className="text-primary">div</span> className=<span className="text-primary-container">&quot;brutalist-ui&quot;</span>&gt;
      &lt;<span className="text-primary">h1</span>&gt;Never Stop Learning&lt;/<span className="text-primary">h1</span>&gt;
      &lt;<span className="text-primary">button</span> onClick={'{'}<span className="text-primary-container">levelUp</span>{'}'}&gt;Grind&lt;/<span className="text-primary">button</span>&gt;
    &lt;/<span className="text-primary">div</span>&gt;
  );
{'}'}</code></pre>
</div>
</div>
</section>
</main>
{/*  Footer  */}
<footer className="w-full border-t border-outline-variant bg-surface">
<div className="flex flex-col md:flex-row justify-between items-center w-full px-xl py-3xl max-w-7xl mx-auto space-y-lg md:space-y-0">
<div className="font-h3 text-h3 font-bold text-on-surface">
                Kelas Frontend
            </div>
<div className="flex flex-wrap justify-center gap-xl">
<a className="font-label text-label text-on-surface-variant hover:text-primary transition-colors" href="#">Documentation</a>
<a className="font-label text-label text-on-surface-variant hover:text-primary transition-colors" href="#">Changelog</a>
<a className="font-label text-label text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
<a className="font-label text-label text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
</div>
<div className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-right">
                © 2024 Kelas Frontend. Engineered for excellence.
            </div>
</div>
</footer>

    </div>
  );
}
