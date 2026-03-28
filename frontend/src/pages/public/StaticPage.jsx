/**
 * Infrastructure: Static Content Generator
 * Serves as the dynamic template for policy documents, transparency reports, 
 * and platform documentation.
 * @param {string} title - The header for the document.
 * @param {string} description - The sub-text or summary of the content.
 */
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
            This formal documentation is currently being finalized to incorporate our latest 
            governance policies and philanthropic transparency benchmarks. 
          </p>
          <p className="mt-6">
            For critical inquiries regarding this documentation or internal compliance, please contact:
            <span className="text-brand-green font-bold ml-1">support@golfcharity.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
