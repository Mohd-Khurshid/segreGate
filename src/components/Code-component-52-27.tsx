import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award,
  Leaf,
  Recycle,
  Droplets,
  Wind,
  Zap,
  Lock
} from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface TrainingModule {
  id: string;
  name: string;
  description: string;
  duration: string;
  progress: number;
  completed: boolean;
  locked: boolean;
  icon: React.ReactNode;
  category: string;
  points: number;
}

const mockTrainingModules: TrainingModule[] = [
  {
    id: 'waste-sorting',
    name: 'Waste Sorting Basics',
    description: 'Learn the fundamentals of proper waste sorting and recycling',
    duration: '15 min',
    progress: 100,
    completed: true,
    locked: false,
    icon: <Recycle className="size-5" />,
    category: 'Basics',
    points: 50
  },
  {
    id: 'composting',
    name: 'Home Composting',
    description: 'Start your own composting system at home',
    duration: '20 min',
    progress: 75,
    completed: false,
    locked: false,
    icon: <Leaf className="size-5" />,
    category: 'Advanced',
    points: 75
  },
  {
    id: 'water-conservation',
    name: 'Water Conservation',
    description: 'Effective techniques to reduce water waste',
    duration: '12 min',
    progress: 0,
    completed: false,
    locked: false,
    icon: <Droplets className="size-5" />,
    category: 'Environment',
    points: 60
  },
  {
    id: 'energy-saving',
    name: 'Energy Efficiency',
    description: 'Reduce your carbon footprint with energy-saving tips',
    duration: '18 min',
    progress: 0,
    completed: false,
    locked: true,
    icon: <Zap className="size-5" />,
    category: 'Environment',
    points: 80
  },
  {
    id: 'air-quality',
    name: 'Air Quality Improvement',
    description: 'How waste management affects air quality',
    duration: '25 min',
    progress: 0,
    completed: false,
    locked: true,
    icon: <Wind className="size-5" />,
    category: 'Advanced',
    points: 100
  }
];

interface TrainingProps {
  onTrainingUpdate?: () => void;
}

export function Training({ onTrainingUpdate }: TrainingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modules, setModules] = useState<TrainingModule[]>(mockTrainingModules);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [isLearning, setIsLearning] = useState(false);

  const totalProgress = Math.round(
    modules.reduce((sum, module) => sum + module.progress, 0) / modules.length
  );

  const completedModules = modules.filter(m => m.completed).length;

  const handleStartModule = async (module: TrainingModule) => {
    if (module.locked) {
      toast.error('Complete previous modules to unlock this one');
      return;
    }

    setSelectedModule(module);
    setIsLearning(true);

    // Simulate learning progress
    const progressInterval = setInterval(() => {
      setModules(prev => prev.map(m => {
        if (m.id === module.id && m.progress < 100) {
          const newProgress = Math.min(m.progress + 10, 100);
          const isCompleted = newProgress === 100;
          
          if (isCompleted) {
            toast.success(`Congratulations! You completed "${m.name}" and earned ${m.points} points!`);
            // Unlock next module
            const currentIndex = prev.findIndex(mod => mod.id === m.id);
            if (currentIndex < prev.length - 1) {
              prev[currentIndex + 1].locked = false;
            }
          }
          
          return { 
            ...m, 
            progress: newProgress,
            completed: isCompleted
          };
        }
        return m;
      }));

      if (module.progress >= 90) {
        clearInterval(progressInterval);
        setIsLearning(false);
        setSelectedModule(null);
        
        if (onTrainingUpdate) {
          onTrainingUpdate();
        }
      }
    }, 1000);

    return () => clearInterval(progressInterval);
  };

  const handleContinueTraining = () => {
    const nextModule = modules.find(m => !m.completed && !m.locked);
    if (nextModule) {
      handleStartModule(nextModule);
    } else {
      toast.success('All available modules completed!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
          Continue Training
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            EcoTrack Training Center
          </DialogTitle>
          <DialogDescription>
            Complete training modules to become a better environmental citizen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{completedModules} of {modules.length} completed</span>
                  <span>{modules.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0)} points earned</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Continue */}
          <div className="flex gap-2">
            <Button 
              onClick={handleContinueTraining}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLearning}
            >
              {isLearning ? (
                <>
                  <Clock className="size-4 mr-2 animate-spin" />
                  Learning...
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2" />
                  Continue Learning
                </>
              )}
            </Button>
          </div>

          {/* Modules List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Training Modules</h3>
            {modules.map((module) => (
              <Card 
                key={module.id} 
                className={`transition-all ${module.locked ? 'opacity-50' : 'hover:shadow-md'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      module.completed ? 'bg-green-100 text-green-600' : 
                      module.locked ? 'bg-gray-100 text-gray-400' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {module.locked ? <Lock className="size-5" /> : module.icon}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {module.category}
                          </Badge>
                          {module.completed && (
                            <CheckCircle className="size-5 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {module.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="size-3" />
                            {module.points} pts
                          </span>
                        </div>
                        
                        {!module.locked && (
                          <Button
                            size="sm"
                            variant={module.completed ? "outline" : "default"}
                            onClick={() => handleStartModule(module)}
                            disabled={isLearning}
                          >
                            {module.completed ? "Review" : 
                             module.progress > 0 ? "Continue" : "Start"}
                          </Button>
                        )}
                      </div>
                      
                      {module.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}