import { TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

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
  const [users, setUsers] = useState<User[]>(
    [
      {
        _id: "1",
        name: "John Doe",
        storeId: "store123",
        phone: "+1234567890",
        password: "hashedpassword",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        _id: "2",
        name: "Jane Smith",
        storeId: "store123",
        phone: "+1987654321",
        password: "hashedpassword",
        createdAt: "2024-01-14T15:30:00Z",
        updatedAt: "2024-01-14T15:30:00Z"
      },
      {
        _id: "3",
        name: "Mike Johnson",
        storeId: "store123",
        phone: "+1122334455",
        password: "hashedpassword",
        createdAt: "2024-01-13T09:15:00Z",
        updatedAt: "2024-01-13T09:15:00Z"
      }    
  ]
);
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
  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user._id !== userId));
    toast.success(`User deleted successfully`);
  };

  if (loading) return <div>Loading...</div>;
if(users.length === 0) return (
<div className="pb-4">
<div className="min-h-[400px] lg:w-1/3 w-11/12 mx-auto flex flex-col items-center justify-center p-6  bg-sky-50 rounded-lg shadow-lg  ">
    <div className="mb-6">
      <svg className="w-24 h-24 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-700 mb-2">!!هیچ مشتری یافت نشد</h3>
    <p className="text-gray-500 text-center max-w-md mb-6">در حال حاضر هیچ مشتری در سیستم ثبت نشده است. مشتریان جدید به محض ثبت نام در اینجا نمایش داده خواهند شد</p>
   
  </div>
</div>
);
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="py-8" dir="rtl">
      <h2 className="text-2xl font-bold text-center mx-16 mb-6">مدیریت مشتریان</h2>
      <div className="overflow-x-auto lg:mx-16 mx-6 bg-white rounded-lg shadow">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-500">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                نام مشتری
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                شماره تماس
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                تاریخ عضویت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-100 uppercase tracking-wider">
                آخرین بروزرسانی
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-100 uppercase tracking-wider">
                عملیات ها
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500" dir="ltr">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.updatedAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex justify-center items-center">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer rtl={true} />
    </div>
  );
};


