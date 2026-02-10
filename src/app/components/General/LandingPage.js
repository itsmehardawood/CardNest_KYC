"use client";
import React, { useEffect, useState } from "react";

import DiagonalHeroSection from "./HeroSection";
import ContactSection from "./ContactSection";
import Image from "next/image";
import PricingSection from "./SubscriptionsCard";
import FAQs from "./FAQs";
import NavbarHomepage from "./NavbarHomepage";

const LandingPage = () => {
 const sectionsData = {
    // modular: {
    //   title: "Modular solutions",
    //   heading: "A fully integrated suite of payments products",
    //   description: "We bring together everything that is required to build websites and apps that accept payments and send payouts globally.",
    //   media: ''
    // },
    kyc: {
      title: "",
      heading: "",
      description: "Welcome to CardNest KYC Verification Thank you for choosing CardNest LLC. To ensure the highest level of security, compliance, and fraud prevention, your organization uses CardNest to ensure that all users complete a Know Your Customer (KYC) verification process before accessing the services or system.",
      media: null,
      darkMode: true,
      sections: [
        {
          content: "CardNest is an advanced fraud prevention intelligence platform designed to stop credit and debit card fraud before it occurs. Our technology protects businesses from unauthorized transactions, financial losses, and chargebacks. As part of this commitment, identity verification is a critical step in maintaining a trusted and secure ecosystem for all parties involved."
        },
        {
          emoji: "🔐",
          title: "Why is KYC Verification Important",
          content: "The KYC process allows CardNest to:",
          points: [
            "Verify identities accurately and prevent impersonation or fraudulent activity",
            "Comply with global regulatory and financial security standards",
            "Protect merchants, customers, and partners from card fraud and chargebacks",
            "Ensure only legitimate users access CardNest's fraud-prevention infrastructure"
          ],
          footer: ""
        },
        {
          emoji: "🧭",
          title: "What to Expect: CardNest KYC Verification Steps",
          content: "Our KYC process is designed to be secure, efficient, and user-friendly. Below is a step-by-step overview of how verification works:",
          steps: [
            {
              emoji: "🪪",
              title: "Step 1: Identity Document Submission",
              content: "You will be asked to upload a valid government-issued identification document, such as:",
              points: [
                "Passport",
                "National ID card",
                "Driver's license and many others"
              ],
              footer: "Please ensure the document is clear, unexpired, and fully visible."
            },
            {
              emoji: "🤳",
              title: "Step 2: Facial Recognition Verification",
              content: "Next, you will complete a facial verification check using your device's camera. This step confirms that you are the rightful owner of the submitted identification and helps prevent identity misuse."
            },
            {
              emoji: "🧠",
              title: "Step 3: Intelligent Verification Analysis",
              content: "CardNest's proprietary KYC intelligence system securely analyzes your information by:",
              points: [
                "Authenticating document legitimacy",
                "Matching facial biometrics with submitted documents",
                "Detecting anomalies or potential fraud indicators"
              ],
              footer: "All data is encrypted and processed in compliance with strict security and privacy standards."
            },
            {
              emoji: "✅",
              title: "Step 4: Verification Outcome",
              content: "Once the review is complete:",
              points: [
                "Approved users will gain access to CardNest services",
                "If additional information is required, you will be guided through the next steps"
              ],
              footer: "Most verifications are completed quickly, with minimal user effort."
            }
          ]
        },
        {
          emoji: "🛡️",
          title: "Your Privacy & Security",
          content: "CardNest takes data protection seriously. All personal information is:",
          points: [
            "Encrypted during transmission and storage",
            "Used strictly for verification and compliance purposes",
            "Handled in accordance with applicable data protection regulations"
          ]
        },
        {
          emoji: "🚀",
          title: "Moving Forward with CardNest",
          content: "Completing the KYC process ensures you can fully benefit from CardNest's fraud prevention intelligence—helping stop fraud in advance, reduce chargebacks, and build trust across payment ecosystems.",
          footer: "We appreciate your cooperation and look forward to supporting your secure journey with CardNest."
        },
        
{
  emoji: "💬",
  title: "Need Help During Verification?",
  content: "If you encounter any issues during the KYC process, CardNest provides dedicated support to assist you at every step.",
  points: [
    "Real-time guidance if document uploads fail",
    "Clear instructions when additional information is required",
    "Assistance with verification delays or technical issues"
  ],
footer: "",
}


      ]
    },


    payments: {
      title: "Payments",
      heading: "Accept and optimize payments, globally",
      description:
        "Increase authorization rates, offer local payment methods to boost conversion, and reduce fraud using AI.",
      seeAlso:
        "Tax for automating tax registration, collection, and filing Radar for AI-powered fraud protection Terminal for custom in-person payments",
      media: null,
    },
    billing: {
      title: "Billing",
      heading: "Capture recurring revenue",
      description:
        "Manage flat rate, usage-based, and hybrid pricing models, minimize churn, and automate finance operations.",
      seeAlso:
        "Invoicing for invoice creation, collection, and tracking Usage-based billing for metering, billing, and consumption insights Sigma for custom revenue reports—no SQL required",
      media: null,
    },
    connect: {
      title: "Benefits of CardNest",
      heading: "",
      description: "",
      media: null,
      features: [
        {
          title: "Real-Time Fraud Prevention",
          description:
            "CardNest detects and stops online fraudulent card transactions before they occur—unlike traditional systems that only respond after chargebacks or losses. This proactive approach significantly reduces fraud exposure and saves businesses from losing revenue or shutting down.",
        },
        {
          title: "Advanced AI and Machine Learning",
          description:
            "The CardNest Security Scan engine uses intelligent behavioral models, pattern recognition, and anomaly detection to identify suspicious activity in milliseconds, improving accuracy with every transaction processed and ensuring the card being used belongs to the actual owner.",
        },
        {
          title: "Saves Up to 98% or More Reduction in Chargebacks",
          description:
            "Businesses using CardNest have reported dramatic reductions in chargeback volume. By blocking fraudulent transactions at the source, merchants can retain more revenue and avoid costly disputes.",
        },
        {
          title: "Simple API Integration (Setup in a Few Hours)",
          description:
            "CardNest can be easily integrated into existing platforms, including e-commerce sites, payment gateways, remittance services, and banking systems—with minimal development effort and maximum compatibility.",
        },
        {
          title: "No Storage of Sensitive Data",
          description:
            "CardNest performs Real-Time intelligence scanning and verification without storing cardholder information, ensuring user privacy and reducing the risks associated with data breaches or regulatory non-compliance.",
        },
        {
          title: "PCI DSS–Compliant Security Infrastructure",
          description:
            "Built to the highest global payment security standards, CardNest helps businesses maintain compliance and avoid penalties associated with non-compliant transaction systems. All data, both in transit and at rest, is encrypted with maximum security protocols.",
        },
        {
          title: "Adaptive and Scalable Technology",
          description:
            "As fraud tactics evolve, CardNest's self-learning algorithms adapt in real time—making it a future-proof solution for both small businesses and large enterprises processing high transaction volumes.",
        },
        {
          title: "Enhanced Customer Trust and Satisfaction",
          description:
            "By preventing fraud and reducing false declines, CardNest helps businesses deliver a safer and smoother customer experience, building loyalty and strengthening brand reputation.",
        },
      ],
    },
    features: {
      title: "Comprehensive Features of CardNest ",
      media: null,
      darkMode: true,
      features: [
        {
          title: "Card-At-Present (CAP) Intelligence Engine",
          description:
            "Simulates physical card presence in online transactions by analyzing user card security features, building intelligence around card behavior, device signals, and transaction context to validate cardholder identity.",
        },
        {
          title:
            "Real-Time Transaction Security Scanning, Detection, and Prevention",
          description:
            "Performs instant, pre-authorization fraud detection within milliseconds—preventing suspicious transactions before they're approved.",
        },
        {
          title: "Machine Learning Behavioral Modeling",
          description:
            "Learns and analyzes cardholder behavior, patterns, and motion data to detect deviations that signal fraud, improving detection accuracy over time.",
        },
        {
          title: "Anomaly and Pattern Recognition",
          description:
            "Identifies abnormal transaction trends, geographic mismatches, inconsistent device usage, and other red flags across thousands of data points.",
        },
        {
          title: "Zero Data Storage Technology",
          description:
            "Performs all security operations in real-time without storing cardholder data, ensuring full compliance with PCI DSS and data protection standards.",
        },
        {
          title: "API-First Integration",
          description:
            "Offers a lightweight, developer-friendly API that integrates seamlessly with payment gateways, mobile apps, e-commerce stores, and financial platforms within a few hours.",
        },
        {
          title: "Multi-Layered Fraud Detection Architecture",
          description:
            "Combines biometric analytics, card validation, transaction velocity checks, and AI insights to assess and mitigate fraud risk from multiple vectors.",
        },
        {
          title: "Global Transaction Intelligence",
          description:
            "Uses a distributed network and real-time transaction datasets across multiple countries to improve fraud models and detect global fraud patterns.",
        },
        {
          title: "Customizable Risk Scoring Engine",
          description:
            "Assigns a dynamic fraud confidence score to each transaction, allowing businesses to set custom thresholds, automate approvals/declines, or trigger manual reviews.",
        },
        {
          title: "Adaptive Learning System",
          description:
            "Continuously trains its AI models using real-time data and evolving fraud trends, ensuring the system stays ahead of emerging attack methods.",
        },
        {
          title: "False Positive Minimization",
          description:
            "Fine-tuned algorithms reduce the likelihood of blocking legitimate transactions—maintaining customer satisfaction, and maximize conversions.",
        },
        {
          title: "Identity & Behavioral Biometrics",
          description:
            "Tracks user interactions such as typing speed, mouse movement, and screen behavior to enhance cardholder verification without friction. Visual analytics tools give merchants insights into fraud attempts, successful blocks, and chargeback trends—helping drive strategic decisions.",
        },
      ],
    },
  };

  // Component to render section content
  const SectionContent = ({ data, isDark = false, sectionKey }) => {
    // Determine split count based on section - 4 for connect, 5 for others
    const splitCount = sectionKey === 'connect' ? 4 : 5;
    const shouldDivideFeatures = data.features && data.features.length > splitCount;
    
    const leftFeatures = shouldDivideFeatures
      ? data.features.slice(0, splitCount)
      : data.features;
    const rightFeatures = shouldDivideFeatures
      ? data.features.slice(splitCount, splitCount * 2)
      : [];

    const FeatureItem = ({ feature, index }) => (
      <div key={index} className="flex items-start space-x-3">
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full ${
            isDark ? "bg-green-500" : "bg-green-600"
          } flex items-center justify-center mt-1`}
        >
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4
            className={`font-bold text-left text-base sm:text-lg ${
              isDark ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            {feature.title}
          </h4>
          <p
            className={`text-sm sm:text-base text-justify  ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {feature.description}
          </p>
        </div>
      </div>
    );

    return (
      <div className={`w-full ${isDark ? "bg-slate-900" : ""}`}>
        <div className="flex flex-col max-w-[1320px] mx-auto justify-center py-10 px-4 sm:px-6">
          <div className="w-full text-center lg:text-left space-y-6">
            <h3
              className={`${
                isDark ? "text-blue-400" : "text-blue-500"
              } font-bold text-3xl text-center`}
            >
              {data.title}
            </h3>
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } leading-tight`}
            >
              {data.heading}
            </h2>
            <p
              className={`text-base sm:text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              } max-w-3xl mx-auto lg:mx-0`}
            >
              {data.description}
            </p>

            {/* Features */}
            {data.features && (
              <div className="mt-8">
                {shouldDivideFeatures ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {leftFeatures.map((feature, index) => (
                        <FeatureItem
                          key={index}
                          feature={feature}
                          index={index}
                        />
                      ))}
                    </div>
                    <div className="space-y-4">
                      {rightFeatures.map((feature, index) => (
                        <FeatureItem
                          key={index + splitCount}
                          feature={feature}
                          index={index + splitCount}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leftFeatures.map((feature, index) => (
                      <FeatureItem
                        key={index}
                        feature={feature}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {data.seeAlso && (
              <div className="space-y-3 mt-8">
                <p
                  className={`font-bold text-sm sm:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  See also
                </p>
                <p
                  className={`${
                    isDark ? "text-gray-400" : "text-gray-700"
                  } text-sm sm:text-base max-w-3xl`}
                >
                  {data.seeAlso}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarHomepage />

      {/* Hero Section */}
      <section id="hero">
        <DiagonalHeroSection />
      </section>

      {/* About Us Section */}

      <section id="about" className="py-5 px-6 bg-gray-100 w-full">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-3xl md:text-3xl mb-10 text-gray-900 text-center">
           CardNest Intelligence Scan
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Left Text Section */}
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <p className="text-base md:text-lg text-gray-700 text-justify leading-relaxed">
                <strong>CardNest</strong> is a cutting-edge financial technology
                company dedicated to transforming how businesses protect
                themselves and their customers from online card fraud. Founded
                on the principle that transaction security should be proactive,
                not reactive, CardNest leverages advanced artificial
                intelligence and machine learning to detect and prevent
                fraudulent card activity before it occurs—empowering businesses
                of all sizes to operate with confidence in a digital-first
                economy. As online commerce and digital payments continue to
                scale globally, so too does the threat of payment fraud. In
                response, CardNest has a robust, real-time fraud prevention
                technology designed to scan, detect, analyze, and prevent
                fraudulent activity before a transaction even begins—within
                milliseconds—without disrupting the customer experience.
              </p>

              <p className="text-base md:text-lg text-gray-700 text-justify leading-relaxed">
                Our Artificial Intelligence models continuously analyze
                thousands of data points, including card security features,
                transaction history, device fingerprinting, location
                consistency, behavioral biometrics, and more—enabling our system
                to flag suspicious transactions with unparalleled accuracy
                before payment checkout happens.
                                  CardNest security architecture is{" "}
                  <strong>PCI/DSS compliant</strong>, ensuring that all
                  processes meet the highest global standards for payment data
                  protection. Importantly, CardNest does not store{" "}
                  <strong>sensitive cardholder information.</strong> All
                  analysis and validation are performed in real-time, minimizing
                  risk and maximizing user privacy. Designed with developers and
                  businesses in mind, CardNest offers a{" "}
                  <strong>simple, API-based integration</strong> that seamlessly
                  connects to any existing payment gateway, merchant system,
                  e-commerce platform, remittance business, or banking
                  infrastructure. Organizations using CardNest have seen{" "}
                  <strong>up to a 98% or more reduction in chargebacks</strong>,
              </p>
            </div>

            {/* Right Image/Video Section */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="">
                <div className="flex justify-center items-center pb-3">
                  <Image
                    src="/images/CardNest.png"
                    alt="this is about img"
                    width="450"
                    height="450"
                  />
                </div>
                <p className="text-base md:text-lg text-gray-700 text-justify pt-7 leading-relaxed">
                
                  increased customer trust, and significant improvements in
                  operational efficiency and revenue retention. At CardNest, we
                  are not just building fraud detection software—we are
                  redefining what it means to transact safely online. By staying
                  ahead of emerging fraud tactics and continuously evolving our
                  Artificial Intelligence capabilities, we help our clients
                  maintain integrity, protect customer trust, and accelerate
                  secure digital growth.
 Whether you are a startup or an
                  enterprise-scale institution, CardNest adapts to your
                  needs—scaling protection as your transaction volume grows. Our
                  technology is currently trusted by businesses across financial
                  services, e-commerce, digital remittance, and SaaS industries.
                 
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CardNest KYC Section */}
      <section id="kyc" className="bg-slate-900">
        <div className="w-full">
          <div className="flex flex-col max-w-[1320px] mx-auto justify-center py-10 px-4 sm:px-6">
            <div className="w-full text-center lg:text-left space-y-6">
              <h3 className="text-blue-400 font-bold text-3xl text-center">
                CardNest KYC Verification
              </h3>
            
              <p className="text-sm sm:text-base text-gray-300 max-w-7xl text-left">
                {sectionsData.kyc.description}
              </p>

              {/* Intro paragraph */}
              {/* <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto text-center">
                {sectionsData.kyc.sections[0].content}
              </p> */}

              {/* All KYC Items */}
              <div className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Why is KYC Important */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl mt-1">
                        {sectionsData.kyc.sections[1].emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                          {sectionsData.kyc.sections[1].title}
                        </h4>
                        <p className="text-sm sm:text-base text-left text-gray-300">
                          {sectionsData.kyc.sections[1].content}
                        </p>
                        <ul className="space-y-2">
                          {sectionsData.kyc.sections[1].points.map((point, idx) => (
                            <li key={idx} className="text-gray-300 text-sm sm:text-base">• {point}</li>
                          ))}
                        </ul>
                        <p className="text-sm sm:text-base text-left text-gray-300 mt-2">
                          {sectionsData.kyc.sections[1].footer}
                        </p>
                      </div>
                    </div>

                    {/* Verification Steps 1-2 */}
                    {sectionsData.kyc.sections[2].steps.slice(0, 2).map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-2xl mt-1">
                          {step.emoji}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                            {step.title}
                          </h4>
                          <p className="text-sm sm:text-base text-left text-gray-300">
                            {step.content}
                          </p>
                          {step.points && (
                            <ul className="space-y-2">
                              {step.points.map((point, pIdx) => (
                                <li key={pIdx} className="text-gray-300 text-sm sm:text-base">• {point}</li>
                              ))}
                            </ul>
                          )}
                          {step.footer && (
                            <p className="text-sm sm:text-base text-gray-300 mt-2">{step.footer}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Privacy & Security */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl mt-1">
                        {sectionsData.kyc.sections[3].emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                          {sectionsData.kyc.sections[3].title}
                        </h4>
                        <p className="text-sm sm:text-base text-left text-gray-300">
                          {sectionsData.kyc.sections[3].content}
                        </p>
                        <ul className="space-y-2">
                          {sectionsData.kyc.sections[3].points.map((point, idx) => (
                            <li key={idx} className="text-gray-300 text-sm sm:text-base">• {point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Verification Steps 3-4 */}
                    {sectionsData.kyc.sections[2].steps.slice(2, 4).map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 text-2xl mt-1">
                          {step.emoji}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                            {step.title}
                          </h4>
                          <p className="text-sm sm:text-base text-left text-gray-300">
                            {step.content}
                          </p>
                          {step.points && (
                            <ul className="space-y-2">
                              {step.points.map((point, pIdx) => (
                                <li key={pIdx} className="text-gray-300 text-sm sm:text-base">• {point}</li>
                              ))}
                            </ul>
                          )}
                          {step.footer && (
                            <p className="text-sm sm:text-base text-gray-300 mt-2">{step.footer}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Moving Forward */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl mt-1">
                        {sectionsData.kyc.sections[4].emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                          {sectionsData.kyc.sections[4].title}
                        </h4>
                        <p className="text-sm sm:text-base text-left text-gray-300">
                          {sectionsData.kyc.sections[4].content}
                        </p>
                        <p className="text-sm sm:text-base text-left text-gray-300 mt-2">
                          {sectionsData.kyc.sections[4].footer}
                        </p>
                      </div>
                    </div>

                    {/* Need Help During Verification */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl mt-1">
                        {sectionsData.kyc.sections[5].emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-left text-base sm:text-lg text-white mb-2">
                          {sectionsData.kyc.sections[5].title}
                        </h4>
                        <p className="text-sm sm:text-base text-left text-gray-300">
                          {sectionsData.kyc.sections[5].content}
                        </p>
                        <ul className="space-y-2">
                          {sectionsData.kyc.sections[5].points.map((point, idx) => (
                            <li key={idx} className="text-gray-300 text-sm sm:text-base">• {point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Video Section */}
      <section id="video" className="py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Businesses Trust Us ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how our AI-powered fraud prevention technology protects your business in real-time
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                className="w-full h-auto"
                controls
                muted
                autoPlay
                loop
                preload="metadata"
                poster="/images/ss.jpg" // Optional: Add a poster image
              >
                <source
                  src="https://d21vkevu6wrni5.cloudfront.net/Cardnest%20Main%20Promotion%20Video.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              
              {/* Optional: Custom overlay with play button */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Video description */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Watch how CardNest advanced AI technology seamlessly integrates with your existing payment systems 
                to provide millisecond fraud detection without disrupting the customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Connect Section */}
      <section id="benefits" className="bg-white  ">
        <SectionContent data={sectionsData.connect} isDark={true}  sectionKey="connect" />

      </section>

      {/* Pricing Section */}
      <section id="pricing">
        {/* <PricingSection isDark={true} /> */}
                <PricingSection isDark={true} />

      </section>

      {/* Pricing Section */}
      <section id="features">
        <SectionContent data={sectionsData.features} />
      </section>

      <section>
        <FAQs />
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-5 lg:py-5 px-6 bg-gray-50">
        <ContactSection />
      </section>

      {/* Footer */}
      <footer className=" bg-gradient-to-br  from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-pulse"></div>

        <div className="container max-w-6xl mx-auto  px-6 py-12 ">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                {/* logo footer */}
                <div className="text-xl sm:text-2xl font-bold text-white">
                  <video autoPlay loop muted playsInline width="50">
<source src="https://dw1u598x1c0uz.cloudfront.net/CardNest%20Logo%20WebM%20version.webm" alt="CardNest Logo" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="text-2xl font-bold text-white">CardNest</div>
              </div>
              <p className="text-gray-300 max-w-md leading-relaxed">
                Protecting your financial data with cutting-edge security
                technology. Your trust is our commitment to excellence.
              </p>

              {/* Social links */}
              <div className="flex space-x-4">
                {[
                  {
                    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                    label: "Twitter",
                  },
                  {
                    icon: "M12 0c-6.626 0-12 5.373-12 12c0 5.302 3.438 9.8 8.207 11.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416c-.546-1.387-1.333-1.756-1.333-1.756c-1.089-.745.083-.729.083-.729c1.205.084 1.839 1.237 1.839 1.237c1.07 1.834 2.807 1.304 3.492.997c.107-.775.418-1.305.762-1.604c-2.665-.305-5.467-1.334-5.467-5.931c0-1.311.469-2.381 1.236-3.221c-.124-.303-.535-1.524.117-3.176c0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404c2.291-1.552 3.297-1.23 3.297-1.23c.653 1.653.242 2.874.118 3.176c.77.84 1.235 1.911 1.235 3.221c0 4.609-2.807 5.624-5.479 5.921c.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
                    label: "GitHub",
                  },
                  {
                    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065c0-1.138.92-2.063 2.063-2.063c1.14 0 2.064.925 2.064 2.063c0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                    label: "LinkedIn",
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                    aria-label={social.label}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white relative">
                Navigation
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "#hero" },
                  { name: "Features", href: "#features" },
                  { name: "Benefits", href: "#benefits" },
                  { name: "Pricing", href: "#pricing" },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                        →
                      </span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white relative">
                Support
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Help Center", href: "#" },
                  { name: "Documentation", href: "#" },
                  { name: "Contact Support", href: "#contact" },
                  { name: "FAQ", href: "#faq-1" },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                        →
                      </span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2025 CardNest. All rights reserved. Built with security in
                mind.
              </div>

              <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm">
                {[
                  // Add any legal links here if needed
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Security badges */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;



