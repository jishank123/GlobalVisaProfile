import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PricingPageFAQ from '../../components/PricingPageFAQ';

const PricingPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
                <div className="container mx-auto px-4">
                    <div className="text-center text-white mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Transparent Pricing
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            Professional immigration services with clear, upfront pricing. No hidden fees, no surprises.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="py-20 bg-white">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-5">

                        {/* Profile Assessment - FREE */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Profile Assessment</h3>
                            <div className="text-2xl font-bold text-teal-600 mb-4">FREE</div>
                            <Link to="/profile-assessment" className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-xs mb-4 text-center block">
                                Start Assessment
                            </Link>
                            <ul className="space-y-1.5 text-xs flex-grow">
                                <li className="flex items-start">
                                    <i className="fas fa-check text-teal-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">10-criteria assessment</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-teal-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Profile strength analysis</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-teal-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Personalized recommendations</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-teal-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Gap analysis report</span>
                                </li>
                            </ul>
                        </div>

                        {/* EB-1A Core Consultation */}
                        <div className="bg-white rounded-xl shadow-md border-2 border-blue-400 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">EB-1A Core Consultation</h3>
                            <div className="text-2xl font-bold text-blue-600 mb-4">$5,000</div>
                            <Link to="/schedule-appointment" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-xs mb-4 text-center block">
                                Buy Now
                            </Link>
                            <ul className="space-y-1.5 text-xs flex-grow">
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Customized EB-1 Strategy & Progress Plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Interactive Dashboard for Tracking Milestones</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Exclusive Access to Member Community</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Personalized One-on-One Mentorship Sessions</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Professional Portfolio Website Development</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance for Research Paper Publication</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Support for Patent Drafting & Filing (Original Work)</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Evaluation of Compensation & Remuneration</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance on Securing Judging Opportunities</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Awards Identification & Application Support</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Strategy for Organic Media & Press Coverage</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Critical Role Positioning & Readiness Plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Roadmap for Achieving Commercial Success</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Selection of Strong Evidence for FMD Readiness</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-blue-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Structuring Long-Term Recognition & Impact Profile</span>
                                </li>
                            </ul>
                        </div>

                        {/* EB-2 NIW Core Consultation */}
                        <div className="bg-white rounded-xl shadow-md border-2 border-purple-400 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">EB-2 (NIW) Core Consultation</h3>
                            <div className="text-2xl font-bold text-purple-600 mb-4">$4,500</div>
                            <Link to="/schedule-appointment" className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-xs mb-4 text-center block">
                                Buy Now
                            </Link>
                            <ul className="space-y-1.5 text-xs flex-grow">
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Customized EB-2 Strategy & Action Plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Dedicated Dashboard for Progress Tracking</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Expert Guidance on Meeting the 3-Prong Criteria</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Support in Demonstrating National Importance of Your Work</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Strategic Positioning to Advance Your Proposed Endeavor</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance on Fulfilling U.S. Waiver Requirements</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Exclusive Access to Private Community</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Dedicated One-on-One Mentorship Sessions</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Professional Portfolio Website Development</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance on Highlighting Significant Contributions</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-purple-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Support in Showcasing Relevant Licenses & Certifications</span>
                                </li>
                            </ul>
                        </div>

                        {/* O-1 Core Consultation */}
                        <div className="bg-white rounded-xl shadow-md border-2 border-orange-400 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">O-1 Core Consultation</h3>
                            <div className="text-2xl font-bold text-orange-600 mb-4">$4,000</div>
                            <Link to="/contact" className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-xs mb-4 text-center block">
                                Buy Now
                            </Link>
                            <ul className="space-y-1.5 text-xs flex-grow">
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Customized O-1 Strategy & Action Plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Dedicated Dashboard for Progress Monitoring</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Exclusive Community Membership Access</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Personalized One-on-One Mentorship Sessions</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance for Research Paper Publications</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Support for Patent Drafting & Filing (Original Work)</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Compensation & Remuneration Evaluation</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Guidance on Securing Judging Opportunities</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Awards Selection & Application Support</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Strategic Roadmap for Organic Media Coverage</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Critical Role Positioning & Readiness Plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-orange-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Roadmap for Commercial Success Planning</span>
                                </li>
                            </ul>
                        </div>

                        {/* Career Coaching */}
                        <div className="bg-white rounded-xl shadow-md border-2 border-green-400 p-6 hover:shadow-lg transition-all h-full flex flex-col">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Career Coaching</h3>
                            <div className="text-2xl font-bold text-green-600 mb-4">$4,000</div>
                            <Link to="/contact" className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-xs mb-4 text-center block">
                                Buy Now
                            </Link>
                            <ul className="space-y-1.5 text-xs flex-grow">
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Career strategy session</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Profile enhancement plan</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Achievement roadmap</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Ongoing guidance and support</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Monthly progress reviews</span>
                                </li>
                                <li className="flex items-start">
                                    <i className="fas fa-check text-green-600 mt-0.5 mr-2 text-xs flex-shrink-0"></i>
                                    <span className="text-gray-700">Professional development resources</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* FAQ Section */}
                    <div className="mt-20">
                        <PricingPageFAQ />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PricingPage;
