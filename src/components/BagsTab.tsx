import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { QrCode, Package, Star, Calendar } from 'lucide-react';
import { api } from '../utils/api';

export function BagsTab() {
  const [bags, setBags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadBags();
  }, []);

  const loadBags = async () => {
    try {
      const response = await api.getBags();
      setBags(response.bags || []);
    } catch (error) {
      console.error('Failed to load bags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanQR = async () => {
    setIsScanning(true);
    
    // Mock QR scanning - in real app would use camera
    try {
      const mockQRData = {
        type: 'Organic Waste',
        weight: '2.1 kg',
        qrCode: 'QR' + Date.now()
      };
      
      await api.addBag(mockQRData);
      await loadBags(); // Refresh the list
      alert('Bag added successfully!');
    } catch (error) {
      console.error('Failed to add bag:', error);
      alert('Failed to add bag. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">My Bags</h1>
        <Button 
          onClick={handleScanQR}
          disabled={isScanning}
          className="bg-green-600 hover:bg-green-700"
        >
          <QrCode className="size-4 mr-2" />
          {isScanning ? 'Scanning...' : 'Scan New Bag QR'}
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{bags.length}</p>
                <p className="text-sm text-muted-foreground">Total Bags</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {bags.filter(bag => bag.status === 'collected').length}
                </p>
                <p className="text-sm text-muted-foreground">Collected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {bags.length > 0 ? 
                    Math.round(bags.reduce((acc, bag) => acc + (bag.score || 0), 0) / bags.length) : 
                    0
                  }
                </p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2>Bag History</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">Loading bags...</p>
              </CardContent>
            </Card>
          ) : bags.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No bags found. Scan a QR code to add your first bag!</p>
              </CardContent>
            </Card>
          ) : (
            bags.map((bag) => (
            <Card key={bag.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="size-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{bag.id}</p>
                      <p className="text-sm text-muted-foreground">{bag.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(bag.status)}>
                    {bag.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="size-3 text-yellow-500" />
                    <span>{bag.score > 0 ? `${bag.score} pts` : '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3 text-gray-400" />
                    <span>{bag.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{bag.weight}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}