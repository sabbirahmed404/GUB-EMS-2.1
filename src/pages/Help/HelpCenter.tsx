import { 
  HelpCircle, 
  Calendar, 
  Users, 
  ClipboardList, 
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';

interface GuideSection {
  id: string;
  title: string;
  icon: JSX.Element;
  content: {
    title: string;
    steps: string[];
  }[];
}

export default function HelpCenter() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const guides: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Sparkles className="w-6 h-6" />,
      content: [
        {
          title: 'Welcome to GUB-EMS',
          steps: [
            'Sign up using your Google account',
            'Choose your role: Organizer or Visitor',
            'Complete your profile information',
            'Explore the dashboard features'
          ]
        }
      ]
    },
    {
      id: 'create-events',
      title: 'Creating Events',
      icon: <Calendar className="w-6 h-6" />,
      content: [
        {
          title: 'Event Creation Process',
          steps: [
            'Navigate to "All Events" in the dashboard',
            'Click "Create Event" button',
            'Fill in event details: name, date, venue, etc.',
            'Add event description and banner image',
            'Specify organizer information',
            'Set up registration requirements',
            'Review and publish your event'
          ]
        },
        {
          title: 'Managing Event Details',
          steps: [
            'Access event settings from the dashboard',
            'Update event information as needed',
            'Monitor registration status',
            'Communicate with participants',
            'Track event metrics and attendance'
          ]
        }
      ]
    },
    {
      id: 'participate',
      title: 'Participating in Events',
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          title: 'Registration Process',
          steps: [
            'Browse available events',
            'Select an event to participate in',
            'Fill out the registration form',
            'Complete payment (if required)',
            'Receive confirmation email',
            'Access event details and updates'
          ]
        }
      ]
    },
    {
      id: 'manage-events',
      title: 'Event Management',
      icon: <ClipboardList className="w-6 h-6" />,
      content: [
        {
          title: 'Organizer Tools',
          steps: [
            'View participant lists',
            'Manage registrations and approvals',
            'Track attendance',
            'Generate event reports',
            'Communicate with participants'
          ]
        },
        {
          title: 'Event Analytics',
          steps: [
            'Monitor registration trends',
            'Track participant engagement',
            'View attendance statistics',
            'Generate performance reports'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="hero-container relative h-[30vh] flex items-center justify-center overflow-hidden rounded-b-[2.5rem] mx-4 md:mx-8">
        <div className="animated-pattern" />
        <div className="relative z-10 text-center text-white px-4">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-xl opacity-90">Learn how to use GUB-EMS effectively</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl min-h-[60vh] flex flex-col md:flex-row">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">
                {guides.find(g => g.id === activeSection)?.title || 'Select Topic'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <div className={`
            md:w-72 border-r border-gray-200 bg-white rounded-l-2xl
            ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
            ${isMobileMenuOpen ? 'border-b' : ''}
          `}>
            <div className="p-6 space-y-3">
              {guides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => {
                    setActiveSection(guide.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === guide.id
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                  }`}
                >
                  {guide.icon}
                  <span className="font-medium">{guide.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            {guides.find(g => g.id === activeSection)?.content.map((section, idx) => (
              <div key={idx} className="mb-12 last:mb-0">
                <h2 className="text-2xl font-semibold mb-8 text-primary">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Help Resources */}
            <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Need Additional Help?</h3>
              <p className="text-gray-700 mb-2">
                If you need further assistance or have specific questions, our support team is here to help.
              </p>
              <p className="text-gray-500">
                Contact us through the support portal or email us at support@gub-ems.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 