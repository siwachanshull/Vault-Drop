import DashboardLayout from "@/Layout/DashboardLayout";


const Dashboard = () => {
    return(
       <DashboardLayout activeMenu="Dashboard">
        <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Dashboard Page</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome to your dashboard! Here you can manage your files, view recent activity, and access other features.</p>
        </div>
       </DashboardLayout>
    );
};
export default Dashboard; 