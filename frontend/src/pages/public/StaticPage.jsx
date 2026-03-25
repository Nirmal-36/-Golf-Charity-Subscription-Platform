import React from 'react';

const StaticPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-12 md:p-20 shadow-xl border border-gray-100">
        <h1 className="text-4xl md:text-6xl font-black text-brand-dark mb-8 tracking-tight">
          {title}
        </h1>
        <div className="prose prose-lg text-gray-500 max-w-none">
          <p className="text-xl leading-relaxed mb-6 italic">
            {description}
          </p>
          <div className="h-[2px] w-20 bg-brand-green/20 mb-10"></div>
          <p>
            This page is currently being populated with our latest policies and and deep-dives into the platform's mechanics. 
            At Golf Charity, we prioritize transparency and clarity for all our members.
          </p>
          <p className="mt-6">
            If you have immediate questions regarding this topic, please reach out to our support team at 
            <span className="text-brand-green font-bold ml-1">support@golfcharity.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
