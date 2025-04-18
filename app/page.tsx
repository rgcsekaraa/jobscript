// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="hero bg-base-200 rounded-box p-8 mb-12">
        <div className="hero-content flex-col lg:flex-row">
          <div className="hero-content flex-col lg:flex-row">
            <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left">
              <Image
                src="/logo.png"
                alt="JobScript Logo"
                width={100}
                height={100}
                className="mb-4 lg:mb-0 lg:mr-6"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Welcome to <span className="text-primary">JobScript</span>
                </h1>
                <p className="text-lg md:text-xl mb-6 max-w-md">
                  AI-powered system for crafting tailored resumes, cover
                  letters, and professional emails.
                </p>
                <p className="textarea-md">
                  Paste your open-ai API key in the settings to unlock all
                  features.
                </p>
                <Link href="/settings" className="btn btn-primary btn-lg mt-4">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="mockup-code">
              <pre data-prefix="$">
                <code>JobScript: AI-Powered Job Applications</code>
              </pre>
              <pre data-prefix=">">
                <code>Resume Generator...</code>
              </pre>
              <pre data-prefix=">">
                <code>Cover Letter Generator...</code>
              </pre>
              <pre data-prefix=">">
                <code>Mail Content Generator...</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Features of JobScript (Beta Version)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Resume Generator */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">
                Resume Generator
              </h3>
              <p className="mb-4">
                Create a professional LaTeX resume tailored to any job. Upload
                your base resume and let AI customize it to match the job
                description.
              </p>
              <h4 className="font-semibold text-sm">How to Use:</h4>
              <ul className="list-disc list-inside text-sm mb-4">
                <li>Paste the job description.</li>
                <li>Upload a base resume (.txt or .tex).</li>
                <li>Generate and download your tailored resume.</li>
              </ul>
              <div className="card-actions justify-end">
                <Link href="/resume" className="btn btn-primary btn-sm">
                  Try Now
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 2: Cover Letter Generator */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">
                Cover Letter Generator
              </h3>
              <p className="mb-4">
                Generate a cover letter that aligns with the job description and
                your style. Upload a base cover letter for consistency.
              </p>
              <h4 className="font-semibold text-sm">How to Use:</h4>
              <ul className="list-disc list-inside text-sm mb-4">
                <li>Enter the job description.</li>
                <li>Upload a base cover letter (.txt or .docx).</li>
                <li>Generate and copy your customized cover letter.</li>
              </ul>
              <div className="card-actions justify-end">
                <Link href="/cv" className="btn btn-primary btn-sm">
                  Try Now
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 3: Mail Content Generator */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">
                Mail Content Generator
              </h3>
              <p className="mb-4">
                Craft professional job application emails tailored to the job
                description in just a few clicks.
              </p>
              <h4 className="font-semibold text-sm">How to Use:</h4>
              <ul className="list-disc list-inside text-sm mb-4">
                <li>Paste the job description.</li>
                <li>Generate a professional email.</li>
                <li>Copy and send from your email client.</li>
              </ul>
              <div className="card-actions justify-end">
                <Link href="/mail" className="btn btn-primary btn-sm">
                  Try Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-4 text-base-content">
        <div>
          <p>
            Created by{' '}
            <a
              href="https://www.linkedin.com/in/rgcsekaraa/"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover text-primary"
            >
              Chan RG
            </a>{' '}
            &copy; {new Date().getFullYear()} JobScript. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
