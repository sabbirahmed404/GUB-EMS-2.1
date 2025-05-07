import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../ui/select';

interface RegistrationFormProps {
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PublicEventRegistration({ eventId, eventName, onSuccess, onCancel }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [batch, setBatch] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !designation || !address || !gender) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a new participant record
      const { data, error: registrationError } = await supabase
        .from('participants')
        .insert([
          {
            event_id: eventId,
            name,
            email,
            phone,
            designation,
            department: department || null,
            address,
            gender,
            batch: batch || null,
            student_id: studentId || null,
            status: 'registered'
          }
        ])
        .select();
      
      if (registrationError) throw registrationError;
      
      console.log('Registration successful:', data);
      setSuccess(true);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Register for {eventName}</h2>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
          <h3 className="font-semibold text-lg mb-2">Registration Successful!</h3>
          <p>Thank you for registering for this event. We've sent a confirmation to your email.</p>
          <Button 
            onClick={onCancel} 
            className="mt-4 bg-green-600 hover:bg-green-700 text-white"
          >
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender <span className="text-red-500">*</span></Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Student/Teacher/Professional"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="SWE">SWE</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                  <SelectItem value="ENG">ENG</SelectItem>
                  <SelectItem value="LAW">LAW</SelectItem>
                  <SelectItem value="JMC">JMC</SelectItem>
                  <SelectItem value="SOC">SOC</SelectItem>
                  <SelectItem value="TEX">TEX</SelectItem>
                  <SelectItem value="AIDS">AIDS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Enter your batch (if student)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID (if applicable)"
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              rows={3}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button 
                type="button" 
                onClick={onCancel} 
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Register'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 