import RegistrationForm from './RegistrationForm';

export default function HeroSection() {
  return (
    <section className="bg-hero-gradient py-20">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-6">
            GUB Event Management System
          </h1>
          <h2 className="text-2xl mb-4">
            Transform Your Events into Unforgettable Experiences
          </h2>
     <p className="text-lg opacity-90 mb-8 text-justify">
    Streamline your event planning process with our comprehensive management system. 
    From registration to analytics, we provide all the tools you need to create 
    successful events that leave lasting impressions.
</p>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold text-primary mb-6">
            See the power of GUB-EMS in action today
          </h3>
          <RegistrationForm />
          
          <div className="mt-8 rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Product Demo"
              className="border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}