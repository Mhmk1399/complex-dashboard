import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  storeId: string;
  phone: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export const Costumers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with actual token
        if (!token) {
          throw new Error('No token found');
        }
        const response = await fetch('/api/storesusers', {
          headers: {
            'Authorization': `${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        setUsers(data.users);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (<div>
    {users.length === 0 && <div className="text-center w-fit mx-auto text-white text-xl font-bold bg-red-500 py-2 px-4 italic rounded-lg">No users found</div>}
    <div className="flex flex-wrap justify-center p-4">
    {users.map(user => (
      <div key={user._id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 m-4 w-80 text-center">
        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-600"><strong>Phone:</strong> {user.phone}</p>
        <p className="text-gray-600"><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-600"><strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
      </div>
    ))}
  </div></div>
  );
}

