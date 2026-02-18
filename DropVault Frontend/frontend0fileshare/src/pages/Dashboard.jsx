import DashboardLayout from "@/Layout/DashboardLayout";


const Dashboard = () => {
    return(
       <DashboardLayout activeMenu="Dashboard">
        <div>
                <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
                <p>Welcome to your dashboard! Here you can manage your files, view recent activity, and access other features.</p>
        </div>
       </DashboardLayout>
    );
};
export default Dashboard; 