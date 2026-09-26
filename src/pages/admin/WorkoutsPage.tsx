import React, { useState, useEffect } from 'react';
import { Activity, Search, Eye, Edit2, Plus, Trash2, CheckCircle, Archive, Dumbbell, Save } from 'lucide-react';
import { api } from '../../api/api';
import StatusBadge from '../../components/admin/StatusBadge';
import SlideOver from '../../components/admin/SlideOver';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal';

interface MemberItem {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface Exercise {
  id?: string;
  name: string;
  description?: string;
  sets: number;
  repetitions: number;
  duration?: number;
  restTime?: number;
  order: number;
  notes?: string;
}

interface WorkoutItem {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  duration: number | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  memberId: string;
  member: { firstName: string; lastName: string };
  trainerId: string;
  trainer: { firstName: string; lastName: string };
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Selected Workout (SlideOver)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverMode, setSlideOverMode] = useState<'VIEW' | 'EDIT' | 'ADD'>('VIEW');
  
  // Form State for Workout
  const [form, setForm] = useState({
    title: '',
    memberId: '',
    description: '',
    goal: '',
    duration: '',
    difficulty: 'BEGINNER',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Deactivate/Activate Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [workoutToModify, setWorkoutToModify] = useState<{ id: string; action: 'COMPLETED' | 'ARCHIVED' | 'ACTIVE' | 'DELETE' } | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [workoutsData, membersData] = await Promise.all([
        api.get(`/workouts`),
        api.get(`/users?role=MEMBER`)
      ]);
      
      let filtered = workoutsData;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter((w: WorkoutItem) => 
          w.title.toLowerCase().includes(lowerSearch) || 
          w.member.firstName.toLowerCase().includes(lowerSearch) ||
          w.member.lastName.toLowerCase().includes(lowerSearch) ||
          w.trainer.firstName.toLowerCase().includes(lowerSearch) ||
          w.trainer.lastName.toLowerCase().includes(lowerSearch)
        );
      }
      if (statusFilter) {
        filtered = filtered.filter((w: WorkoutItem) => w.status === statusFilter);
      }
      if (difficultyFilter) {
        filtered = filtered.filter((w: WorkoutItem) => w.difficulty === difficultyFilter);
      }

      setWorkouts(filtered);
      setMembers(membersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter, difficultyFilter]);

  const handleOpenDetails = (workout: WorkoutItem) => {
    setSelectedWorkout(workout);
    setForm({
      title: workout.title,
      memberId: workout.memberId,
      description: workout.description || '',
      goal: workout.goal || '',
      duration: workout.duration?.toString() || '',
      difficulty: workout.difficulty,
      status: workout.status,
    });
    setExercises(workout.exercises || []);
    setSlideOverMode('VIEW');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedWorkout(null);
    setForm({
      title: '',
      memberId: '',
      description: '',
      goal: '',
      duration: '',
      difficulty: 'BEGINNER',
      status: 'ACTIVE',
    });
    setExercises([]);
    setSlideOverMode('ADD');
    setFormError(null);
    setIsSlideOverOpen(true);
  };

  const handleAddExerciseRow = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: 0,
        repetitions: 0,
        order: exercises.length + 1,
      }
    ]);
  };

  const handleRemoveExerciseRow = async (index: number, exerciseId?: string) => {
    if (slideOverMode === 'EDIT' && exerciseId && selectedWorkout) {
      // Immediate API call to delete existing exercise
      try {
        await api.delete(`/workouts/${selectedWorkout.id}/exercises/${exerciseId}`);
      } catch (err: any) {
        setFormError('Failed to delete exercise: ' + err.message);
        return;
      }
    }
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    // re-order
    newExercises.forEach((ex, i) => { ex.order = i + 1; });
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        goal: form.goal || undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
        difficulty: form.difficulty,
        status: form.status,
      };

      if (slideOverMode === 'ADD') {
        // Create Workout
        payload.memberId = form.memberId;
        const res = await api.post(`/workouts`, payload);
        const newWorkoutId = res.workout.id;

        // Add Exercises
        for (const ex of exercises) {
          if (ex.name.trim()) {
            await api.post(`/workouts/${newWorkoutId}/exercises`, {
              name: ex.name,
              description: ex.description || undefined,
              sets: Number(ex.sets),
              repetitions: Number(ex.repetitions),
              duration: ex.duration ? Number(ex.duration) : undefined,
              restTime: ex.restTime ? Number(ex.restTime) : undefined,
              order: ex.order,
              notes: ex.notes || undefined
            });
          }
        }
      } else if (slideOverMode === 'EDIT' && selectedWorkout) {
        // Note: memberId cannot be updated per schema
        await api.patch(`/workouts/${selectedWorkout.id}`, payload);

        // Update/Add exercises
        for (const ex of exercises) {
          if (!ex.name.trim()) continue;
          
          const exPayload = {
            name: ex.name,
            description: ex.description || undefined,
            sets: Number(ex.sets),
            repetitions: Number(ex.repetitions),
            duration: ex.duration ? Number(ex.duration) : undefined,
            restTime: ex.restTime ? Number(ex.restTime) : undefined,
            order: ex.order,
            notes: ex.notes || undefined
          };

          if (ex.id) {
            await api.patch(`/workouts/${selectedWorkout.id}/exercises/${ex.id}`, exPayload);
          } else {
            await api.post(`/workouts/${selectedWorkout.id}/exercises`, exPayload);
          }
        }
      }
      
      setIsSlideOverOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || err.data?.message || 'Failed to save workout.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!workoutToModify) return;
    setIsModifying(true);
    try {
      if (workoutToModify.action === 'DELETE') {
        await api.delete(`/workouts/${workoutToModify.id}`);
      } else {
        await api.patch(`/workouts/${workoutToModify.id}`, { status: workoutToModify.action });
      }
      setIsConfirmModalOpen(false);
      
      if (selectedWorkout?.id === workoutToModify.id) {
        setIsSlideOverOpen(false);
      }
      
      fetchData();
    } catch (err: any) {
      alert(err.message || err.data?.message || 'Action failed');
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workouts Management</h1>
          <p className="text-gray-400 mt-1">View, search, and manage member workout plans.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> Add Workout
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by title, member, or trainer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none sm:min-w-[150px]"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm appearance-none sm:min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan & Difficulty</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trainer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Exercises</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">Loading workouts...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-red-400 hover:text-red-300">Try again</button>
                  </td>
                </tr>
              ) : workouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Activity size={40} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-sm">No workouts found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-red-500 font-bold uppercase">
                            <Dumbbell size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{w.title}</div>
                          <div className="text-sm text-gray-400">{w.difficulty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {w.member.firstName} {w.member.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {w.trainer.firstName} {w.trainer.lastName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {w.exercises?.length || 0} exercises
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenDetails(w)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {w.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => {
                              setWorkoutToModify({ id: w.id, action: 'COMPLETED' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="text-green-500/70 hover:text-green-500 transition-colors"
                            title="Mark Completed"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : null}

                        <button 
                          onClick={() => {
                            setWorkoutToModify({ id: w.id, action: 'DELETE' });
                            setIsConfirmModalOpen(true);
                          }}
                          className="text-red-500/70 hover:text-red-500 transition-colors"
                          title="Delete Workout"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver for Workout Details / Edit / Add */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title={slideOverMode === 'ADD' ? 'Add New Workout' : slideOverMode === 'EDIT' ? 'Edit Workout' : 'Workout Details'}
      >
        <div className="space-y-6 pb-20">
          {slideOverMode === 'VIEW' && selectedWorkout ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedWorkout.status} />
                <button 
                  onClick={() => setSlideOverMode('EDIT')}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                >
                  <Edit2 size={16} /> Edit Workout
                </button>
              </div>
              
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</label>
                    <p className="mt-1 text-white text-lg font-medium">{selectedWorkout.title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</label>
                    <p className="mt-1 text-gray-300">{selectedWorkout.difficulty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member</label>
                    <p className="mt-1 text-gray-300">{selectedWorkout.member.firstName} {selectedWorkout.member.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</label>
                    <p className="mt-1 text-gray-300">{selectedWorkout.trainer.firstName} {selectedWorkout.trainer.lastName}</p>
                  </div>
                </div>
                {selectedWorkout.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                    <p className="mt-1 text-gray-300 text-sm whitespace-pre-wrap">{selectedWorkout.description}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Dumbbell size={18} className="text-red-500"/> Exercises
                </h4>
                {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWorkout.exercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="bg-gray-900 border border-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-white">{ex.order}. {ex.name}</h5>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {ex.sets} Sets × {ex.repetitions} Reps
                          </span>
                        </div>
                        {ex.notes && <p className="text-xs text-gray-400 mt-2">Note: {ex.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No exercises added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                  <p className="text-sm text-red-500">{formError}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Plan Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Plan Title *</label>
                  <input 
                    type="text" 
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. 4-Week Hypertrophy"
                  />
                </div>

                {slideOverMode === 'ADD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Assign to Member *</label>
                    <select 
                      required
                      value={form.memberId}
                      onChange={e => setForm({...form, memberId: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="" disabled>Select a member</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} {!m.isActive ? '(Inactive)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {slideOverMode === 'ADD' && (
                  <p className="text-xs text-gray-500 italic">Note: The trainer assigned will be the currently authenticated user.</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                    <select 
                      value={form.difficulty}
                      onChange={e => setForm({...form, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select 
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Goal (Optional)</label>
                  <input 
                    type="text" 
                    value={form.goal}
                    onChange={e => setForm({...form, goal: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                  <textarea 
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Dumbbell size={18} className="text-red-500"/> Exercises
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-sm flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Plus size={16} /> Add Exercise
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-900 rounded-lg border border-gray-800">
                    No exercises added yet. Click "Add Exercise" to start building the plan.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((ex, idx) => (
                      <div key={ex.id || idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx, ex.id)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                          title="Remove Exercise"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Exercise Name *</label>
                          <input 
                            type="text" 
                            required
                            value={ex.name}
                            onChange={e => updateExercise(idx, 'name', e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-red-500 focus:border-red-500"
                            placeholder="e.g. Barbell Squat"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Sets</label>
                            <input 
                              type="number" 
                              min="0"
                              value={ex.sets}
                              onChange={e => updateExercise(idx, 'sets', e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Reps</label>
                            <input 
                              type="number" 
                              min="0"
                              value={ex.repetitions}
                              onChange={e => updateExercise(idx, 'repetitions', e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Notes (Optional)</label>
                          <input 
                            type="text" 
                            value={ex.notes || ''}
                            onChange={e => updateExercise(idx, 'notes', e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:ring-red-500 focus:border-red-500"
                            placeholder="e.g. Keep back straight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (slideOverMode === 'EDIT' && selectedWorkout) {
                      setSlideOverMode('VIEW');
                    } else {
                      setIsSlideOverOpen(false);
                    }
                    setFormError(null);
                  }}
                  className="flex-1 py-2.5 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : slideOverMode === 'ADD' ? 'Create Workout' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </SlideOver>

      {/* Confirmation Modal */}
      <ConfirmActionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isModifying}
        title={
          workoutToModify?.action === 'DELETE' ? 'Delete Workout' : 
          workoutToModify?.action === 'COMPLETED' ? 'Complete Workout' : 
          'Update Status'
        }
        message={
          workoutToModify?.action === 'DELETE' ? 'Are you sure you want to permanently delete this workout plan and all its exercises? This action cannot be undone.' :
          workoutToModify?.action === 'COMPLETED' ? 'Are you sure you want to mark this workout plan as completed?' :
          'Are you sure you want to change the status of this workout?'
        }
        confirmText={
          workoutToModify?.action === 'DELETE' ? 'Delete Workout' : 
          workoutToModify?.action === 'COMPLETED' ? 'Mark Completed' : 
          'Confirm'
        }
        isDestructive={workoutToModify?.action === 'DELETE'}
      />
    </div>
  );
};

export default WorkoutsPage;
