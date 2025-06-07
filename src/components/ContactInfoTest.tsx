import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  UserIcon,
  MailIcon,
  PhoneIcon,
  LinkedinIcon,
  GithubIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "lucide-react";

const ContactInfoTest = () => {
  const [baseResume, setBaseResume] = useState("");
  const [extractedInfo, setExtractedInfo] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadBaseResume();
  }, []);

  const loadBaseResume = () => {
    const savedBaseResume = localStorage.getItem("userBaseResume");
    if (savedBaseResume) {
      setBaseResume(savedBaseResume);
      extractContactInfo(savedBaseResume);
    }
  };

  const extractContactInfo = (resume: string) => {
    if (!resume) return {};
    
    const lines = resume.split('\n');
    const contactInfo: any = {};
    
    // Extract name (usually first line)
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/\*\*/g, '').replace(/[#*]/g, '').trim();
      if (firstLine && !firstLine.includes('@') && !firstLine.includes('+') && !firstLine.includes('http')) {
        contactInfo.name = firstLine;
      }
    }
    
    // Extract contact details
    lines.forEach(line => {
      const cleanLine = line.trim().toLowerCase();
      
      // Email
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        contactInfo.email = emailMatch[1];
      }
      
      // Phone
      const phoneMatch = line.match(/(\+?[\d\s\-\(\)]{10,})/);
      if (phoneMatch && (cleanLine.includes('phone') || cleanLine.includes('mobile') || cleanLine.includes('📱') || cleanLine.includes('☎') || cleanLine.includes('+'))) {
        contactInfo.phone = phoneMatch[1].trim();
      }
      
      // LinkedIn
      if (cleanLine.includes('linkedin')) {
        const linkedinMatch = line.match(/(linkedin\.com\/in\/[a-zA-Z0-9\-]+)/i);
        if (linkedinMatch) {
          contactInfo.linkedin = linkedinMatch[1];
        } else {
          // Extract just the username part
          const usernameMatch = line.match(/linkedin\.com\/in\/([a-zA-Z0-9\-]+)/i);
          if (usernameMatch) {
            contactInfo.linkedin = `linkedin.com/in/${usernameMatch[1]}`;
          }
        }
      }
      
      // GitHub
      if (cleanLine.includes('github')) {
        const githubMatch = line.match(/(github\.com\/[a-zA-Z0-9\-]+)/i);
        if (githubMatch) {
          contactInfo.github = githubMatch[1];
        }
      }
      
      // Location
      if (cleanLine.includes('location') || cleanLine.includes('📍') || cleanLine.includes('🌍')) {
        const locationMatch = line.match(/(?:location:?\s*|📍\s*|🌍\s*)([a-zA-Z\s,]+)/i);
        if (locationMatch) {
          contactInfo.location = locationMatch[1].trim();
        }
      }
    });
    
    setExtractedInfo(contactInfo);
    return contactInfo;
  };

  const contactFields = [
    { key: 'name', label: 'Name', icon: UserIcon, color: 'text-blue-600' },
    { key: 'email', label: 'Email', icon: MailIcon, color: 'text-green-600' },
    { key: 'phone', label: 'Phone', icon: PhoneIcon, color: 'text-purple-600' },
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-700' },
    { key: 'github', label: 'GitHub', icon: GithubIcon, color: 'text-gray-700' },
    { key: 'location', label: 'Location', icon: MapPinIcon, color: 'text-red-600' }
  ];

  const foundFields = contactFields.filter(field => extractedInfo[field.key]);
  const missingFields = contactFields.filter(field => !extractedInfo[field.key]);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Contact Information Test
          </CardTitle>
          <CardDescription>
            Verify that contact information is properly extracted from your base resume
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{foundFields.length}</div>
              <div className="text-sm text-gray-600">Fields Found</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{missingFields.length}</div>
              <div className="text-sm text-gray-600">Fields Missing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round((foundFields.length / contactFields.length) * 100)}%</div>
              <div className="text-sm text-gray-600">Completeness</div>
            </div>
          </div>

          {/* Found Contact Information */}
          {foundFields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                Found Contact Information
              </h3>
              <div className="grid gap-3">
                {foundFields.map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={field.key} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <IconComponent className={`w-5 h-5 ${field.color}`} />
                      <div className="flex-1">
                        <div className="font-medium">{field.label}</div>
                        <div className="text-sm text-gray-600">{extractedInfo[field.key]}</div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✓ Found
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Contact Information */}
          {missingFields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-orange-600" />
                Missing Contact Information
              </h3>
              <div className="grid gap-3">
                {missingFields.map((field) => {
                  const IconComponent = field.icon;
                  return (
                    <div key={field.key} className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <IconComponent className={`w-5 h-5 ${field.color} opacity-50`} />
                      <div className="flex-1">
                        <div className="font-medium">{field.label}</div>
                        <div className="text-sm text-gray-500">Not found in base resume</div>
                      </div>
                      <Badge variant="outline" className="border-orange-300 text-orange-600">
                        Missing
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Base Resume Status */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Base Resume Status</h3>
            {baseResume ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Base Resume Loaded</span>
                </div>
                <div className="text-sm text-green-700">
                  Resume length: {baseResume.length.toLocaleString()} characters
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircleIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">No Base Resume Found</span>
                </div>
                <div className="text-sm text-yellow-700">
                  Please upload your resume in the "Generate Resume" tab first.
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={loadBaseResume} variant="outline">
              Refresh Data
            </Button>
            {baseResume && (
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(extractedInfo, null, 2));
                  toast({
                    title: "Contact Info Copied",
                    description: "Extracted contact information copied to clipboard",
                  });
                }}
                variant="outline"
              >
                Copy Contact Info
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">💡 Tips for Better Contact Detection:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Include your full name on the first line</li>
              <li>• Use clear labels like "Email:", "Phone:", "LinkedIn:", "GitHub:"</li>
              <li>• Use emojis: 📧 for email, 📱 for phone, 💼 for LinkedIn, 💻 for GitHub</li>
              <li>• Include full URLs for LinkedIn and GitHub profiles</li>
              <li>• Add location with "Location:" or 📍 emoji</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoTest;
