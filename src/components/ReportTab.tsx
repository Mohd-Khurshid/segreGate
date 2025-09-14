import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Camera, MapPin, Calendar, Upload, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

export function ReportTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    location: '',
    type: 'Illegal Dumping',
    image: null as File | null
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await api.getReports();
      setReports(response.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewReport = () => {
    setShowForm(true);
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportForm(prev => ({ ...prev, image: file }));
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReport = async () => {
    if (!reportForm.location || !reportForm.type) {
      alert('Please fill in all required fields');
      return;
    }

    setIsReporting(true);
    try {
      let imageBase64 = undefined;
      if (reportForm.image) {
        imageBase64 = await convertToBase64(reportForm.image);
      }

      // Mock location coordinates
      const coordinates = { lat: 40.7128, lng: -74.0060 };

      await api.submitReport({
        location: reportForm.location,
        type: reportForm.type,
        imageBase64,
        coordinates
      });

      alert('Report submitted successfully! You\'ll earn points once it\'s verified.');
      setShowForm(false);
      setReportForm({ location: '', type: 'Illegal Dumping', image: null });
      await loadReports();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl mb-4">Report Waste</h1>
        
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Submit Waste Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location details"
                  value={reportForm.location}
                  onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select 
                  value={reportForm.type} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Illegal Dumping">Illegal Dumping</SelectItem>
                    <SelectItem value="Overflowing Bin">Overflowing Bin</SelectItem>
                    <SelectItem value="Littering">Littering</SelectItem>
                    <SelectItem value="Hazardous Waste">Hazardous Waste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo Evidence</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageCapture}
                />
                {reportForm.image && (
                  <p className="text-sm text-green-600">Photo selected: {reportForm.image.name}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitReport}
                  disabled={isReporting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isReporting ? (
                    <>
                      <Upload className="size-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={isReporting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="p-4 bg-green-100 rounded-full inline-block">
                  <Camera className="size-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Report a Waste Dump</h3>
              <p className="text-muted-foreground mb-4">
                Help keep your community clean by reporting waste dumps
              </p>
              <Button 
                onClick={handleNewReport}
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="size-4 mr-2" />
                Start New Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{reports.length}</p>
              <p className="text-sm text-muted-foreground">Reports Made</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {reports.filter(report => report.status === 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {reports.reduce((acc, report) => acc + (report.points || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4">Report History</h2>
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">Loading reports...</p>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No reports submitted yet. Submit your first report above!</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="size-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.id}</p>
                      <p className="text-sm text-muted-foreground">{report.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3 text-gray-400" />
                    <span className="text-muted-foreground truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3 text-gray-400" />
                    <span className="text-muted-foreground">{report.date}</span>
                  </div>
                </div>
                
                {report.points > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-sm text-green-600 font-medium">
                      +{report.points} points earned
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}