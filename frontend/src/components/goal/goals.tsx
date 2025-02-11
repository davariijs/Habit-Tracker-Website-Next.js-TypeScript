
'use client';
import { useState } from 'react';
import { Goal, useGoals } from '../../hooks/useGoals';
import { useSession} from 'next-auth/react';
export default function Goals() {
    const { data: session, status } = useSession(); // Get session data
    const userId = session?.user?.id ?? null;

    console.log(userId);

  const { goals, isLoading, isError, addGoal, editGoal, deleteGoal } = useGoals(userId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [editGoalData, setEditGoalData] = useState<null | Goal>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading goals.</div>;
  if (!userId) return <div>Please log in.</div>; // Or redirect to login page

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addGoal(formData);
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
            });
        } catch (error: any) {
            // Handle errors (e.g., display an error message)
            console.error("Failed to add goal:", error);
            alert(error.message); // Simple error display (consider a better UI)
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editGoalData) return;

        try {
            await editGoal(editGoalData);
            setEditGoalData(null); // Clear edit form
        } catch (error: any) {
            console.error("Failed to update goal:", error);
            alert(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteGoal(id);
        } catch (error: any) {
            console.error("Failed to delete goal:", error);
            alert(error.message);
        }
    };

    const handleEditClick = (goal: {
        _id: string;
        title: string;
        userId: string;
        description: string;
        startDate: string;
        endDate: string;
    }) => {
        setEditGoalData(goal);
    };
  return (
      <div style={{ padding: '20px' }}>
          <h1>Goals</h1>

          {/* Add Goal Form */}
          <h2>Add Goal</h2>
          <form onSubmit={handleAddSubmit}>
              <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
              />
              <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
              />
              <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
              />
              <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
              />
              <button type="submit">Add Goal</button>
          </form>

          {/* Edit Goal Form (conditionally rendered) */}
          {editGoalData && (
              <>
                  <h2>Edit Goal</h2>
                  <form onSubmit={handleEditSubmit}>
                      <input
                          type="text"
                          placeholder="Title"
                          value={editGoalData.title}
                          onChange={(e) => setEditGoalData({ ...editGoalData, title: e.target.value })}
                          required
                      />
                      <textarea
                          placeholder="Description"
                          value={editGoalData.description}
                          onChange={(e) => setEditGoalData({ ...editGoalData, description: e.target.value })}
                          required
                      />
                      <input
                          type="date"
                          value={editGoalData.startDate}
                          onChange={(e) => setEditGoalData({ ...editGoalData, startDate: e.target.value })}
                          required
                      />
                      <input
                          type="date"
                          value={editGoalData.endDate}
                          onChange={(e) => setEditGoalData({ ...editGoalData, endDate: e.target.value })}
                          required
                      />
                      <button type="submit">Update Goal</button>
                      <button type="button" onClick={() => setEditGoalData(null)}>Cancel</button>
                  </form>
              </>
          )}

          {/* Goal List */}
          <h2>Goal List</h2>
          <ul>
              {goals?.map((goal) => (
                  <li key={goal._id}>
                      <h3>{goal.title}</h3>
                      <p>{goal.description}</p>
                      <p>
                          Start: {goal.startDate} - End: {goal.endDate}
                      </p>
                      <button onClick={() => handleEditClick(goal)}>Edit</button>
                      <button onClick={() => handleDelete(goal._id)}>Delete</button>
                  </li>
              ))}
          </ul>
      </div>
  );
}