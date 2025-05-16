import { Github, Linkedin, Instagram, Terminal, Code, Database, PenTool, BarChart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

export default function About() {
  const teamMembers = [
    {
      name: "Sabbir Ahmed",
      role: "Developer (Lead)",
      position: "CTO",
      githubUrl: "https://github.com/sabbirahmed404",
      linkedinUrl: "https://linkedin.com/in/msabbir-ahmed",
      instagramUrl: "",
      image: "https://tinyurl.com/sabbir100",
      bio: "CSE student at Green University of Bangladesh, specializing in software engineering and data science. I have hands-on experience in data analysis, as well as AI agents, JavaScript frameworks, and Rag. Currently, I serve as Chief Technical Officer at CodeMyPixel (since October 2024), where I lead data and technical governance and strategic initiatives. I also contribute as an Advisor to the Committee 2025 of the Green University of Bangladesh.",
      id: "221902129",
      skills: ["Python", "Data Science", "JavaScript", "AI", "RAG", "Web Development", "Leadership"],
      education: "CSE, Green University of Bangladesh"
    },
    {
      name: "Raihan Kabir",
      role: "Developer",
      githubUrl: "https://github.com/RaihanKabir277",
      linkedinUrl: "",
      instagramUrl: "https://instagram.com/raihankabir.10",
      image: "https://tinyurl.com/raihan10",
      bio: "From Kanchon, Purbachal, Dhaka. 4th Year student At Green University of Bangladesh, currently Pursuing CSE (2022 - 2026). Skills in strong Data Analytics, Programming, Data Structure. Has knowledge on Javascript Frameworks and Node, Report Writing with Latex.",
      id: "221902218",
      skills: ["Data Analytics", "Programming", "Data Structures", "JavaScript", "Node.js", "LaTeX"],
      education: "CSE, Green University of Bangladesh (2022 - 2026)"
    },
    {
      name: "Ramjan Ali",
      role: "Developer",
      githubUrl: "https://github.com/Ramjan-gh",
      linkedinUrl: "",
      instagramUrl: "https://instagram.com/hridoy7096",
      image: "https://tinyurl.com/ramzan10",
      bio:"Hello Ramjan here, a fourth-year Computer Science & Engineering student at Green University of Bangladesh (2022-2026). I am currently enthusiastic on data analytics and algorithmic problem-solving, with particular expertise in JavaScript ecosystems including Node.js. My technical portfolio includes structured programming, data structures, and professional documentation using LaTeX. Currently living in Khilgaon, Dhaka, Bangladesh.",
      id: "221902227",
      skills: ["Data Analytics", "Programming", "Data Structures", "JavaScript", "Node.js", "LaTeX"],
      education: "CSE, Green University of Bangladesh (2022 - 2026)"
    }
  ];

  const technologies = [
    { name: "Tailwind CSS", icon: <PenTool className="h-10 w-10 text-sky-500" /> },
    { name: "React", icon: <Code className="h-10 w-10 text-blue-500" /> },
    { name: "Supabase", icon: <Database className="h-10 w-10 text-emerald-500" /> },
    { name: "Node.js", icon: <Terminal className="h-10 w-10 text-green-600" /> },
    { name: "Vercel", icon: <div className="h-10 w-10 flex items-center justify-center text-black">▲</div> },
    { name: "TypeScript", icon: <div className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white font-bold rounded-full">TS</div> },
  ];

  // Function to get image style based on member name
  const getAvatarImageStyle = (name: string) => {
    if (name === "Raihan Kabir" || name === "Ramjan Ali") {
      return "object-cover scale-[1.2] object-center";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
         {/* Add bottom padding */}
         <div className="pb-[80px]"></div>
          <h1 className="text-5xl font-bold mb-2 text-gray-900 tracking-tight">Meet Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The collective minds behind the GUB Event Management System. We're building the future of event management as Team at Green University of Bangladesh.
          </p>
        </div>

        <Tabs defaultValue="team" className="mb-16">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="team">Our Team</TabsTrigger>
            <TabsTrigger value="tech">Technologies</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
          </TabsList>
          
          {/* Team Tab */}
          <TabsContent value="team" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="relative p-0">
                    <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                        <AvatarImage 
                          src={member.image} 
                          alt={member.name} 
                          className={getAvatarImageStyle(member.name)} 
                        />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-20 px-6">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold">{member.name}</h2>
                      <p className="text-gray-500 mb-2">{member.role}</p>
                      {member.name === "Sabbir Ahmed" && (
                        <p className="text-sm text-gray-600 mb-3 flex items-center justify-center">
                          <span>CTO & HR @</span>
                          <a href="https://codemypixel.com/" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center">
                            <img src="https://tinyurl.com/codemypixel2" alt="CodeMyPixel" className="h-5 w-5 object-contain" />
                          </a>
                        </p>
                      )}
                      <p className="text-sm text-gray-400">ID: {member.id}</p>
                      <p className="text-sm text-gray-400 mb-4">{member.education}</p>
                      
                      <div className="flex justify-center space-x-2 mb-4">
                        {member.githubUrl && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={member.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {member.linkedinUrl && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {member.instagramUrl && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Bio</h3>
                      <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                      
                      <h3 className="font-semibold text-lg mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, idx) => (
                          <Badge key={idx} className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Technologies Tab */}
          <TabsContent value="tech" className="mt-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Technologies We Used</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {technologies.map((tech, index) => (
                  <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    {tech.icon}
                    <p className="mt-2 font-medium">{tech.name}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Our Development Stack</h3>
                <p className="text-gray-600 mb-6">
                  We've built the GUB Event Management System using a modern, scalable tech stack:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <p className="text-gray-600">
                      Built with React and TypeScript for type safety. We use Tailwind CSS for styling along with shadcn UI components for a consistent and beautiful user interface.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <p className="text-gray-600">
                      Powered by Supabase for database, authentication, and storage needs. We utilize edge functions for serverless operations like email sending.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Deployment</h4>
                    <p className="text-gray-600">
                      Our application is deployed on Vercel for maximum performance and reliability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Project Tab */}
          <TabsContent value="project" className="mt-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">About GUB-EMS</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Project Vision</h3>
                  <p className="text-gray-600">
                    GUB Event Management System is designed to streamline and enhance the event management process at Green University of Bangladesh. 
                    Our goal is to provide an intuitive platform that connects event organizers with participants while simplifying event planning, registration, 
                    and engagement.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Comprehensive event creation and management</li>
                    <li>Team collaboration tools for organizers</li>
                    <li>Participant registration and ticketing</li>
                    <li>Real-time notifications and updates</li>
                    <li>Attendance tracking and reporting</li>
                    <li>Customizable event pages</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Our Approach</h3>
                  <p className="text-gray-600">
                    We developed GUB-EMS with a user-centered design approach, focusing on the needs of both event organizers and participants. 
                    The system is built to be modular, scalable, and future-proof, allowing for easy expansion and feature additions as needs evolve.
                  </p>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Join Us in Transforming Event Management</h3>
                <p className="text-gray-600 mb-6">
                  We're continually improving GUB-EMS and welcome feedback, contributions, and collaboration.
                </p>
                
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <a href="https://github.com/sabbirahmed404/GUB-EMS-2.1" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}